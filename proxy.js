import { NextResponse } from 'next/server';

/* ==========================================================================
   بوابة الجلسة قبل التوليد (proxy — كان اسم الملف middleware قبل Next 16).
   السبب: حارس الصفحة يعمل بعد بدء التوليد، فتحويله يصل إلى المتصفح داخل حِمل
   RSC لا كـ 307 — يرى الزائر الصفحة تُرسم ثم ترتدّ. هذا الوسيط يعمل قبل ذلك
   كله ويصدر تحويلًا حقيقيًا.

   يتحقق من توقيع الكوكي وصلاحيته فقط (HMAC عبر Web Crypto) — بلا أي استعلام،
   فيعمل حتى مع تعذّر قاعدة البيانات. أما فحص الصلاحيات (admin.access …) فيبقى
   في الصفحات عبر requirePermission كطبقة دفاع ثانية.
   ========================================================================== */

const COOKIE = 'rehlaty_session';

const PROTECTED = [
  '/account',
  '/bookings',
  '/booking',
  '/admin',
];

const b64urlToBytes = (s) => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=');
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function validSession(token, secret) {
  if (!token || !secret) return false;

  const i = token.lastIndexOf('.');
  if (i < 0) return false;

  const payload = token.slice(0, i);
  const mac = token.slice(i + 1);

  const [userId, expiresAt] = payload.split('.');
  if (!userId || !expiresAt) return false;
  if (Number(expiresAt) < Date.now()) return false;

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    return crypto.subtle.verify('HMAC', key, b64urlToBytes(mac), new TextEncoder().encode(payload));
  } catch {
    return false;
  }
}

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;

  const needsSession = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!needsSession) return NextResponse.next();

  const ok = await validSession(
    request.cookies.get(COOKIE)?.value,
    process.env.AUTH_SECRET,
  );
  if (ok) return NextResponse.next();

  const login = new URL('/login', request.url);
  login.searchParams.set('next', pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/account/:path*', '/account', '/bookings', '/booking/:path*', '/admin'],
};
