import AccountSidebar from '../../components/AccountSidebar';
import { safeMetadata } from '../../lib/metadata';
import AddCardForm from '../../components/AddCardForm';
import CardList from '../../components/CardList';
import { Wallet } from '../../components/Icons';
import { requirePermission } from '../../lib/permissions';
import { getAccountNav, getCards, getSectionCopy, getSite } from '../../lib/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return safeMetadata(async () => {
    const [site, copy] = await Promise.all([getSite(), getSectionCopy()]);
    return { title: `${copy['account.payments'].title} — ${site.name}` };
  });
}

export default async function PaymentsPage() {
  const { user, permissions, roleLabel } = await requirePermission('bookings.own', '/account/payments');
  const [nav, copy, cards] = await Promise.all([
    getAccountNav(),
    getSectionCopy(),
    getCards(user.id),
  ]);
  const head = copy['account.payments'];

  return (
    <div className="container account">
      <AccountSidebar user={user} nav={nav} permissions={permissions} roleLabel={roleLabel} />

      <section>
        <div className="pagehead">
          <div className="pagehead__row">
            <Wallet size={19} />
            <h1>{head.title}</h1>
          </div>
          <p>{head.sub}</p>
        </div>

        <CardList cards={cards} title={copy['account.cards'].title} />
        <AddCardForm title={copy['account.addCard'].title} sub={copy['account.addCard'].sub} />
      </section>
    </div>
  );
}
