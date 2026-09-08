import AccountSidebar from '../../components/AccountSidebar';
import { safeMetadata } from '../../lib/metadata';
import { requirePermission } from '../../lib/permissions';
import FavoritesGrid from '../../components/FavoritesGrid';
import { Heart } from '../../components/Icons';
import {
  getAccountNav, getFavoriteFilters, getFavorites, getSectionCopy, getSite, } from '../../lib/queries';

export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  return safeMetadata(async () => {
    const [site, copy] = await Promise.all([getSite(), getSectionCopy()]);
    return { title: `${copy['account.favorites'].title} — ${site.name}` };
  });
}

export default async function FavoritesPage() {
  const { user, permissions, roleLabel } = await requirePermission('bookings.own', '/account/favorites');
  const [nav, favorites, filters, copy] = await Promise.all([
    getAccountNav(),
    getFavorites(user.id),
    getFavoriteFilters(),
    getSectionCopy(),
  ]);
  const head = copy['account.favorites'];

  return (
    <div className="container account">
      <AccountSidebar user={user} nav={nav} permissions={permissions} roleLabel={roleLabel} />

      <section>
        <div className="pagehead">
          <div className="pagehead__row">
            <Heart size={19} />
            <h1>{head.title}</h1>
          </div>
          <p>{head.sub}</p>
        </div>

        <FavoritesGrid favorites={favorites} filters={filters} />
      </section>
    </div>
  );
}
