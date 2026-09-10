import { test } from 'node:test';
import assert from 'node:assert/strict';

import { readFileSync } from 'node:fs';

import { MAX_AVATAR_BYTES, normalizeAvatar } from '../app/lib/images.js';
import {
  ICON_KEYS, collectionList, collections, fieldOf, parseField, parseRow, serializeRow,
} from '../app/lib/content-schema.js';
import { hashPassword, verifyPassword } from '../app/lib/password.js';

/* ==========================================================================
   اختبارات المنطق النقي — بلا قاعدة بيانات ولا Next.
   npm test
   ========================================================================== */

const FALLBACK = 'https://images.unsplash.com/photo-x?auto=format&fit=crop&w=160&h=160&q=75';
const dataUrl = (mime, bytes = 300) =>
  `data:${mime};base64,${'A'.repeat(Math.ceil(bytes / 0.75))}`;

test('الصورة الشخصية: القيم الفارغة تعود إلى الافتراضية', () => {
  assert.equal(normalizeAvatar('', FALLBACK).value, FALLBACK);
  assert.equal(normalizeAvatar(null, FALLBACK).value, FALLBACK);
  assert.equal(normalizeAvatar(undefined, FALLBACK).value, FALLBACK);
  assert.equal(normalizeAvatar('   ', FALLBACK).value, FALLBACK);
  assert.equal(normalizeAvatar('', null).ok, false);
});

test('الصورة الشخصية: الصيغ المقبولة', () => {
  assert.equal(normalizeAvatar('https://cdn.example.com/a.jpg', FALLBACK).ok, true);
  assert.equal(normalizeAvatar(dataUrl('image/jpeg'), FALLBACK).ok, true);
  assert.equal(normalizeAvatar(dataUrl('image/png'), FALLBACK).ok, true);
  assert.equal(normalizeAvatar(dataUrl('image/webp'), FALLBACK).ok, true);
});

test('الصورة الشخصية: ترفض ما قد يُنفَّذ في المتصفح', () => {
  assert.equal(normalizeAvatar(dataUrl('image/svg+xml'), FALLBACK).ok, false);
  assert.equal(normalizeAvatar(dataUrl('text/html'), FALLBACK).ok, false);
  assert.equal(normalizeAvatar('javascript:alert(1)', FALLBACK).ok, false);
  assert.equal(normalizeAvatar('data:image/jpeg;base64,<script>', FALLBACK).ok, false);
  assert.equal(normalizeAvatar('http://insecure.test/a.jpg', FALLBACK).ok, false);
});

test('الصورة الشخصية: حدّ الحجم', () => {
  assert.equal(normalizeAvatar(dataUrl('image/jpeg', MAX_AVATAR_BYTES - 5000), FALLBACK).ok, true);
  assert.equal(normalizeAvatar(dataUrl('image/jpeg', MAX_AVATAR_BYTES + 5000), FALLBACK).ok, false);
});

