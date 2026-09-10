import { unstable_cache } from 'next/cache';
import prisma from './prisma';
import { isDbUnreachable } from './db-status';

/* ==========================================================================
   كل ما تعرضه الواجهة يُقرأ من MongoDB.

   الأداء: كل ذهاب وعودة إلى Atlas ≈ 200ms، فالمحتوى المشترك (لا يتغيّر مع
   المستخدم) يُخزَّن في Data Cache بوسم content — أول طلب يقرأ من القاعدة،
   وما بعده يُخدَم بلا استعلام. الصفوف الخاصة بمستخدم لا تُخزَّن أبدًا.

   لإبطال المخزَّن فورًا بعد تعديل المحتوى: updateTag('content') داخل إجراء
   خادم، أو مجموعة الوسم الأخص (مثل 'hotels'). خارج الإجراءات (route handler
   أو webhook) تُستعمل revalidateTag('content', 'max') — updateTag يرمي هناك.
   ========================================================================== */

export const CONTENT_TTL = 300; // ثانية

const content = (fn, key, extraTags = []) =>
  unstable_cache(fn, [key], { revalidate: CONTENT_TTL, tags: ['content', ...extraTags] });

const byOrder = { orderBy: { order: 'asc' } };

/* ------------------------------------------------------- إعدادات ومحتوى */

const readSite = content(async () => {
  const site = await prisma.siteSetting.findUnique({ where: { key: 'main' } });
  if (!site) throw new Error('SiteSetting "main" غير موجود — شغّل: npm run db:seed');
  return site;
}, 'site', ['site']);

export const getSite = () => readSite();

export const getSearchTabs = content(() => prisma.searchTab.findMany(byOrder), 'searchTabs');

const readSectionCopy = content(async () => {
  const rows = await prisma.sectionCopy.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r]));
}, 'sectionCopy');

const warned = new Set();

/**
 * عناوين الأقسام. المفتاح غير الموجود في القاعدة يعيد كائنًا فارغًا بدل
 * undefined — فلا تسقط الصفحة بـ TypeError إن لم تُزرع القاعدة بعد.
 */
export const getSectionCopy = async () => {
  const map = await readSectionCopy();

  return new Proxy(map, {
    get(target, key) {
      if (typeof key !== 'string' || key in target) return target[key];
      // `await` على الكائن يفحص then — ليس مفتاح قسم، فلا تحذير منه
      if (key === 'then') return undefined;
      if (process.env.NODE_ENV !== 'production' && !warned.has(key)) {
        warned.add(key);
        console.warn(`[رحلتي] عنوان القسم "${key}" غير موجود في مجموعة SectionCopy — شغّل: npm run db:seed -- --force`);
      }
      return { key, title: '', highlight: null, sub: null };
    },
  });
};

export const getPaymentMethods = content(() => prisma.paymentMethod.findMany(byOrder), 'paymentMethods');
export const getBookingTabs = content(() => prisma.bookingTab.findMany(byOrder), 'bookingTabs');
export const getFavoriteFilters = content(() => prisma.favoriteFilter.findMany(byOrder), 'favoriteFilters');
export const getAccountNav = content(() => prisma.accountNavItem.findMany(byOrder), 'accountNav');
export const getSortOptions = content(() => prisma.sortOption.findMany(byOrder), 'sortOptions');
export const getAboutPage = content(() => prisma.aboutPage.findUnique({ where: { key: 'about' } }), 'about');
export const getCheckoutDraft = content(() => prisma.checkoutDraft.findUnique({ where: { key: 'draft' } }), 'checkout');
export const getNotificationSettings = content(async () => {
  const rows = await prisma.notificationSetting.findMany({ orderBy: { order: 'asc' } });
  return {
    channels: rows.filter((r) => r.group === 'channel'),
    topics: rows.filter((r) => r.group === 'topic'),
  };
}, 'notificationSettings');

/* --------------------------------------------------------- كتالوج الحجز */

export const getHotels = content(() => prisma.hotel.findMany(byOrder), 'hotels', ['hotels']);

export const getHotelBySlug = content(
  (slug) =>
    prisma.hotel.findUnique({
      where: { slug },
      include: { rooms: { orderBy: { order: 'asc' } } },
    }),
  'hotel',
  ['hotels'],
);


export const getActivities = content(() => prisma.activity.findMany(byOrder), 'activities');
export const getCars = content(() => prisma.car.findMany(byOrder), 'cars');
export const getGuides = content(() => prisma.guide.findMany(byOrder), 'guides');
export const getPackages = content(() => prisma.package.findMany(byOrder), 'packages');
export const getTrending = content(() => prisma.trendingTrip.findMany(byOrder), 'trending');
export const getReviews = content(() => prisma.review.findMany(byOrder), 'reviews');

/* ------------------------------------------------- عدّادات لوحة التحكم */

/**
 * عدّاد كل مجموعة — في **طلب واحد**.
 *
 * القياس على الكلاستر الحالي: count() الواحدة ≈ 500–870ms، والعشر عدّات على
 * Promise.all ≈ 24 ثانية (أسوأ من التسلسل: ≈ 12) — الطبقة المشتركة تخنق
 * العمليات المتزامنة. أما aggregate واحدة تجمعها بـ $unionWith فـ ≈ 640ms.
 *
 * المفتاح هنا هو اسم المجموعة في MongoDB (اسم النموذج نفسه، فلا @@map في
 * schema.prisma) — ومنه يُشتقّ اسم مندوب Prisma في الخطة البديلة.
 */
