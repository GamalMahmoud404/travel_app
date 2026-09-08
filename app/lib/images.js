/* ==========================================================================
   التحقق من الصورة الشخصية: إما رابط https أو data URL لصورة مصغّرة.
   التصغير يحدث في المتصفح (AvatarPicker)؛ هنا نتحقق من النوع والحجم فقط.
   ========================================================================== */

const DATA_URL = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
export const MAX_AVATAR_BYTES = 400 * 1024;

/**
 * @returns {{ ok: true, value: string } | { ok: false, error: string }}
 */
export function normalizeAvatar(input, fallback) {
  const value = String(input ?? '').trim();

  if (!value) {
    return fallback ? { ok: true, value: fallback } : { ok: false, error: 'الصورة الشخصية مطلوبة.' };
  }

  if (value.startsWith('https://')) return { ok: true, value };

  if (!value.startsWith('data:')) {
    return { ok: false, error: 'صيغة الصورة غير مدعومة.' };
  }

  if (!DATA_URL.test(value)) {
    return { ok: false, error: 'اختر صورة بصيغة JPEG أو PNG أو WebP.' };
  }

  // طول base64 ≈ 4/3 من حجم الملف
  const bytes = Math.floor((value.length - value.indexOf(',') - 1) * 0.75);
  if (bytes > MAX_AVATAR_BYTES) {
    return { ok: false, error: 'حجم الصورة كبير — اختر صورة أصغر.' };
  }

  return { ok: true, value };
}
