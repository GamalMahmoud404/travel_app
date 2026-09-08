/**
 * تمييز فشل الاتصال بقاعدة البيانات عن أخطاء المنطق.
 * فشل الاتصال يجب أن يعني «غير مسجَّل» أو رسالة واضحة — لا انهيار الصفحة،
 * ولا منح صلاحية بالخطأ.
 */
const PATTERNS = [
  /Server selection timeout/i,
  /received fatal alert/i,
  /InternalError/i,
  /ECONNREFUSED/i,
  /ENOTFOUND/i,
  /querySrv/i,
  /Connection refused/i,
  /P1001/, // Can't reach database server
  /P1017/, // Server has closed the connection
  /P2010/, // Raw query failed
];

export function isDbUnreachable(error) {
  const text = `${error?.code ?? ''} ${error?.message ?? ''} ${error?.name ?? ''}`;
  return PATTERNS.some((re) => re.test(text));
}

export const DB_DOWN_MESSAGE =
  'تعذّر الوصول إلى قاعدة البيانات حاليًا. راجع Network Access في MongoDB Atlas (أضف عنوان IP الحالي) وتأكد أن الكلاستر يعمل، ثم أعد المحاولة.';

/* ==========================================================================
   قاطع دورة (circuit breaker).

   السبب: عند تعذّر الكلاستر ينتظر سائق MongoDB مهلة اختيار الخادم كاملة قبل
   أن يفشل، وكل استعلام في كل طلب يدفع المهلة من جديد — فتسجيل الدخول يتجمّد
   ثوانٍ ثم يعرض الرسالة. بعد أول فشل نُسقط الاستعلامات فورًا خلال فترة تهدئة،
   فتظهر الرسالة في اللحظة نفسها. بعد التهدئة يُسمح لمحاولة واحدة بالمرور
   (نصف مفتوحة) — فبعودة القاعدة يعود الموقع بلا تدخّل.
   ========================================================================== */

const COOLDOWN_MS = 5_000;

// عبر globalThis فلا يفقد الحالة مع hot-reload في التطوير
const circuit = (globalThis.__rehlatyDbCircuit ??= { failedAt: 0, probing: false });

export class DbUnreachableError extends Error {
  constructor() {
    super(DB_DOWN_MESSAGE);
    this.name = 'DbUnreachableError';
    this.code = 'P1001';
  }
}

/** هل نُسقط الاستعلام فورًا بدل انتظار المهلة؟ */
export function dbCircuitOpen() {
  if (!circuit.failedAt) return false;
  if (circuit.probing) return true; // محاولة الاستطلاع جارية — لا نُضاعف الانتظار
  if (Date.now() - circuit.failedAt < COOLDOWN_MS) return true;

  circuit.probing = true; // نصف مفتوحة: هذه المحاولة وحدها تمر
  return false;
}

export function noteDbReachable() {
  if (circuit.failedAt || circuit.probing) {
    circuit.failedAt = 0;
    circuit.probing = false;
  }
}

export function noteDbUnreachable() {
  circuit.failedAt = Date.now();
  circuit.probing = false;
}
