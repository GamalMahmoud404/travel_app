import Link from 'next/link';
import { safeMetadata } from '../../lib/metadata';
import { requirePermission } from '../../lib/permissions';
import Stepper from '../../components/Stepper';
import BookingSummary from '../../components/BookingSummary';
import { Mail, Phone, User } from '../../components/Icons';
import {
  getCheckoutSummary, getSectionCopy, getSite,
} from '../../lib/queries';

export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  return safeMetadata(async () => {
    const [site, copy] = await Promise.all([getSite(), getSectionCopy()]);
    return { title: `${copy['checkout.travelers'].title} — ${site.name}` };
  });
}

function PersonRow({ legend, idx, titles }) {
  return (
    <div className="form-group">
      <p className="form-group__legend">{legend}</p>
      <div className="form-row form-row--3">
        <div className="control">
          <label className="control__label" htmlFor={`title-${idx}`}>لقب</label>
          <div className="input input--select">
            <select id={`title-${idx}`} defaultValue="">
              <option value="" disabled />
              {titles.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="control">
          <label className="control__label" htmlFor={`first-${idx}`}>الاسم الأول</label>
          <div className="input">
            <User size={16} />
            <input id={`first-${idx}`} placeholder="أدخل اسمك الأول" />
          </div>
        </div>
        <div className="control">
          <label className="control__label" htmlFor={`last-${idx}`}>اسم العائلة</label>
          <div className="input">
            <User size={16} />
            <input id={`last-${idx}`} placeholder="أدخل اسم العائلة" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneField({ id, label }) {
  return (
    <div className="control">
      <label className="control__label" htmlFor={id}>{label}</label>
      <div className="input">
        <Phone size={16} />
        <span className="phone__cc">
          <span className="flag" aria-hidden="true"><i /><i /><i /></span>
          +20
        </span>
        <input id={id} dir="ltr" placeholder="+20 — 10 xxx xxxx" inputMode="tel" />
      </div>
    </div>
  );
}

export default async function TravelersPage() {
  await requirePermission('bookings.own', '/booking/travelers');
  const [summary, copy] = await Promise.all([getCheckoutSummary(), getSectionCopy()]);
  const honorifics = summary.draft.honorifics;

  return (
    <>
      <Stepper steps={summary.draft.steps} current={1} />

      <div className="container checkout">
        <form className="form-section">
          <div className="form-bar">{copy['checkout.travelers'].title}</div>
          <PersonRow legend="بيانات الشخص الأول" idx={1} titles={honorifics} />
          <PersonRow legend="بيانات الشخص الثاني" idx={2} titles={honorifics} />

          <div className="form-bar">{copy['checkout.contact'].title}</div>
          <PersonRow legend="بيانات مسؤول الحجز" idx={3} titles={honorifics} />

          <div className="control">
            <label className="control__label" htmlFor="email">عنوان البريد الإلكتروني</label>
            <div className="input">
              <Mail size={16} />
              <input id="email" type="email" dir="ltr" placeholder="Email@gmail.com" />
            </div>
          </div>

          <PhoneField id="phone" label="رقم الهاتف" />
          <PhoneField id="phone2" label="رقم هاتف إضافي" />

          <div className="control">
            <label className="control__label" htmlFor="notes">طلبات خاصة (اختياري)</label>
            <p className="price__label">أخبرنا عن أي طلبات خاصة أو ملاحظات…</p>
            <div className="input input--area">
              <textarea id="notes" placeholder="اكتب طلبك هنا.." />
            </div>
          </div>

          <div style={{ display: 'grid', justifyItems: 'center', paddingTop: 6 }}>
            <Link href="/booking/payment" className="btn btn--primary btn--lg" style={{ minWidth: 320 }}>
              استمر
            </Link>
          </div>
        </form>

        <BookingSummary summary={summary} title={copy['checkout.summary'].title} />
      </div>
    </>
  );
}