test('كلمة المرور: الصيغة والملح', () => {
  const a = hashPassword('rehlaty123');
  const b = hashPassword('rehlaty123');

  assert.match(a, /^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  assert.notEqual(a, b, 'ملح مختلف لكل تعمية');
});

test('كلمة المرور: التحقق', () => {
  const stored = hashPassword('rehlaty123');

  assert.equal(verifyPassword('rehlaty123', stored), true);
  assert.equal(verifyPassword('Rehlaty123', stored), false, 'حساسة لحالة الأحرف');
  assert.equal(verifyPassword('rehlaty1234', stored), false);
  assert.equal(verifyPassword('', stored), false);
});

test('كلمة المرور: المدخلات التالفة لا ترمي استثناء', () => {
  for (const bad of [null, undefined, '', 'plaintext', 'md5$abc$def', 'scrypt$$', 'scrypt$abc$00', 'scrypt$abc$zz']) {
    assert.equal(verifyPassword('rehlaty123', bad), false, `فشل عند: ${String(bad)}`);
  }
});

/* ==========================================================================
   محتوى لوحة التحكم — التحقق من مدخلات النماذج
   ========================================================================== */

const hotels = collections.hotels;
const field = (name) => fieldOf(hotels, name);

test('المحتوى: الحقل المطلوب لا يُترك فارغًا', () => {
  assert.equal(parseField(field('name'), '').ok, false);
  assert.equal(parseField(field('name'), '   ').ok, false);
  assert.equal(parseField(field('name'), 'دهب باي').value, 'دهب باي');
});

test('المحتوى: الحقل الاختياري يعود إلى قيمته الافتراضية', () => {
  assert.equal(parseField(field('stars'), '').value, 5); // default
  assert.equal(parseField(field('starsLabel'), '').value, null); // nullable
  assert.deepEqual(parseField(field('tags'), '').value, []); // قائمة
  assert.equal(parseField(field('order'), '').skip, true); // يُحسب في الخادم
});

test('المحتوى: المُعرّف بحروف إنجليزية وشرطات فقط', () => {
  assert.equal(parseField(field('slug'), 'dahab-bay-resort').value, 'dahab-bay-resort');
  assert.equal(parseField(field('slug'), 'Dahab Bay').ok, false);
  assert.equal(parseField(field('slug'), 'دهب').ok, false);
  assert.equal(parseField(field('slug'), '-dahab-').ok, false);
});

test('المحتوى: الأرقام — العربية مقبولة والمدى محروس', () => {
  assert.equal(parseField(field('price'), '٢٩٥٠').value, 2950);
  assert.equal(parseField(field('price'), '2,950').value, 2950);
  assert.equal(parseField(field('price'), 'غالي').ok, false);
  assert.equal(parseField(field('rating'), '4.9').value, 4.9);
  assert.equal(parseField(field('rating'), '7').ok, false); // الحدّ 5
  assert.equal(parseField(field('stars'), '4.5').ok, false); // صحيح فقط
  assert.equal(parseField(field('discount'), '-5').ok, false);
});

test('المحتوى: الصور تقبل https فقط', () => {
  assert.equal(parseField(field('image'), 'https://cdn.example.com/a.jpg').ok, true);
  assert.equal(parseField(field('image'), 'http://cdn.example.com/a.jpg').ok, false);
  assert.equal(parseField(field('image'), 'javascript:alert(1)').ok, false);
  assert.deepEqual(parseField(field('gallery'), 'https://a.test/1.jpg\nhttps://a.test/2.jpg').value, [
    'https://a.test/1.jpg',
    'https://a.test/2.jpg',
  ]);
  assert.equal(parseField(field('gallery'), 'https://a.test/1.jpg\nnot-a-url').ok, false);
});

test('المحتوى: المرافق سطر لكل عنصر مع أيقونة معروفة', () => {
  assert.deepEqual(parseField(field('amenities'), 'مطعم | utensils\n مسبح | waves ').value, [
    { label: 'مطعم', icon: 'utensils' },
    { label: 'مسبح', icon: 'waves' },
  ]);
  assert.equal(parseField(field('amenities'), 'مطعم').ok, false); // بلا أيقونة
  assert.equal(parseField(field('amenities'), 'مطعم | pizza').ok, false); // أيقونة مجهولة
});

test('المحتوى: لغات المرشد — أولاها أساسية إن لم تُحدَّد', () => {
  const langs = fieldOf(collections.guides, 'languages');
  assert.deepEqual(parseField(langs, 'العربية\nالإنجليزية').value, [
    { label: 'العربية', primary: true },
    { label: 'الإنجليزية', primary: false },
  ]);
  assert.deepEqual(parseField(langs, 'العربية\nالإنجليزية | أساسية').value, [
    { label: 'العربية', primary: false },
    { label: 'الإنجليزية', primary: true },
  ]);
});

test('المحتوى: النموذج كاملًا — الخطأ يعيد ما كُتب', () => {
  const form = new FormData();
  const filled = {
    slug: 'test-hotel', name: 'فندق', location: 'دهب', image: 'https://a.test/x.jpg',
    rating: '4.5', price: '1000', unit: 'لليلة', cancel: 'إلغاء مجاني',
  };
  for (const [key, value] of Object.entries(filled)) form.set(key, value);

  const ok = parseRow(hotels, form);
  assert.equal(ok.ok, true);
  assert.equal(ok.data.slug, 'test-hotel');
  assert.equal(ok.data.stars, 5);
  assert.equal(ok.data.was, null);
  assert.deepEqual(ok.data.tags, []);
  assert.equal('order' in ok.data, false); // يُحسب في الخادم

  form.set('rating', '9');
  const bad = parseRow(hotels, form);
  assert.equal(bad.ok, false);
  assert.match(bad.error, /التقييم/);
  assert.equal(bad.values.name, 'فندق'); // ما كتبه الأدمن لا يضيع
});

test('المحتوى: صف القاعدة يعود إلى نصوص النموذج', () => {
  const values = serializeRow(hotels, {
    slug: 'a-hotel', name: 'فندق', price: 1000, was: null, stars: 4,
    tags: ['مسبح', 'مطاعم'],
    amenities: [{ label: 'واي فاي', icon: 'wifi' }],
  });

  assert.equal(values.price, '1000');
  assert.equal(values.was, '');
  assert.equal(values.tags, 'مسبح\nمطاعم');
  assert.equal(values.amenities, 'واي فاي | wifi');
});

test('المحتوى: كل مجموعة موصوفة وصفًا متّسقًا', () => {
  for (const collection of collectionList) {
    assert.ok(fieldOf(collection, collection.identity), `${collection.key}: حقل المُعرّف مفقود`);
    for (const name of collection.columns) {
      assert.ok(fieldOf(collection, name), `${collection.key}: العمود ${name} بلا حقل`);
    }
    if (collection.parent) {
      assert.ok(fieldOf(collection, collection.parent.field), `${collection.key}: حقل الأب مفقود`);
    }
    for (const f of collection.fields) {
      assert.ok(f.label, `${collection.key}.${f.name}: بلا عنوان`);
      // غير المطلوب يحتاج قيمة افتراضية أو null صريحًا (خلا القوائم والترتيب)
      const listy = ['list', 'urls', 'pairs', 'langs'].includes(f.type);
      assert.ok(
        f.required || listy || f.default !== undefined || f.nullable || f.name === 'order',
        `${collection.key}.${f.name}: بلا required أو default أو nullable`,
      );
    }
  }
});

test('المحتوى: قائمة الأيقونات مرآة لـ iconMap', () => {
  const source = readFileSync(new URL('../app/components/iconMap.js', import.meta.url), 'utf8');
  const body = source.slice(source.indexOf('export const icons'), source.indexOf('export function Icon'));
  const keys = [...body.matchAll(/^\s{2}([a-z]+):/gm)].map((m) => m[1]);

  assert.deepEqual([...ICON_KEYS].sort(), keys.sort());
});
