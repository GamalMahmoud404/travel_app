import crypto from 'node:crypto';

/* ==========================================================================
   تعمية كلمات المرور — وحدة نقية بلا اعتماد على Next، فتُستورد من الخادم
   ومن السكربتات والاختبارات على حدٍّ سواء.
   الصيغة المحفوظة: scrypt$<salt hex>$<hash hex>
   ========================================================================== */

const KEY_LEN = 64;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, KEY_LEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;

  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;

  let expected;
  try {
    expected = Buffer.from(hash, 'hex');
  } catch {
    return false;
  }
  if (expected.length !== KEY_LEN) return false;

  const candidate = crypto.scryptSync(password, salt, KEY_LEN);
  return crypto.timingSafeEqual(candidate, expected);
}
