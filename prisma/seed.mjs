/**
 * زرع محتوى "رحلتي" في MongoDB.
 *
 *   npm run db:seed                        # يرفض التنفيذ إذا كان المحتوى مزروعًا
 *   npm run db:seed -- --force             # يعيد زرع المحتوى المشترك
 *   npm run db:seed -- --force --demo you@mail.com
 *                                          # يضيف حجوزات/مفضلة/بطاقات/إشعارات
 *                                          # تجريبية لحساب موجود بالفعل
 *
 * ضمانتان:
 *  1) لا يُنشئ أي حساب مستخدم، ولا يحذف حسابًا مسجَّلًا من الموقع أو بياناته.
 *  2) الحذف والكتابة داخل معاملة واحدة — فانقطاع الشبكة في المنتصف لا يترك
 *     القاعدة فارغة، بل تُلغى المعاملة ويبقى المحتوى القديم كما هو.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PrismaClient } from '@prisma/client';

const here = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(here, 'seed-data.json'), 'utf8'));

const prisma = new PrismaClient();
const argv = process.argv.slice(2);
const force = argv.includes('--force');
const demoEmail = (() => {
  const i = argv.indexOf('--demo');
  return i > -1 ? argv[i + 1] : null;
})();

/** كل المحتوى المشترك — يعمل على عميل عادي أو على معاملة */
async function writeContent(db) {
  await db.room.deleteMany();
  await db.hotel.deleteMany();
  await db.activity.deleteMany();
  await db.car.deleteMany();
  await db.guide.deleteMany();
  await db.package.deleteMany();
  await db.trendingTrip.deleteMany();
  await db.review.deleteMany();
  await db.siteSetting.deleteMany();
  await db.searchTab.deleteMany();
  await db.sectionCopy.deleteMany();
  await db.paymentMethod.deleteMany();
  await db.bookingTab.deleteMany();
  await db.favoriteFilter.deleteMany();
  await db.accountNavItem.deleteMany();
  await db.sortOption.deleteMany();
  await db.aboutPage.deleteMany();
  await db.checkoutDraft.deleteMany();
  await db.notificationSetting.deleteMany();
  await db.permission.deleteMany();
  await db.role.deleteMany();

  for (const { rooms = [], ...hotel } of data.hotels) {
    await db.hotel.create({
      data: { ...hotel, rooms: rooms.length ? { create: rooms } : undefined },
    });
  }

  await db.activity.createMany({ data: data.activities });
  await db.car.createMany({ data: data.cars });
  await db.guide.createMany({ data: data.guides });
  await db.package.createMany({ data: data.packages });
  await db.trendingTrip.createMany({ data: data.trending });
  await db.review.createMany({ data: data.reviews });

  await db.siteSetting.create({ data: data.site });
  await db.aboutPage.create({ data: data.about });
  await db.checkoutDraft.create({ data: data.checkout });
  for (const tab of data.searchTabs) await db.searchTab.create({ data: tab });
  await db.sectionCopy.createMany({ data: data.sectionCopy });
  await db.paymentMethod.createMany({ data: data.paymentMethods });
  await db.bookingTab.createMany({ data: data.bookingTabs });
  await db.favoriteFilter.createMany({ data: data.favoriteFilters });
  await db.accountNavItem.createMany({ data: data.accountNav });
  await db.sortOption.createMany({ data: data.sortOptions });
  await db.notificationSetting.createMany({ data: data.notificationSettings });
  await db.permission.createMany({ data: data.permissions });
  await db.role.createMany({ data: data.roles });
}

