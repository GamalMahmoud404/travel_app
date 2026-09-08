/**
 * تصغير روابط صور Unsplash إلى المقاس الذي تُعرض به فعلًا.
 *
 *   npm run db:images            # عرض ما سيتغيّر فقط
 *   npm run db:images -- --apply # تطبيقه على القاعدة و prisma/seed-data.json
 *
 * البطاقة تُعرض بعرض ~360px، فطلب 900px كان يهدر نصف البايتات.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PrismaClient } from '@prisma/client';

const here = dirname(fileURLToPath(import.meta.url));
const seedPath = join(here, 'seed-data.json');
const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');

/** المقاسات المستهدفة: [العرض, الارتفاع, الجودة] */
const SIZES = {
  card: [640, 440, 72],
  square: [480, 480, 72],
  wide: [480, 360, 72],
  room: [640, 460, 72],
  galleryMain: [640, 780, 72],
  galleryThumb: [480, 330, 72],
  hero: [1440, 720, 72],
  avatar: [160, 160, 75],
};

function resize(url, [w, h, q]) {
  if (typeof url !== 'string' || !url.includes('images.unsplash.com')) return url;
  const [base] = url.split('?');
  return `${base}?auto=format&fit=crop&w=${w}&h=${h}&q=${q}`;
}

const plan = [];
const note = (what, before, after) => {
  if (before !== after) plan.push({ what, before, after });
};

async function main() {
  /* ------------------------------------------------------------ القاعدة */

  const simple = [
    ['hotel', 'الفنادق', SIZES.card],
    ['activity', 'الأنشطة', SIZES.card],
    ['car', 'المواصلات', SIZES.card],
    ['package', 'الباقات', SIZES.card],
    ['favorite', 'المفضلة', SIZES.card],
  ];

  for (const [model, label, size] of simple) {
    for (const row of await prisma[model].findMany()) {
      const image = resize(row.image, size);
      note(`${label}/${row.name}`, row.image, image);
      if (apply && image !== row.image) {
        await prisma[model].update({ where: { id: row.id }, data: { image } });
      }
    }
  }

  for (const g of await prisma.guide.findMany()) {
    const image = resize(g.image, SIZES.square);
    note(`المرشدون/${g.name}`, g.image, image);
    if (apply && image !== g.image) await prisma.guide.update({ where: { id: g.id }, data: { image } });
  }

  for (const b of await prisma.booking.findMany()) {
    const image = resize(b.image, SIZES.wide);
    note(`الحجوزات/${b.title}`, b.image, image);
    if (apply && image !== b.image) await prisma.booking.update({ where: { id: b.id }, data: { image } });
  }

  for (const r of await prisma.room.findMany()) {
    const image = resize(r.image, SIZES.room);
    note(`الغرف/${r.name}`, r.image, image);
    if (apply && image !== r.image) await prisma.room.update({ where: { id: r.id }, data: { image } });
  }

  for (const h of await prisma.hotel.findMany()) {
    if (!h.gallery.length) continue;
    const gallery = h.gallery.map((u, i) => resize(u, i === 0 ? SIZES.galleryMain : SIZES.galleryThumb));
    if (gallery.join('|') !== h.gallery.join('|')) {
      note(`معرض/${h.name}`, h.gallery.join(' , '), gallery.join(' , '));
      if (apply) await prisma.hotel.update({ where: { id: h.id }, data: { gallery } });
    }
  }

  for (const rev of await prisma.review.findMany()) {
    const avatar = resize(rev.avatar, SIZES.avatar);
    note(`الآراء/${rev.name}`, rev.avatar, avatar);
    if (apply && avatar !== rev.avatar) await prisma.review.update({ where: { id: rev.id }, data: { avatar } });
  }

  const site = await prisma.siteSetting.findUnique({ where: { key: 'main' } });
  if (site) {
    const heroImage = resize(site.heroImage, SIZES.hero);
    const defaultAvatar = resize(site.defaultAvatar, SIZES.avatar);
    note('الهيرو', site.heroImage, heroImage);
    note('الصورة الافتراضية', site.defaultAvatar, defaultAvatar);
    if (apply) {
      await prisma.siteSetting.update({ where: { key: 'main' }, data: { heroImage, defaultAvatar } });
    }
  }

  /* -------------------------------------------------------- seed-data */

  if (apply) {
    const j = JSON.parse(readFileSync(seedPath, 'utf8'));
    const map = (arr, size) => (arr ?? []).forEach((r) => { r.image = resize(r.image, size); });

    map(j.hotels, SIZES.card);
    map(j.activities, SIZES.card);
    map(j.cars, SIZES.card);
    map(j.packages, SIZES.card);
    map(j.guides, SIZES.square);
    map(j.demo?.favorites, SIZES.card);
    map(j.demo?.bookings, SIZES.wide);

    for (const h of j.hotels ?? []) {
      (h.rooms ?? []).forEach((r) => { r.image = resize(r.image, SIZES.room); });
      if (h.gallery) h.gallery = h.gallery.map((u, i) => resize(u, i === 0 ? SIZES.galleryMain : SIZES.galleryThumb));
    }
    (j.reviews ?? []).forEach((r) => { r.avatar = resize(r.avatar, SIZES.avatar); });
    if (j.site) {
      j.site.heroImage = resize(j.site.heroImage, SIZES.hero);
      j.site.defaultAvatar = resize(j.site.defaultAvatar, SIZES.avatar);
    }
    (j.demo?.cards ?? []).forEach(() => {});

    writeFileSync(seedPath, JSON.stringify(j, null, 2) + '\n');
  }

  if (plan.length === 0) {
    console.log('كل الصور بالمقاس المناسب — لا تغيير.');
  } else {
    console.log(`${plan.length} رابط ${apply ? 'تم تصغيره' : 'سيُصغَّر'}:`);
    for (const p of plan.slice(0, 6)) {
      const q = (u) => (u.match(/w=\d+&h=\d+&q=\d+/) || [u])[0];
      console.log(`  ${p.what}: ${q(p.before)} → ${q(p.after)}`);
    }
    if (plan.length > 6) console.log(`  … و${plan.length - 6} غيرها`);
    if (!apply) console.log('\nأعد التنفيذ مع -- --apply للتطبيق.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
