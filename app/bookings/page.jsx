import BookingsList from '../components/BookingsList';
import { safeMetadata } from '../lib/metadata';
import { requirePermission } from '../lib/permissions';
import {
  getBookingTabs, getBookings, getSectionCopy, getSite,
} from '../lib/queries';

export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  return safeMetadata(async () => {
    const [site, copy] = await Promise.all([getSite(), getSectionCopy()]);
    return { title: `${copy['bookings'].title} — ${site.name}` };
  });
}

export default async function BookingsPage() {
  const { user } = await requirePermission('bookings.own', '/bookings');
  const [bookings, tabs, copy] = await Promise.all([
    getBookings(user.id),
    getBookingTabs(),
    getSectionCopy(),
  ]);
  const head = copy.bookings;

  return (
    <section className="container sect">
      <div className="sect__head">
        <h1 className="sect__title">{head.title}</h1>
        <p className="sect__sub" style={{ fontSize: 14 }}>{head.sub}</p>
      </div>

      <BookingsList bookings={bookings} tabs={tabs} />
    </section>
  );
}