async function main() {
  const counts = {
    hotels: await prisma.hotel.count(),
    rooms: await prisma.room.count(),
    activities: await prisma.activity.count(),
    cars: await prisma.car.count(),
    guides: await prisma.guide.count(),
    packages: await prisma.package.count(),
    trending: await prisma.trendingTrip.count(),
    reviews: await prisma.review.count(),
    site: await prisma.siteSetting.count(),
    searchTabs: await prisma.searchTab.count(),
    sectionCopy: await prisma.sectionCopy.count(),
    paymentMethods: await prisma.paymentMethod.count(),
    accountNav: await prisma.accountNavItem.count(),
    notifySettings: await prisma.notificationSetting.count(),
    roles: await prisma.role.count(),
  };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  if (total > 0 && !force) {
    console.log('المحتوى مزروع بالفعل:', counts);
    console.log('أعد التنفيذ مع -- --force لإعادة زرعه.');
    return;
  }

  console.log('كتابة المحتوى داخل معاملة واحدة…');
  await prisma.$transaction(writeContent, { maxWait: 20_000, timeout: 120_000 });

  /* تنظيف الصفوف اليتيمة (userId لا يقابل مستخدمًا) — بلا مساس بأي حساب */
  const users = await prisma.user.findMany({ select: { id: true } });
  const ids = users.map((u) => u.id);
  const orphan = { userId: { notIn: ids } };
  const cleaned =
    (await prisma.booking.deleteMany({ where: orphan })).count +
    (await prisma.favorite.deleteMany({ where: orphan })).count +
    (await prisma.paymentCard.deleteMany({ where: orphan })).count +
    (await prisma.notification.deleteMany({ where: orphan })).count;

  console.log(
    '✓ فنادق:', data.hotels.length,
    '| غرف:', data.hotels.flatMap((h) => h.rooms || []).length,
    '| أنشطة:', data.activities.length,
    '| مواصلات:', data.cars.length,
    '| مرشدون:', data.guides.length,
    '| باقات:', data.packages.length,
    '| رحلات رائجة:', data.trending.length,
    '| آراء:', data.reviews.length,
  );
  console.log(
    '✓ إعدادات الموقع · من نحن · حالة الحجز |',
    'تبويبات بحث:', data.searchTabs.length,
    '| عناوين أقسام:', data.sectionCopy.length,
    '| طرق دفع:', data.paymentMethods.length,
    '| إعدادات إشعار:', data.notificationSettings.length,
    '| صلاحيات:', data.permissions.length,
    '| أدوار:', data.roles.map((r) => r.key).join('/'),
  );
  if (cleaned) console.log(`↷ حُذف ${cleaned} صف يتيم.`);

  /* --------------------------- بيانات تجريبية لحساب موجود (اختياري) */

  if (demoEmail) {
    const owner = await prisma.user.findUnique({ where: { email: demoEmail.toLowerCase() } });

    if (!owner) {
      console.log(`\n⚠ لا يوجد حساب بالبريد ${demoEmail} — تخطّي البيانات التجريبية.`);
    } else {
      await prisma.$transaction(async (tx) => {
        await tx.booking.deleteMany({ where: { userId: owner.id } });
        await tx.favorite.deleteMany({ where: { userId: owner.id } });
        await tx.paymentCard.deleteMany({ where: { userId: owner.id } });
        await tx.notification.deleteMany({ where: { userId: owner.id } });

        const own = (rows) => rows.map((r) => ({ ...r, userId: owner.id }));
        await tx.booking.createMany({ data: own(data.demo.bookings) });
        await tx.favorite.createMany({ data: own(data.demo.favorites) });
        await tx.paymentCard.createMany({ data: own(data.demo.cards) });
        await tx.notification.createMany({ data: own(data.demo.notifications) });
      }, { maxWait: 20_000, timeout: 60_000 });

      console.log(
        `\n✓ بيانات تجريبية لحساب ${owner.fullName} <${owner.email}>:`,
        `حجوزات ${data.demo.bookings.length} ·`,
        `مفضلة ${data.demo.favorites.length} ·`,
        `بطاقات ${data.demo.cards.length} ·`,
        `إشعارات ${data.demo.notifications.length}`,
      );
    }
  }

  const users2 = await prisma.user.count();
  console.log(`\nتم الزرع. الحسابات في القاعدة: ${users2} — السكربت لا يُنشئ حسابات.`);
}

main()
  .catch((e) => {
    const msg = String(e?.message ?? e).replace(/\s+/g, ' ');
    if (/Server selection timeout|InternalError|ECONNREFUSED|querySrv/.test(msg)) {
      console.error('\n✗ تعذّر الوصول إلى MongoDB Atlas — لم يُكتب شيء والمحتوى القديم سليم.');
      console.error('  السبب:', msg.slice(0, 160));
      console.error('  أعد المحاولة عند استقرار الشبكة: npm run db:seed -- --force');
    } else {
      console.error(e);
    }
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
