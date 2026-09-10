// اللاحقة صريحة: هذا الملف يُحمَّل في اختبارات node مباشرة، وحلّ ESM هناك
// لا يخمّن الامتداد كما يفعل مُجمِّع Next.
import { normalizeAvatar } from './images.js';

/* ==========================================================================
   وصف مجموعات المحتوى — مصدر واحد تُبنى منه جداول لوحة التحكم ونماذجها
   والتحقق من مدخلاتها.

   كل مجموعة تُعرّف حقولها مرة واحدة، فتُرسَم صفحة الإدارة ويُتحقّق المُرسَل
   ويُقرأ الصف من القاعدة إلى النموذج — بلا ثماني نسخ من الشيفرة نفسها.

   هذا الملف منطق نقي — بلا Prisma ولا Next — فيُختبر بـ npm test.
   ========================================================================== */

/** مفاتيح الأيقونات المتاحة — مرآة لـ app/components/iconMap.js (يحرسها اختبار) */
export const ICON_KEYS = [
  'baby', 'balcony', 'bed', 'bell', 'building', 'bus', 'calendar', 'camera', 'car',
  'cash', 'check', 'clock', 'card', 'dumbbell', 'globe', 'heart', 'parking', 'pin',
  'ship', 'user', 'users', 'utensils', 'wallet', 'waves', 'wifi', 'mail', 'phone',
  'tag', 'ticket', 'xcircle',
];

const f = (name, label, type, opts = {}) => ({ name, label, type, ...opts });

const ICON_HINT = `سطر لكل عنصر بصيغة: النص | الأيقونة — الأيقونات المتاحة: ${ICON_KEYS.join('، ')}`;

const ORDER = f('order', 'الترتيب', 'int', {
  min: 0,
  hint: 'الأصغر يظهر أولًا — اتركه فارغًا ليُضاف في النهاية',
});

const IMAGE = (hint = 'رابط https أو صورة data URL') =>
  f('image', 'الصورة', 'url', { required: true, wide: true, hint, icon: 'camera' });

const RATING = f('rating', 'التقييم', 'float', { required: true, min: 0, max: 5, icon: 'check' });
const PRICE = f('price', 'السعر', 'int', { required: true, min: 0, icon: 'tag' });
const UNIT = (placeholder) => f('unit', 'وحدة السعر', 'text', { required: true, placeholder });
const SLUG = (hint) => f('slug', 'المُعرّف (slug)', 'slug', { required: true, hint });

/* ------------------------------------------------------------- المجموعات */

