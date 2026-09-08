/**
 * فحص متغيّرات البيئة قبل البناء.
 *
 * السبب: بلا DATABASE_URL يسقط `next build` عند توليد الصفحات الثابتة بعشرات
 * أسطر من أخطاء Prisma، وسطر السبب الحقيقي مدفون بينها. هذا الفحص يوقف البناء
 * في ثانيته الأولى برسالة واحدة تقول أي متغيّر ناقص وما شكله المتوقّع.
 *
 * لا يطبع أي قيمة — الطول وبداية الرابط فقط، فيبقى السجل آمنًا للمشاركة.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/* محليًّا تأتي القيم من .env (يقرأه Next لا node)، وعلى Vercel من البيئة */
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envFile = join(root, '.env');

if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    const value = m[2].trim().replace(/^["']|["']$/g, '');
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}

const CHECKS = [
  {
    name: 'DATABASE_URL',
    expect: (v) => /^mongodb(\+srv)?:\/\//.test(v),
    hint: 'رابط MongoDB يبدأ بـ mongodb+srv:// — انسخه من Atlas → Connect → Drivers',
  },
  {
    name: 'AUTH_SECRET',
    expect: (v) => v.length >= 32,
    hint: "٣٢ محرفًا على الأقل: node -e \"console.log(require('crypto').randomBytes(48).toString('base64url'))\"",
  },
];

const problems = [];

for (const { name, expect, hint } of CHECKS) {
  const raw = process.env[name];

  if (raw === undefined) problems.push(`${name}: غير معرَّف أصلًا. ${hint}`);
  else if (raw.trim() === '') problems.push(`${name}: معرَّف لكن قيمته فارغة (طوله ${raw.length}). ${hint}`);
  else if (!expect(raw.trim())) problems.push(`${name}: قيمته لا تطابق الشكل المتوقّع (طوله ${raw.trim().length}). ${hint}`);
}

if (problems.length > 0) {
  console.error('\n✖ البناء متوقّف: متغيّرات البيئة غير مكتملة\n');
  for (const p of problems) console.error(`  · ${p}`);
  console.error(
    '\n  على Vercel: Settings → Environment Variables، وتأكّد أن حقل Value غير فارغ',
    '\n  وأن Production مُحدَّدة، ثم أعد النشر (المتغيّرات تُقرأ في بناء جديد فقط).\n',
  );
  process.exit(1);
}

console.log('✓ متغيّرات البيئة مكتملة');
