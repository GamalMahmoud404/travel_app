import AccountSidebar from '../components/AccountSidebar';
import { safeMetadata } from '../lib/metadata';
import ProfileForm from '../components/ProfileForm';
import { User } from '../components/Icons';
import { requirePermission } from '../lib/permissions';
import { getAccountNav, getSectionCopy, getSite } from '../lib/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return safeMetadata(async () => {
    const [site, copy] = await Promise.all([getSite(), getSectionCopy()]);
    return { title: `${copy['account.profile'].title} — ${site.name}` };
  });
}

export default async function AccountPage() {
  const { user, permissions, roleLabel } = await requirePermission('bookings.own', '/account');
  const [nav, copy] = await Promise.all([getAccountNav(), getSectionCopy()]);

  return (
    <div className="container account">
      <AccountSidebar user={user} nav={nav} permissions={permissions} roleLabel={roleLabel} />

      <section>
        <div className="pagehead">
          <div className="pagehead__row">
            <User size={19} />
            <h1>{copy['account.profile'].title}</h1>
          </div>
          <p>{copy['account.profile'].sub}</p>
        </div>

        <ProfileForm user={user} title={copy['account.basic'].title} />
      </section>
    </div>
  );
}
