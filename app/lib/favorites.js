import prisma from './prisma';
import { favoriteKey } from './favorite-key';

/* ==========================================================================
   المفضلة.

   الصف المحفوظ لقطة عرض (اسم، صورة، سعر…) لا مرجع فقط، فتظهر البطاقة في
   صفحة المفضلة بلا استعلام في كل مجموعة. واللقطة تُبنى هنا **من الكتالوج**
   لا من نموذج المتصفح: الزر يُرسل النوع والمُعرّف فقط، فلا يستطيع أحد حشو
   قائمته بروابط أو صور من عنده.
   ========================================================================== */

const money = (n) => `${n.toLocaleString('en-US')} EGP`;

const SNAPSHOTS = {
  hotels: async (slug) => {
    const row = await prisma.hotel.findUnique({ where: { slug } });
    if (!row) return null;
    return {
      name: row.name,
      location: row.location,
      locationIcon: null,
      image: row.image,
      rating: row.rating,
      fromLabel: 'ابتداءً من',
      price: money(row.price),
      unit: row.unit,
      cta: 'عرض التفاصيل',
      href: `/hotels/${row.slug}`,
    };
  },

  activities: async (slug) => {
    const row = await prisma.activity.findUnique({ where: { slug } });
    if (!row) return null;
    return {
      name: row.name,
      location: row.duration,
      locationIcon: 'clock',
      image: row.image,
      rating: row.rating,
      fromLabel: 'ابتداءً من',
      price: money(row.price),
      unit: row.unit,
      cta: 'احجز الآن',
      href: '/booking/travelers',
    };
  },

  transport: async (slug) => {
    const row = await prisma.car.findUnique({ where: { slug } });
    if (!row) return null;
    return {
      name: row.name,
      location: row.contract,
      locationIcon: 'card',
      image: row.image,
      rating: row.rating,
      fromLabel: 'ابتداءً من',
      price: money(row.price),
      unit: row.unit,
      cta: 'احجز الآن',
      href: '/booking/travelers',
    };
  },

  packages: async (slug) => {
    const row = await prisma.package.findUnique({ where: { slug } });
    if (!row) return null;
    return {
      name: row.name,
      location: row.location,
      locationIcon: null,
      image: row.image,
      rating: null, // الباقات بلا تقييم في الكتالوج
      fromLabel: 'للفرد',
      price: money(row.price),
      unit: row.nights,
      cta: 'عرض التفاصيل',
      href: '/offers',
    };
  },
};

export const FAVORITE_KINDS = Object.keys(SNAPSHOTS);

/** لقطة العرض من الكتالوج، أو null إن كان النوع أو المُعرّف مجهولًا */
export const buildFavorite = (kind, slug) =>
  SNAPSHOTS[kind] ? SNAPSHOTS[kind](slug) : null;

/** مُعرّفات مفضلة المستخدم — تقرؤها أزرار القلب لتعرف حالتها */
export async function getFavoriteIds(userId) {
  const rows = await prisma.favorite.findMany({
    where: { userId },
    select: { kind: true, slug: true },
  });

  return rows.map((r) => favoriteKey(r.kind, r.slug));
}
