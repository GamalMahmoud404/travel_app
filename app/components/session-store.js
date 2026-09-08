'use client';

/* ==========================================================================
   حالة المستخدم في المتصفح.

   الصفحات العامة ثابتة (ISR) فلا يستطيع الخادم رسم اسم المستخدم ولا حالة
   أزرار القلب فيها. نقطة /api/session تُطلب مرة واحدة لكل تحميل صفحة ويتشارك
   جوابها الشريط وكل أزرار المفضلة — طلب واحد لا عشرة.

   المفتاح هو قيمة كوكي التلميح: يتغيّر بالدخول والخروج، فيُعاد الطلب حينها
   فقط. تسجيل الدخول ينتهي بتنقّل من طرف العميل، فبلا هذا المفتاح تبقى الحالة
   القديمة ظاهرة حتى تحديث الصفحة يدويًا.
   ========================================================================== */

const COOKIE = 'rehlaty_user=';

export function sessionKey() {
  if (typeof document === 'undefined') return '';
  return document.cookie.split('; ').find((c) => c.startsWith(COOKIE))?.slice(COOKIE.length) ?? '';
}

export function readHint(raw) {
  if (!raw) return null;

  try {
    const bytes = Uint8Array.from(
      atob(raw.replace(/-/g, '+').replace(/_/g, '/')),
      (c) => c.charCodeAt(0),
    );
    const user = JSON.parse(new TextDecoder().decode(bytes));
    return user?.name ? user : null;
  } catch {
    return null;
  }
}

let cache = { key: null, promise: null, data: null };

export function loadSession(key) {
  if (cache.key !== key) {
    const promise = fetch('/api/session', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null); // تعذّرت الشبكة: يبقى ما هو معروض

    cache = { key, promise, data: null };
    promise.then((data) => {
      if (cache.promise === promise) cache.data = data;
    });
  }

  return cache.promise;
}

/**
 * يُحدّث القائمة المخزَّنة بعد تبديل مفضلة، فلا يعود القلب فارغًا عند التنقّل
 * إلى صفحة أخرى قبل انتهاء عمر المخزَّن.
 */
export function markFavorite(id, on) {
  const list = cache.data?.favorites;
  if (!Array.isArray(list)) return;

  const next = new Set(list);
  if (on) next.add(id);
  else next.delete(id);
  cache.data.favorites = [...next];
}
