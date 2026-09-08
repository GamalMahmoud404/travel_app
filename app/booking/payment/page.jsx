import Stepper from '../../components/Stepper';
import { safeMetadata } from '../../lib/metadata';
import { requirePermission } from '../../lib/permissions';
import BookingSummary from '../../components/BookingSummary';
import PaymentMethods from '../../components/PaymentMethods';
import { Lock, ShieldCheck } from '../../components/Icons';
import { confirmBookingAction } from '../../lib/actions';
import {
  getCheckoutSummary, getPaymentMethods, getSectionCopy, getSite,
} from '../../lib/queries';

export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  return safeMetadata(async () => {
    const [site, copy] = await Promise.all([getSite(), getSectionCopy()]);
    return { title: `${copy['checkout.payment'].title} — ${site.name}` };
  });
}

export default async function PaymentPage() {
  await requirePermission('bookings.own', '/booking/payment');
  const [summary, methods, copy] = await Promise.all([
    getCheckoutSummary(),
    getPaymentMethods(),
    getSectionCopy(),
  ]);
  const { draft } = summary;

  return (
    <>
      <Stepper steps={draft.steps} current={2} />

      <div className="container checkout">
        <form className="form-section" action={confirmBookingAction}>
          <div
            className="pagehead"
            style={{ justifyItems: 'center', textAlign: 'center', marginBottom: 4 }}
          >
            <div className="pagehead__row">
              <Lock size={19} />
              <h1>{copy['checkout.payment'].title}</h1>
            </div>
            <p>{copy['checkout.payment'].sub}</p>
          </div>

          <div className="panel">
            <h2 className="panel__head">
              <ShieldCheck size={18} />
              {copy['checkout.cancellation'].title}
            </h2>
            <div className="panel__text policy">
              <strong>{draft.cancellationFree}</strong>
              <span>{draft.cancellationAfter}</span>
            </div>
          </div>

          <PaymentMethods methods={methods} copy={copy['checkout.method']} />

          <div style={{ display: 'grid', justifyItems: 'center', paddingTop: 6 }}>
            <button type="submit" className="btn btn--primary btn--lg" style={{ minWidth: 320 }}>
              تأكيد ودفع الحجز
            </button>
          </div>
        </form>

        <BookingSummary summary={summary} title={copy['checkout.summary'].title} />
      </div>
    </>
  );
}
