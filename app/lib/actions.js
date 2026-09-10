'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import prisma from './prisma';
import {
  endSession,
  getSessionUser,
  hashPassword,
  refreshUserHint,
  startSession,
  verifyPassword,
} from './auth';
import { normalizeAvatar } from './images';
import { DB_DOWN_MESSAGE, isDbUnreachable } from './db-status';
import { getCheckoutSummary } from './queries';
import { buildFavorite } from './favorites';
import { permissionsOf } from './permissions';
import { collections, parseField } from './content-schema';

const safeNext = (value) =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/';

export async function loginAction(_prev, formData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = safeNext(formData.get('next'));

  if (!email || !password) {
    return { error: 'أدخل البريد الإلكتروني وكلمة المرور.', email };
  }

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch (error) {
    if (isDbUnreachable(error)) return { error: DB_DOWN_MESSAGE, email };
    throw error;
  }

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.', email };
  }

  await startSession(user);
  redirect(next);
}

export async function logoutAction() {
  await endSession();
  redirect('/login');
}

export async function registerAction(_prev, formData) {
  const values = {
    fullName: String(formData.get('fullName') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim().toLowerCase(),
    phone: String(formData.get('phone') ?? '').trim(),
  };
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');
  const next = safeNext(formData.get('next'));

  const fail = (error) => ({ error, values });

  if (!values.fullName || !values.email || !password) {
    return fail('املأ الاسم والبريد الإلكتروني وكلمة المرور.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) {
    return fail('صيغة البريد الإلكتروني غير صحيحة.');
  }
  if (password.length < 8) {
    return fail('كلمة المرور يجب أن تكون 8 أحرف على الأقل.');
  }
  if (password !== confirm) {
    return fail('كلمتا المرور غير متطابقتين.');
  }

  try {
    if (await prisma.user.findUnique({ where: { email: values.email } })) {
      return fail('هذا البريد الإلكتروني مسجّل بالفعل — سجّل الدخول بدلًا من ذلك.');
    }
  } catch (error) {
    if (isDbUnreachable(error)) return fail(DB_DOWN_MESSAGE);
    throw error;
  }

  const site = await prisma.siteSetting.findUnique({ where: { key: 'main' } });
  const avatar = normalizeAvatar(formData.get('avatar'), site.defaultAvatar);
  if (!avatar.ok) return fail(avatar.error);

  // أول حساب يُنشأ في موقع فارغ يصبح أدمن حتى تكون لوحة التحكم قابلة للوصول
  const isFirstAccount = (await prisma.user.count()) === 0;

  const user = await prisma.user.create({
    data: {
      name: values.fullName.split(' ')[0],
      fullName: values.fullName,
      email: values.email,
      phone: values.phone || '—',
      avatar: avatar.value,
      role: isFirstAccount ? 'admin' : 'user',
      passwordHash: hashPassword(password),
    },
  });

  updateTag('users'); // جدول لوحة التحكم مخزَّن
  await startSession(user);
  redirect(next);
}

export async function updateProfileAction(_prev, formData) {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=%2Faccount');

  const values = {
    fullName: String(formData.get('fullName') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim().toLowerCase(),
    phone: String(formData.get('phone') ?? '').trim(),
    phoneAlt: String(formData.get('phoneAlt') ?? '').trim(),
  };
  const fail = (error) => ({ error, values });

  if (!values.fullName) return fail('الاسم بالكامل مطلوب.');
  if (!/^[^s@]+@[^s@]+.[^s@]{2,}$/.test(values.email)) {
    return fail('صيغة البريد الإلكتروني غير صحيحة.');
  }

  const taken = await prisma.user.findUnique({ where: { email: values.email } });
  if (taken && taken.id !== user.id) {
    return fail('هذا البريد الإلكتروني مستخدم بحساب آخر.');
  }

  const avatar = normalizeAvatar(formData.get('avatar'), user.avatar);
  if (!avatar.ok) return fail(avatar.error);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: values.fullName.split(' ')[0],
      fullName: values.fullName,
      email: values.email,
      phone: values.phone || '—',
      phoneAlt: values.phoneAlt || null,
      avatar: avatar.value,
    },
  });

  await refreshUserHint(updated);
  updateTag('users'); // الاسم والصورة يظهران في جدول لوحة التحكم
  revalidatePath('/', 'layout');
  return { ok: 'تم حفظ التعديلات.' };
}

