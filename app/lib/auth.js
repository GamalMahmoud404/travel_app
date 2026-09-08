import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import crypto from 'node:crypto';
import prisma from './prisma';
import { hashPassword, verifyPassword } from './password';
import { isDbUnreachable } from './db-status';

/* ==========================================================================
   جلسة بكوكي موقَّع (HMAC-SHA256) + كلمات مرور بـ scrypt — بلا مكتبات خارجية.
   ========================================================================== */

export { hashPassword, verifyPassword };

const COOKIE = 'rehlaty_session';
const HINT = 'rehlaty_user'; // تلميح العرض فقط — ليس مصدر ثقة
const MAX_AGE = 60 * 60 * 24 * 30; // 30 يومًا

const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET غير معرّف — أضفه إلى .env');
  return s;
};

/* ----------------------------------------------------------------- التوقيع */

const sign = (payload) =>
  crypto.createHmac('sha256', secret()).update(payload).digest('base64url');

function makeToken(userId) {
  const payload = `${userId}.${Date.now() + MAX_AGE * 1000}`;
  return `${payload}.${sign(payload)}`;
}

function readToken(token) {
  if (!token) return null;
  const i = token.lastIndexOf('.');
  if (i < 0) return null;

  const payload = token.slice(0, i);
  const mac = token.slice(i + 1);
  const expected = sign(payload);

  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  const [userId, expiresAt] = payload.split('.');
  if (!userId || Number(expiresAt) < Date.now()) return null;
  return userId;
}

/* ----------------------------------------------------------------- الجلسة */

export async function startSession(user) {
  const jar = await cookies();
  jar.set(COOKIE, makeToken(user.id), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
  writeHint(jar, user);
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
  jar.delete(HINT);
}

/* ------------------------------------------------------- تلميح الواجهة */

/**
 * الاسم في كوكي مقروء من المتصفح، فتُرسم بطاقة المستخدم في الشريط مع أول رسم
 * بلا انتظار /api/session — والصفحات الثابتة تبقى ثابتة.
 * لا يُمنح به أي وصول: التحقق يبقى على الكوكي الموقَّع httpOnly، والواجهة
 * تصحّح التلميح في الخلفية من نقطة الجلسة.
 *
 * الصورة تُرفَق فقط إن كانت رابطًا قصيرًا. الصورة المرفوعة تُحفَظ data URI
 * بعشرات الكيلوبايت، وحدّ الكوكي الواحد 4KB — فإرفاقها يُسقط الكوكي كاملًا
 * في المتصفح بلا خطأ. بلا صورة تُرسم حروف الاسم الأولى حتى تصل من الجلسة.
 */
const HINT_AVATAR_MAX = 512;

function writeHint(jar, user) {
  const avatar = typeof user.avatar === 'string' && user.avatar.length <= HINT_AVATAR_MAX
    ? user.avatar
    : undefined;

  // base64url: قيمة بلا محارف تحتاج ترميزًا، فلا يزدوج ترميز الكوكي
  const value = Buffer.from(JSON.stringify({ name: user.name, avatar }), 'utf8').toString('base64url');

  jar.set(HINT, value, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

/** يُستدعى بعد تعديل الملف الشخصي حتى لا يبقى الاسم أو الصورة قديمَين */
export async function refreshUserHint(user) {
  writeHint(await cookies(), user);
}

/**
 * المستخدم الحالي أو null.
 * مغلَّف بـ cache() فلا يتكرّر الاستعلام بين layout والصفحة والحارس في الطلب الواحد.
 * بلا كوكي يعود null بلا أي استعلام.
 */
export const getSessionUser = cache(async () => {
  const jar = await cookies();
  const userId = readToken(jar.get(COOKIE)?.value);
  if (!userId) return null;

  try {
    return (await prisma.user.findUnique({ where: { id: userId } })) ?? null;
  } catch (error) {
    // القاعدة غير متاحة: نعتبره «غير مسجَّل» — لا يمنح صلاحية ولا يُسقط الصفحة.
    if (isDbUnreachable(error)) return null;
    throw error;
  }
});

/**
 * يُسقط كوكي جلسة لم يعد يقابله مستخدم — يحدث بعد حذف الحساب أو إعادة زرع
 * القاعدة: التوقيع سليم فيمرّ الحارس في proxy، ثم لا تجد الصفحة المستخدم
 * فتعيده إلى /login بعد هيكل تحميل. حذف الكوكي يقطع هذه الحلقة.
 * لا يُسقط شيئًا عند تعذّر القاعدة — الجلسة سليمة والقاعدة هي الغائبة.
 */
export async function pruneStaleSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return false;

  const drop = () => {
    jar.delete(COOKIE);
    jar.delete(HINT);
    return true;
  };

  const userId = readToken(token);
  if (!userId) return drop(); // توقيع تالف أو صلاحية منتهية

  try {
    const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (exists) return false;
  } catch (error) {
    if (isDbUnreachable(error)) return false;
    throw error;
  }

  return drop();
}

/** يحمي الصفحات الشخصية — يحوّل إلى /login مع العودة للمسار المطلوب */
export async function requireUser(returnTo) {
  const user = await getSessionUser();
  if (!user) redirect(`/login${returnTo ? `?next=${encodeURIComponent(returnTo)}` : ''}`);
  return user;
}

/** يحمي صفحات الأدمن — غير المسجّل يذهب لتسجيل الدخول، والمستخدم العادي إلى 404 */
export async function requireAdmin(returnTo) {
  const user = await requireUser(returnTo);
  if (user.role !== 'admin') notFound();
  return user;
}