export const collections = {
  hotels: {
    key: 'hotels',
    model: 'hotel',
    label: 'الفنادق',
    single: 'فندق',
    icon: 'building',
    sub: 'الفنادق والمنتجعات — تظهر في الرئيسية وصفحة الفنادق ومسار الحجز',
    identity: 'slug',
    columns: ['name', 'location', 'price', 'stars'],
    fields: [
      SLUG('حروف إنجليزية صغيرة وأرقام وشرطات — يدخل في رابط صفحة الفندق'),
      f('name', 'اسم الفندق', 'text', { required: true }),
      f('location', 'الموقع', 'text', { required: true, icon: 'pin' }),
      IMAGE(),
      RATING,
      f('reviews', 'عدد المراجعات', 'int', { default: 0, min: 0 }),
      f('stars', 'النجوم', 'int', { default: 5, min: 1, max: 7 }),
      f('starsLabel', 'وصف النجوم', 'text', { nullable: true, placeholder: 'فندق 5 نجوم' }),
      PRICE,
      f('was', 'السعر قبل الخصم', 'int', { nullable: true, min: 0 }),
      f('discount', 'نسبة الخصم %', 'int', { nullable: true, min: 0, max: 100 }),
      UNIT('لليلة الواحدة'),
      f('cancel', 'سياسة الإلغاء', 'text', {
        required: true,
        wide: true,
        placeholder: 'إلغاء مجاني حتى 72 ساعة قبل الوصول',
      }),
      f('tags', 'الوسوم', 'list', { wide: true, hint: 'وسم لكل سطر' }),
      f('extraTags', 'وسوم إضافية (عدد)', 'int', { default: 0, min: 0 }),
      f('moreCount', 'صور إضافية (عدد)', 'int', { default: 0, min: 0 }),
      f('intro', 'المقدّمة', 'area', { nullable: true, wide: true }),
      f('gallery', 'معرض الصور', 'urls', { wide: true, hint: 'رابط https لكل سطر' }),
      f('amenities', 'المرافق', 'pairs', { wide: true, hint: ICON_HINT }),
      f('about', 'عن الفندق', 'list', { wide: true, hint: 'فقرة لكل سطر' }),
      ORDER,
    ],
  },

  rooms: {
    key: 'rooms',
    model: 'room',
    label: 'الغرف',
    single: 'غرفة',
    icon: 'bed',
    sub: 'غرف الفنادق — كل غرفة تتبع فندقًا وتُحذف معه',
    identity: 'slug',
    columns: ['name', 'price'],
    parent: { field: 'hotelId', model: 'hotel', label: 'الفندق' },
    fields: [
      f('hotelId', 'الفندق', 'ref', { required: true, wide: true, icon: 'building' }),
      SLUG('فريد داخل الفندق نفسه'),
      f('name', 'اسم الغرفة', 'text', { required: true }),
      IMAGE(),
      PRICE,
      f('specs', 'مواصفات الغرفة', 'pairs', { wide: true, hint: ICON_HINT }),
      ORDER,
    ],
  },

  activities: {
    key: 'activities',
    model: 'activity',
    label: 'الأنشطة',
    single: 'نشاط',
    icon: 'camera',
    sub: 'الرحلات والتجارب — تبويب الأنشطة في الرئيسية',
    identity: 'slug',
    columns: ['name', 'duration', 'price'],
    fields: [
      SLUG(),
      f('name', 'اسم النشاط', 'text', { required: true }),
      f('duration', 'المدة', 'text', { required: true, placeholder: 'ساعتان', icon: 'clock' }),
      IMAGE(),
      RATING,
      PRICE,
      UNIT('للفرد الواحد'),
      f('slot', 'الموعد المتاح', 'text', {
        required: true,
        placeholder: 'متاح اليوم – 2:00 م',
        icon: 'calendar',
      }),
      f('scarce', 'تنبيه الندرة', 'text', { nullable: true, placeholder: 'باقي مقعدان' }),
      f('desc', 'الوصف', 'area', { required: true, wide: true }),
      ORDER,
    ],
  },

  cars: {
    key: 'cars',
    model: 'car',
    label: 'المواصلات',
    single: 'سيارة',
    icon: 'car',
    sub: 'سيارات الإيجار والتوصيل — تبويب المواصلات',
    identity: 'slug',
    columns: ['name', 'price'],
    fields: [
      SLUG(),
      f('name', 'الاسم', 'text', { required: true }),
      IMAGE(),
      RATING,
      PRICE,
      UNIT('إيجار اليوم'),
      f('contract', 'نوع العقد', 'text', { required: true, placeholder: 'عقد إيجار عند الاستلام' }),
      f('contractNote', 'ملاحظة العقد', 'text', { required: true, wide: true }),
      ORDER,
    ],
  },

  guides: {
    key: 'guides',
    model: 'guide',
    label: 'المرشدون',
    single: 'مرشد',
    icon: 'user',
    sub: 'المرشدون السياحيون — تبويب المرشدين',
    identity: 'slug',
    columns: ['name', 'location', 'price'],
    fields: [
      SLUG(),
      f('name', 'الاسم', 'text', { required: true }),
      f('location', 'الموقع', 'text', { required: true, icon: 'pin' }),
      IMAGE('صورة مربّعة — تُعرَض دائرية'),
      RATING,
      f('reviews', 'عدد المراجعات', 'int', { default: 0, min: 0 }),
      f('price', 'السعر', 'text', { required: true, placeholder: '35$', icon: 'tag' }),
      UNIT('/ اليوم'),
      f('languages', 'اللغات', 'langs', {
        wide: true,
        hint: 'لغة لكل سطر — أضف « | أساسية » بعد اللغة الأساسية',
      }),
      ORDER,
    ],
  },

  packages: {
    key: 'packages',
    model: 'package',
    label: 'الباقات',
    single: 'باقة',
    icon: 'ticket',
    sub: 'الباقات المجمّعة — صفحة العروض',
    identity: 'slug',
    columns: ['name', 'location', 'price', 'discount'],
    fields: [
      SLUG(),
      f('name', 'اسم الباقة', 'text', { required: true }),
      f('location', 'الموقع', 'text', { required: true, icon: 'pin' }),
      f('nights', 'المدة', 'text', { required: true, placeholder: '5 أيام 4 ليالٍ', icon: 'clock' }),
      IMAGE(),
      PRICE,
      f('was', 'السعر قبل الخصم', 'int', { default: 0, min: 0 }),
      f('discount', 'نسبة الخصم %', 'int', { default: 0, min: 0, max: 100 }),
      f('save', 'قيمة التوفير', 'int', { default: 0, min: 0 }),
      f('desc', 'الوصف', 'area', { required: true, wide: true }),
      f('includes', 'ما تشمله الباقة', 'list', { wide: true, hint: 'عنصر لكل سطر' }),
      ORDER,
    ],
  },

  trending: {
    key: 'trending',
    model: 'trendingTrip',
    label: 'الرحلات الرائجة',
    single: 'رحلة رائجة',
    icon: 'globe',
    sub: 'أكثر الرحلات حجزًا — شريط الرئيسية',
    identity: 'name',
    columns: ['meta', 'from', 'discount'],
    fields: [
      f('name', 'اسم الرحلة', 'text', { required: true, placeholder: 'الأقصر – 3 أيام' }),
      f('meta', 'التفاصيل', 'text', {
        required: true,
        wide: true,
        placeholder: '2 ليال · إقامة + رحلات',
      }),
      f('from', 'يبدأ من', 'int', { required: true, min: 0, icon: 'tag' }),
      f('discount', 'نسبة الخصم %', 'int', { default: 0, min: 0, max: 100 }),
      RATING,
      f('reviews', 'عدد المراجعات', 'int', { default: 0, min: 0 }),
      ORDER,
    ],
  },

  reviews: {
    key: 'reviews',
    model: 'review',
    label: 'آراء العملاء',
    single: 'رأي',
    icon: 'heart',
    sub: 'آراء العملاء — يكتبها المستخدمون من صفحة الآراء',
    identity: 'name',
    columns: ['trip', 'rating'],
    // الرأي يكتبه صاحبه من /reviews — اللوحة للتحرير والحذف (الإشراف) فقط
    noCreate: {
      note: 'الآراء يكتبها المستخدمون من صفحة «آراء العملاء» بأسمائهم وصورهم. من هنا تُحرّر أو تُحذف فقط.',
      href: '/reviews',
    },
    fields: [
      f('name', 'اسم العميل', 'text', { required: true }),
      f('trip', 'الرحلة', 'text', { required: true }),
      f('rating', 'التقييم', 'int', { required: true, min: 1, max: 5 }),
      f('avatar', 'الصورة', 'url', { required: true, wide: true, icon: 'camera' }),
      f('text', 'نص الرأي', 'area', { required: true, wide: true }),
      ORDER,
    ],
  },
};

