import Link from 'next/link';
import AccountSidebar from '../components/AccountSidebar';
import { safeMetadata } from '../lib/metadata';
import RolesPanel from '../components/RolesPanel';
import UsersPanel from '../components/UsersPanel';
import { Building, Edit, Sparkle } from '../components/Icons';
import { Icon } from '../components/iconMap';
import { revalidateContentAction } from '../lib/actions';
import prisma from '../lib/prisma';
import { collectionList } from '../lib/content-schema';
import { getPermissions, getRoles, requirePermission } from '../lib/permissions';
import { getAccountNav, getAdminCounts, getSectionCopy, getSite, getUsers } from '../lib/queries';

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

  /**
   * العدّادات وجدول المستخدمين معًا.
   * العدّادات طلب واحد مخزَّن (getAdminCounts)، وكانت عشر عدّات مستقلة
   * تكلّف ثوانيَ على هذا الكلاستر. من لا يملك bookings.all يرى حجوزاته وحدها،
   * وهي العدّة الوحيدة الخاصة بالمستخدم فتُطلب على حدة.
   */
  const [counts, users, ownBookings] = await Promise.all([
    getAdminCounts(),
    can('users.read') ? getUsers() : [],
    can('bookings.all') ? null : prisma.booking.count({ where: { userId: user.id } }),
  ]);

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const bookingCount = ownBookings ?? counts.bookings;
  // الجدول محمّل أصلًا: عدّه يُبقي البطاقة والجدول متّفقَين بلا انتظار مهلة
  const userCount = can('users.read') ? users.length : counts.users;
  const canEditContent = can('content.write');

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
          {collectionList.map((collection) => {
            const value = counts[collection.key] ?? 0;

            const body = (
              <>
                <strong>{value}</strong>
                <span>
                  <Icon name={collection.icon} size={13} />
                  {collection.label}
                </span>
                {canEditContent && (
                  <span className="admin-stat__cta">
                    <Edit size={12} />
                    {collection.noCreate ? 'تحرير وحذف' : 'إضافة وتعديل'}
                  </span>
                )}
              </>
            );

            return canEditContent ? (
              <Link
                className="admin-stat admin-stat--link"
                href={`/admin/content/${collection.key}`}
                key={collection.key}
              >
                {body}
              </Link>
            ) : (
              <div className="admin-stat" key={collection.key}>{body}</div>
            );
          })}

          <div className="admin-stat">
            <strong>{userCount}</strong>
            <span>مستخدمون</span>
          </div>
          <div className="admin-stat">
            <strong>{bookingCount}</strong>
            <span>حجوزات</span>
          </div>
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