const COUNTED = {
  hotels: 'Hotel',
  rooms: 'Room',
  activities: 'Activity',
  cars: 'Car',
  guides: 'Guide',
  packages: 'Package',
  trending: 'TrendingTrip',
  reviews: 'Review',
  users: 'User',
  bookings: 'Booking',
};

const delegateOf = (coll) => `${coll[0].toLowerCase()}${coll.slice(1)}`;
const countStage = (coll) => [{ $count: 'n' }, { $addFields: { c: coll } }];

async function readCounts() {
  const entries = Object.entries(COUNTED);

  try {
    const [[, first], ...rest] = entries;
    const res = await prisma.$runCommandRaw({
      aggregate: first,
      pipeline: [
        ...countStage(first),
        ...rest.map(([, coll]) => ({ $unionWith: { coll, pipeline: countStage(coll) } })),
      ],
      cursor: {},
    });

    const found = Object.fromEntries(res.cursor.firstBatch.map((row) => [row.c, row.n]));
    // المجموعة الفارغة لا تُخرج صفًّا من $count — فالغائب صفر لا undefined
    return Object.fromEntries(entries.map(([key, coll]) => [key, found[coll] ?? 0]));
  } catch (error) {
    if (isDbUnreachable(error)) throw error;

    // خطة بديلة إن رفض الخادم $unionWith — متسلسلة عمدًا، فالتوازي هنا أبطأ
    const counts = {};
    for (const [key, coll] of entries) counts[key] = await prisma[delegateOf(coll)].count();
    return counts;
  }
}

/**
 * العدّادات مخزَّنة بوسم content: كل تعديل محتوى يستدعي updateTag('content')
 * فتظهر الأرقام الجديدة فورًا. المهلة القصيرة تلحق ما لا يحمل الوسم
 * (تسجيل مستخدم جديد، حجز) خلال دقيقة.
 */
export const getAdminCounts = unstable_cache(readCounts, ['adminCounts'], {
  revalidate: 60,
  tags: ['content'],
});

/* ------------------------------------- صفوف خاصة بمستخدم — بلا تخزين */

/**
 * جدول المستخدمين في لوحة التحكم — الحقول المعروضة وحدها (لا passwordHash
 * ولا notifyOff). مخزَّن بوسم users: كل ما يغيّر مستخدمًا (تسجيل جديد، تعديل
 * ملف شخصي، تغيير صفة) يستدعي updateTag('users')، والمهلة القصيرة شبكة أمان
 * إن فات موضعٌ ما.
 */
export const getUsers = unstable_cache(
  () =>
    prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, email: true, fullName: true, phone: true, avatar: true, role: true },
    }),
  ['adminUsers'],
  { revalidate: 60, tags: ['users'] },
);

export const getBookings = (userId) =>
  prisma.booking.findMany({ where: { userId }, orderBy: { order: 'asc' } });

export const getFavorites = (userId) =>
  prisma.favorite.findMany({ where: { userId }, orderBy: { order: 'asc' } });

export const getCards = (userId) =>
  prisma.paymentCard.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  });

export const getNotifications = (userId) =>
  prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });

export const getUnreadCount = (userId) =>
  prisma.notification.count({ where: { userId, read: false } });

/* ----------------------------------------------------------- تجميعات */

/** شاشات الحجز: الفندق والغرفة من القاعدة + حالة الحجز الجاري */
export async function getCheckoutSummary() {
  const draft = await getCheckoutDraft();
  if (!draft) throw new Error('CheckoutDraft "draft" غير موجود — شغّل: npm run db:seed');

  const hotel = await getHotelBySlug(draft.hotelSlug);
  const rooms = hotel?.rooms ?? [];
  const room = rooms.find((r) => r.slug === draft.roomSlug) ?? rooms[0];

  const nightly = room?.price ?? 0;
  const stay = nightly * draft.nights;
  const money = (n) => `${n.toLocaleString('en-US')} EGP`;

  return {
    draft,
    hotel,
    room,
    rows: [
      ...draft.rows,
      ...(room ? [{ key: 'نوع الغرفة', val: room.name, icon: 'bed' }] : []),
    ],
    totals: [
      { key: 'لليلة الواحدة', val: money(nightly) },
      { key: `الغرفة (${draft.nights} ليالٍ)`, val: money(stay) },
      { key: 'الضرائب والرسوم', val: money(draft.taxes) },
    ],
    grandTotal: money(stay + draft.taxes),
  };
}

export async function getHomeData() {
  const [site, tabs, copy, sortOptions, hotels, activities, cars, guides, trending] =
    await Promise.all([
      getSite(),
      getSearchTabs(),
      getSectionCopy(),
      getSortOptions(),
      getHotels(),
      getActivities(),
      getCars(),
      getGuides(),
      getTrending(),
    ]);

  return {
    site,
    tabs,
    copy,
    sortOptions,
    results: { hotels, activities, transport: cars, guides },
    trending,
  };
}