export const collectionList = Object.values(collections);

export const fieldOf = (collection, name) => collection.fields.find((x) => x.name === name);

/* ==========================================================================
   قراءة المدخلات والتحقق منها
   ========================================================================== */

/** الأرقام تُكتب بالعربية كما تُقرأ — نحوّلها قبل أي تحقق رقمي */
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
export const toAsciiDigits = (text) =>
  String(text ?? '').replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));

const lines = (raw) =>
  String(raw ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const fail = (error) => ({ ok: false, error });

function parseNumber(field, text, integer) {
  const value = Number(toAsciiDigits(text).replace(/[\s,٬]/g, ''));
  if (!Number.isFinite(value)) return fail(`«${field.label}» يجب أن يكون رقمًا.`);
  if (integer && !Number.isInteger(value)) return fail(`«${field.label}» يجب أن يكون رقمًا صحيحًا.`);
  if (field.min !== undefined && value < field.min) return fail(`«${field.label}» لا يقل عن ${field.min}.`);
  if (field.max !== undefined && value > field.max) return fail(`«${field.label}» لا يزيد على ${field.max}.`);
  return { ok: true, value };
}

/** الصور: نعيد استخدام تحقق الصورة الشخصية — https أو data URL آمن بحدّ حجم */
function parseUrl(field, text) {
  const image = normalizeAvatar(text, null);
  if (!image.ok) return fail(`«${field.label}»: ${image.error}`);
  return { ok: true, value: image.value };
}

const PRIMARY_FLAGS = ['أساسية', 'أساسي', 'primary', '*'];

/** حقل واحد: نصّه الخام → القيمة التي تُكتب في القاعدة */
export function parseField(field, raw) {
  const text = String(raw ?? '').trim();

  if (!text) {
    if (field.required) return fail(`«${field.label}» مطلوب.`);
    if (field.default !== undefined) return { ok: true, value: field.default };
    if (field.nullable) return { ok: true, value: null };
    if (['list', 'urls', 'pairs', 'langs'].includes(field.type)) return { ok: true, value: [] };
    return { ok: true, skip: true }; // الترتيب الفارغ يُحسب في الخادم
  }

  switch (field.type) {
    case 'slug':
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text)) {
        return fail(`«${field.label}» بحروف إنجليزية صغيرة وأرقام وشرطات فقط — مثل: dahab-bay-resort.`);
      }
      return { ok: true, value: text };

    case 'text':
    case 'ref':
      return { ok: true, value: text };

    case 'area':
      return { ok: true, value: text };

    case 'int':
      return parseNumber(field, text, true);

    case 'float':
      return parseNumber(field, text, false);

    case 'url':
      return parseUrl(field, text);

    case 'list':
      return { ok: true, value: lines(raw) };

    case 'urls': {
      const out = [];
      for (const line of lines(raw)) {
        const one = parseUrl(field, line);
        if (!one.ok) return one;
        out.push(one.value);
      }
      return { ok: true, value: out };
    }

    case 'pairs': {
      const out = [];
      for (const line of lines(raw)) {
        const [label, icon = ''] = line.split('|').map((part) => part.trim());
        if (!label) return fail(`«${field.label}»: سطر بلا نص.`);
        if (!icon) return fail(`«${field.label}»: «${label}» بلا أيقونة — اكتبها هكذا: ${label} | wifi`);
        if (!ICON_KEYS.includes(icon)) {
          return fail(`«${field.label}»: الأيقونة «${icon}» غير معروفة. المتاح: ${ICON_KEYS.join('، ')}`);
        }
        out.push({ label, icon });
      }
      return { ok: true, value: out };
    }

    case 'langs': {
      const out = [];
      for (const line of lines(raw)) {
        const [label, flag = ''] = line.split('|').map((part) => part.trim());
        if (!label) return fail(`«${field.label}»: سطر بلا لغة.`);
        out.push({ label, primary: PRIMARY_FLAGS.includes(flag.toLowerCase()) });
      }
      // بلا لغة أساسية تُعرَض البطاقة بلا وسم — فأولى اللغات هي الأساسية
      if (out.length && !out.some((lang) => lang.primary)) out[0].primary = true;
      return { ok: true, value: out };
    }

    default:
      return fail(`نوع حقل غير معروف: ${field.type}`);
  }
}

