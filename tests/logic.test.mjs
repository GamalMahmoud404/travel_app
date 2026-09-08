import { test } from 'node:test';
import assert from 'node:assert/strict';

import { MAX_AVATAR_BYTES, normalizeAvatar } from '../app/lib/images.js';
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