/* ==========================================================================
   المفضلة — إجراء واحد يضيف ويحذف.

   يُستدعى من زر القلب مباشرة (بلا نموذج) فيبقى موضع الزر داخل البطاقة كما هو.
   المُرسَل: النوع والمُعرّف ومسار العودة فقط — واللقطة تُبنى في الخادم من
   الكتالوج. يعيد الحالة الجديدة ليُصحّح الزر تفاؤله إن اختلفت.
   ========================================================================== */

export async function toggleFavoriteAction({ kind, slug, from }) {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(safeNext(from))}`);
  if (!(await permissionsOf(user)).has('bookings.own')) return { ok: false };

  if (typeof kind !== 'string' || typeof slug !== 'string' || !kind || !slug) {
    return { ok: false };
  }

  try {
    const existing = await prisma.favorite.findFirst({
      where: { userId: user.id, kind, slug },
      select: { id: true },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
    } else {
      const snapshot = await buildFavorite(kind, slug);
      if (!snapshot) return { ok: false };

      const order = await prisma.favorite.count({ where: { userId: user.id } });
      await prisma.favorite.create({ data: { ...snapshot, kind, slug, order, userId: user.id } });
    }

    revalidatePath('/account/favorites');
    return { ok: true, on: !existing };
  } catch (error) {
    if (isDbUnreachable(error)) return { ok: false, error: DB_DOWN_MESSAGE };
    throw error;
  }
}

/* ==========================================================================
   وسائل الدفع — نحفظ النوع وآخر 4 أرقام فقط. لا رقم كامل ولا CVV.
   ========================================================================== */

function detectBrand(digits) {
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^(507803|5078)/.test(digits)) return 'meeza';
  return 'card';
}

export async function addCardAction(_prev, formData) {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=%2Faccount%2Fpayments');

  const holder = String(formData.get('holder') ?? '').trim();
  const digits = String(formData.get('number') ?? '').replace(/\D/g, '');
  const expiry = String(formData.get('expiry') ?? '').trim();
  const values = { holder, expiry };
  const fail = (error) => ({ error, values });

  if (!holder) return fail('اسم صاحب البطاقة مطلوب.');
  if (digits.length < 13 || digits.length > 19) return fail('رقم البطاقة يجب أن يكون بين 13 و19 رقمًا.');

  const m = expiry.match(/^(\d{1,2})\s*\/\s*(\d{2}|\d{4})$/);
  if (!m) return fail('تاريخ الانتهاء بصيغة MM / YY.');

  const month = Number(m[1]);
  const year = m[2].length === 2 ? 2000 + Number(m[2]) : Number(m[2]);
  if (month < 1 || month > 12) return fail('الشهر غير صحيح.');

  const now = new Date();
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
    return fail('البطاقة منتهية الصلاحية.');
  }

  const last4 = digits.slice(-4);
  const existing = await prisma.paymentCard.count({ where: { userId: user.id } });

  const duplicate = await prisma.paymentCard.findFirst({
    where: { userId: user.id, last4, expMonth: month, expYear: year },
  });
  if (duplicate) return fail('هذه البطاقة مضافة بالفعل.');

  await prisma.paymentCard.create({
    data: {
      brand: detectBrand(digits),
      last4,
      holder: holder.toUpperCase(),
      expMonth: month,
      expYear: year,
      isDefault: existing === 0,
      userId: user.id,
    },
  });

  revalidatePath('/account/payments');
  return { ok: `تمت إضافة البطاقة المنتهية بـ ${last4}.` };
}

export async function setDefaultCardAction(formData) {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=%2Faccount%2Fpayments');

  const id = String(formData.get('id') ?? '');
  const card = await prisma.paymentCard.findUnique({ where: { id } });
  if (!card || card.userId !== user.id) return;

  await prisma.paymentCard.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  await prisma.paymentCard.update({ where: { id }, data: { isDefault: true } });
  revalidatePath('/account/payments');
}

export async function deleteCardAction(formData) {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=%2Faccount%2Fpayments');

  const id = String(formData.get('id') ?? '');
  const card = await prisma.paymentCard.findUnique({ where: { id } });
  if (!card || card.userId !== user.id) return;

  await prisma.paymentCard.delete({ where: { id } });

  if (card.isDefault) {
    const next = await prisma.paymentCard.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });
    if (next) await prisma.paymentCard.update({ where: { id: next.id }, data: { isDefault: true } });
  }

  revalidatePath('/account/payments');
}

/* ------------------------------------------------------------- الإشعارات */

export async function toggleNotifyAction(formData) {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=%2Faccount%2Fnotifications');

  const key = String(formData.get('key') ?? '');
  const setting = await prisma.notificationSetting.findUnique({ where: { key } });
  if (!setting) return;

  const off = new Set(user.notifyOff ?? []);
  if (off.has(key)) off.delete(key);
  else off.add(key);

  await prisma.user.update({ where: { id: user.id }, data: { notifyOff: [...off] } });
  revalidatePath('/account/notifications');
}

export async function markAllReadAction() {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=%2Faccount%2Fnotifications');

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  revalidatePath('/account/notifications');
}

export async function deleteNotificationAction(formData) {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=%2Faccount%2Fnotifications');

  const id = String(formData.get('id') ?? '');
  const row = await prisma.notification.findUnique({ where: { id } });
  if (!row || row.userId !== user.id) return;

  await prisma.notification.delete({ where: { id } });
  revalidatePath('/account/notifications');
}

/* ==========================================================================
   إدارة صفات المستخدمين — يحتاج صلاحية users.write
   ========================================================================== */

export async function setUserRoleAction(formData) {
  const actor = await getSessionUser();
  if (!actor) redirect('/login?next=%2Fadmin');

  const allowed = await permissionsOf(actor);
  if (!allowed.has('users.write')) return;

  const id = String(formData.get('id') ?? '');
  const role = String(formData.get('role') ?? '');

  const target = await prisma.user.findUnique({ where: { id } });
  const roleDoc = await prisma.role.findUnique({ where: { key: role } });
  if (!target || !roleDoc) return;

  // لا يغيّر أحد صفة نفسه، ولا يُترك الموقع بلا أدمن
  if (target.id === actor.id) return;

  if (target.role === 'admin' && role !== 'admin') {
    const admins = await prisma.user.count({ where: { role: 'admin' } });
    if (admins <= 1) return;
  }

  await prisma.user.update({ where: { id }, data: { role } });
  updateTag('users');
  revalidatePath('/admin');
}

/* ==========================================================================
   رأي العميل — يكتبه المستخدم من صفحة «آراء العملاء» لا من لوحة التحكم.

   الاسم والصورة من ملفه الشخصي (لا يكتبهما)، والتحقق من نفس وصف الحقول الذي
   تستعمله اللوحة — فرسائل الخطأ واحدة في الموضعين.
   رأي واحد لكل مستخدم: الثاني يُحدّث الأول بدل أن يُكرّره في الصفحة.
   ========================================================================== */

const REVIEW_TEXT_MAX = 600;

export async function addReviewAction(_prev, formData) {
  const user = await getSessionUser();
  const values = {
    trip: String(formData.get('trip') ?? ''),
    rating: String(formData.get('rating') ?? ''),
    text: String(formData.get('text') ?? ''),
  };
  const fail = (error) => ({ error, values });

  if (!user) return fail('سجّل الدخول أولًا لتشارك رأيك.');

  const fields = collections.reviews.fields;
  const data = {};
  for (const name of ['trip', 'rating', 'text']) {
    const parsed = parseField(fields.find((f) => f.name === name), values[name]);
    if (!parsed.ok) return fail(parsed.error);
    data[name] = parsed.value;
  }

  if (data.text.length > REVIEW_TEXT_MAX) {
    return fail(`نص الرأي أطول من ${REVIEW_TEXT_MAX} حرفًا — اختصره قليلًا.`);
  }

  try {
    const mine = await prisma.review.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });

    const row = { ...data, name: user.fullName || user.name, avatar: user.avatar, userId: user.id };

    if (mine) await prisma.review.update({ where: { id: mine.id }, data: row });
    else await prisma.review.create({ data: { ...row, order: await prisma.review.count() } });

    updateTag('content'); // صفحة الآراء والرئيسية تقرآن getReviews المخزَّنة
    revalidatePath('/reviews');
    revalidatePath('/admin');

    return { ok: mine ? 'حدّثنا رأيك — شكرًا لك.' : 'نُشر رأيك — شكرًا لمشاركتك.' };
  } catch (error) {
    if (isDbUnreachable(error)) return fail(DB_DOWN_MESSAGE);
    throw error;
  }
}

/* إبطال مخزَّن المحتوى بعد أي تعديل عليه من لوحة التحكم */
export async function revalidateContentAction() {
  const actor = await getSessionUser();
  if (!actor) redirect('/login?next=%2Fadmin');
  if (!(await permissionsOf(actor)).has('content.write')) return;

  updateTag('content');
  revalidatePath('/admin');
}

/* ==========================================================================
   إنشاء الحجز — الخطوة 3 من مسار الحجز.
   ملاحظة: حقول البطاقة في صفحة الدفع بلا name، فلا تُرسَل إلى الخادم أصلًا.
   المُرسَل الوحيد هو معرّف طريقة الدفع.
   ========================================================================== */

const ref = () => `RH${Math.floor(10_000_000 + Math.random() * 89_999_999)}`;

export async function confirmBookingAction(formData) {
  const actor = await getSessionUser();
  if (!actor) redirect('/login?next=%2Fbooking%2Fpayment');
  if (!(await permissionsOf(actor)).has('bookings.own')) redirect('/');

  const method = String(formData.get('pay') ?? 'card');
  const summary = await getCheckoutSummary();
  const { hotel, room, draft } = summary;
  if (!hotel) redirect('/');

  const onArrival = method === 'cash';
  const bookingRef = ref();
  const order = await prisma.booking.count({ where: { userId: actor.id } });

  const dates = draft.rows.filter((r) => r.icon === 'calendar').map((r) => r.val);
  const guests = draft.rows.find((r) => r.icon === 'users')?.val ?? '';
  const nights = draft.rows.find((r) => r.icon === 'clock')?.val ?? `${draft.nights} ليالٍ`;

  await prisma.booking.create({
    data: {
      ref: bookingRef,
      status: onArrival ? 'wait' : 'ok',
      statusLabel: onArrival ? 'في انتظار التأكيد' : 'تم تأكيد الحجز',
      title: hotel.name,
      location: hotel.location,
      image: hotel.image,
      facts: [
        { label: dates.join(' – '), icon: 'calendar' },
        { label: guests, icon: 'users' },
        { label: nights, icon: 'clock' },
        ...(room ? [{ label: room.name, icon: 'bed' }] : []),
      ],
      total: summary.grandTotal,
      actions: onArrival ? ['details', 'cancel'] : ['details', 'invoice', 'cancel'],
      tab: onArrival ? 'pending' : 'upcoming',
      order,
      userId: actor.id,
    },
  });

  await prisma.notification.create({
    data: {
      title: onArrival
        ? `حجزك في ${hotel.name} في انتظار التأكيد`
        : `تم تأكيد حجزك في ${hotel.name}`,
      body: onArrival
        ? `رقم الحجز ${bookingRef} — سنبلغك بالتأكيد خلال 24 ساعة. الدفع عند الوصول: ${summary.grandTotal}.`
        : `رقم الحجز ${bookingRef} — الإجمالي ${summary.grandTotal}. يمكنك تنزيل الفاتورة من صفحة حجوزاتي.`,
      kind: 'booking',
      read: false,
      userId: actor.id,
    },
  });

  revalidatePath('/bookings');
  revalidatePath('/account/notifications');
  redirect(`/booking/confirm?ref=${bookingRef}`);
}

export async function cancelBookingAction(formData) {
  const actor = await getSessionUser();
  if (!actor) redirect('/login?next=%2Fbookings');

  const id = String(formData.get('id') ?? '');
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || booking.userId !== actor.id) return;
  if (booking.status === 'void') return;

  await prisma.booking.update({
    where: { id },
    data: {
      status: 'void',
      statusLabel: 'تم إلغاء الحجز',
      tab: 'cancelled',
      actions: ['details'],
    },
  });

  await prisma.notification.create({
    data: {
      title: `تم إلغاء حجزك: ${booking.title}`,
      body: `رقم الحجز ${booking.ref} — إن كان الإلغاء داخل المدة المجانية يُرد المبلغ خلال 5 أيام عمل.`,
      kind: 'booking',
      read: false,
      userId: actor.id,
    },
  });

  revalidatePath('/bookings');
  revalidatePath('/account/notifications');
}