/**
 * كل حقول المجموعة من نموذج مُرسَل.
 * يعيد `values` دائمًا حتى يُعاد رسم النموذج بما كتبه الأدمن عند الخطأ.
 * @returns {{ok: true, data: object, values: object} | {ok: false, error: string, values: object}}
 */
export function parseRow(collection, formData) {
  const values = {};
  for (const field of collection.fields) {
    const raw = formData.get(field.name);
    values[field.name] = typeof raw === 'string' ? raw : '';
  }

  const data = {};
  for (const field of collection.fields) {
    const result = parseField(field, values[field.name]);
    if (!result.ok) return { ok: false, error: result.error, values };
    if (!result.skip) data[field.name] = result.value;
  }

  return { ok: true, data, values };
}

/* ==========================================================================
   العرض: صف من القاعدة → نصوص النموذج، وخلايا الجدول
   ========================================================================== */

const showPair = (pair) => `${pair.label} | ${pair.icon}`;
const showLang = (lang) => (lang.primary ? `${lang.label} | أساسية` : lang.label);

/** صف من القاعدة → القيم الافتراضية لحقول النموذج */
export function serializeRow(collection, row) {
  const values = {};
  if (!row) return values;

  for (const field of collection.fields) {
    const value = row[field.name];

    if (value === null || value === undefined) {
      values[field.name] = '';
      continue;
    }

    switch (field.type) {
      case 'list':
      case 'urls':
        values[field.name] = value.join('\n');
        break;
      case 'pairs':
        values[field.name] = value.map(showPair).join('\n');
        break;
      case 'langs':
        values[field.name] = value.map(showLang).join('\n');
        break;
      default:
        values[field.name] = String(value);
    }
  }

  return values;
}

/** خلية جدول — القوائم بعددها، والصور بكلمة واحدة، والنص الطويل مقتطعًا */
export function formatCell(field, value) {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.length ? `${value.length} عناصر` : '—';
  if (field?.type === 'url') return 'صورة';
  if (typeof value === 'number') return value.toLocaleString('en-US');

  const text = String(value);
  return text.length > 60 ? `${text.slice(0, 60)}…` : text;
}
