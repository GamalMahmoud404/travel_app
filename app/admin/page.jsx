import AccountSidebar from '../components/AccountSidebar';
import { safeMetadata } from '../lib/metadata';
import RolesPanel from '../components/RolesPanel';
import UsersPanel from '../components/UsersPanel';
import { Building, Sparkle } from '../components/Icons';
import { revalidateContentAction } from '../lib/actions';
import prisma from '../lib/prisma';
import { getPermissions, getRoles, requirePermission } from '../lib/permissions';
import { getAccountNav, getSectionCopy, getSite, getUsers } from '../lib/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return safeMetadata(async () => {
    const [site, copy] = await Promise.all([getSite(), getSectionCopy()]);
    return { title: `${copy.admin.title} — ${site.name}` };
  });
}

export default async function AdminPage() {
  const { user, can, permissions, roleLabel } = await requirePermission('admin.access', '/admin');

  const [nav, copy, roles, permissionCatalog] = await Promise.all([
    getAccountNav(),
    getSectionCopy(),
    getRoles(),
    getPermissions(),
  ]);

  const users = can('users.read') ? await getUsers() : [];
  const adminCount = users.filter((u) => u.role === 'admin').length;

  // 11 عدّة متسلسلة كانت ≈ 11 × 200ms — الآن موجة واحدة
  const [
    hotels, rooms, activities, cars, guides, packages, trending, reviews, userCount, bookingCount,
  ] = await Promise.all([
    prisma.hotel.count(),
    prisma.room.count(),
    prisma.activity.count(),
    prisma.car.count(),
    prisma.guide.count(),
    prisma.package.count(),
    prisma.trendingTrip.count(),
    prisma.review.count(),
    prisma.user.count(),
    can('bookings.all')
      ? prisma.booking.count()
      : prisma.booking.count({ where: { userId: user.id } }),
  ]);

  const counts = {
    'فنادق': hotels,
    'غرف': rooms,
    'أنشطة': activities,
    'مواصلات': cars,
    'مرشدون': guides,
    'باقات': packages,
    'رحلات رائجة': trending,
    'آراء': reviews,
    'مستخدمون': userCount,
    'حجوزات': bookingCount,
  };

  return (
    <div className="container account">
      <AccountSidebar user={user} nav={nav} permissions={permissions} roleLabel={roleLabel} />

      <section>
        <div className="pagehead">
          <div className="pagehead__row">
            <Building size={19} />
            <h1>{copy.admin.title}</h1>
          </div>
          <p>{copy.admin.sub}</p>
        </div>

        {can('content.write') && (
          <form action={revalidateContentAction} style={{ marginBottom: 18 }}>
            <button type="submit" className="btn btn--ghost">
              <Sparkle size={15} />
              تحديث مخزَّن المحتوى
            </button>
          </form>
        )}

        <div className="admin-grid">
          {Object.entries(counts).map(([label, value]) => (
            <div className="admin-stat" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <RolesPanel
          title={copy['admin.roles'].title}
          sub={copy['admin.roles'].sub}
          roles={roles}
          permissions={permissionCatalog}
        />

        {can('users.read') && (
          <UsersPanel
            title={copy['admin.users'].title}
            sub={copy['admin.users'].sub}
            users={users}
            roles={roles}
            currentUserId={user.id}
            canWrite={can('users.write')}
            adminCount={adminCount}
          />
        )}
      </section>
    </div>
  );
}
