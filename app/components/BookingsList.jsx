'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from './iconMap';
import { cancelBookingAction } from '../lib/actions';
import {
  CheckCircle, Clock, Download, FileText, Hash, MapPin, Ticket, Trash, XCircle,
} from './Icons';

const statusIcon = { ok: CheckCircle, wait: Clock, void: XCircle };

export default function BookingsList({ bookings, tabs }) {
  const [tab, setTab] = useState(tabs[0]?.key);
  const list = bookings.filter((b) => b.tab === tab);

  return (
    <>
      <div className="tabs-pill" role="tablist" aria-label="حالة الحجوزات" style={{ marginTop: 32 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
          >
            <Icon name={t.icon} size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        {list.length === 0 ? (
          <div className="empty">
            <Ticket size={40} />
            <p>لا توجد حجوزات في هذه القائمة حاليًا.</p>
            <Link href="/" className="btn btn--primary">ابدأ التخطيط لرحلتك</Link>
          </div>
        ) : (
          list.map((b, i) => {
            const StatusIcon = statusIcon[b.status];
            return (
              <article className="booking" key={b.id}>
                <div className="booking__media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.image} alt={b.title} loading="lazy" />
                </div>

                <div className="booking__body">
                  <h3 className="booking__title">{b.title}</h3>
                  <p className="card__meta">
                    <MapPin size={14} />
                    {b.location}
                  </p>
                  <div className="booking__facts">
                    {b.facts.map((f) => (
                      <span className="card__meta" key={f.label}>
                        <Icon name={f.icon} size={14} />
                        {f.label}
                      </span>
                    ))}
                  </div>
                  <span className="booking__ref">
                    <Hash size={12} />
                    رقم الحجز {b.ref}
                  </span>
                </div>

                <div className="booking__side">
                  <span className={`status status--${b.status}`}>
                    <StatusIcon size={14} />
                    {b.statusLabel}
                  </span>

                  <div className={`booking__total${b.status === 'void' ? ' is-void' : ''}`}>
                    <span>الإجمالي</span>
                    <strong dir="ltr">{b.total}</strong>
                  </div>

                  <div className="booking__actions">
                    <Link href="/hotels/blue-lagoon-dahab" className="btn btn--primary">
                      <FileText size={15} />
                      عرض التفاصيل
                    </Link>
                    {b.actions.includes('invoice') && (
                      <button type="button" className="btn btn--ghost">
                        <Download size={15} />
                        فاتورة
                      </button>
                    )}
                    {b.actions.includes('cancel') && (
                      <form action={cancelBookingAction}>
                        <input type="hidden" name="id" value={b.id} />
                        <button type="submit" className="btn btn--danger">
                          <Trash size={15} />
                          إلغاء الحجز
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </>
  );
}
