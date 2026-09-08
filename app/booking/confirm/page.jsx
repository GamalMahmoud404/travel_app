import Link from 'next/link';
import { safeMetadata } from '../../lib/metadata';
import { notFound } from 'next/navigation';
import Stepper from '../../components/Stepper';
import { Icon } from '../../components/iconMap';
import { CheckCircle, FileText, Hash, MapPin, Ticket } from '../../components/Icons';
import prisma from '../../lib/prisma';
import { requirePermission } from '../../lib/permissions';
import { getCheckoutDraft, getSectionCopy, getSite } from '../../lib/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return safeMetadata(async () => {
    const [site, copy] = await Promise.all([getSite(), getSectionCopy()]);
    return { title: `${copy['checkout.confirm'].title} — ${site.name}` };
  });
}

export default async function ConfirmPage({ searchParams }) {
  const { user } = await requirePermission('bookings.own', '/booking/confirm');
  const { ref } = await searchParams;

  const [copy, draft] = await Promise.all([getSectionCopy(), getCheckoutDraft()]);

  const booking = ref
    ? await prisma.booking.findFirst({ where: { ref: String(ref), userId: user.id } })
    : await prisma.booking.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });

  if (!booking) notFound();

  const head = copy['checkout.confirm'];
  const steps = draft?.steps ?? [];

  return (
    <>
      <Stepper steps={steps} current={steps.length || 3} />

      <section className="container confirm">
        <div className="panel confirm__card">
          <span className="confirm__seal">
            <CheckCircle size={34} />
          </span>

          <h1>{head.title}</h1>
          <p className="confirm__sub">{head.sub}</p>

          <span className="booking__ref confirm__ref">
            <Hash size={13} />
            رقم الحجز {booking.ref}
          </span>

          <div className="confirm__media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={booking.image} alt={booking.title} />
          </div>

          <h2 className="confirm__title">{booking.title}</h2>
          <p className="card__meta" style={{ justifyContent: 'center' }}>
            <MapPin size={14} />
            {booking.location}
          </p>

          <div className="confirm__facts">
            {booking.facts.map((f) => (
              <span className="card__meta" key={f.label}>
                <Icon name={f.icon} size={14} />
                {f.label}
              </span>
            ))}
          </div>

          <div className="confirm__total">
            <span>الإجمالي</span>
            <strong dir="ltr">{booking.total}</strong>
          </div>

          <span className={`status status--${booking.status}`}>
            <CheckCircle size={14} />
            {booking.statusLabel}
          </span>

          <div className="confirm__actions">
            <Link href="/bookings" className="btn btn--primary btn--lg">
              <Ticket size={16} />
              حجوزاتي
            </Link>
            <Link href="/" className="btn btn--outline btn--lg">
              <FileText size={16} />
              تخطيط رحلة جديدة
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
