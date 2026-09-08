import { Icon } from './iconMap';
import { MapPin, Star } from './Icons';

export default function BookingSummary({ summary, title }) {
  const { hotel, rows, totals, grandTotal } = summary;

  return (
    <aside className="panel summary">
      {hotel && (
        <>
          <div className="summary__hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hotel.image} alt={hotel.name} loading="lazy" />
          </div>

          <div className="summary__ident">
            <h3>{hotel.name}</h3>
            <span className="starrow">
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <Star size={13} key={i} />
              ))}
            </span>
            <p className="card__meta">
              <MapPin size={13} />
              {hotel.location}
            </p>
          </div>
        </>
      )}

      <h2 className="summary__title">{title}</h2>

      <div className="summary__rows">
        {rows.map((r) => (
          <div className="srow" key={r.key}>
            <span className="srow__key">
              <Icon name={r.icon} size={15} />
              {r.key}
            </span>
            <span className="srow__val">{r.val}</span>
          </div>
        ))}
      </div>

      <div className="summary__totals" style={{ paddingBottom: 20 }}>
        {totals.map((t) => (
          <div className="trow" key={t.key}>
            <span>{t.key}</span>
            <span dir="ltr">{t.val}</span>
          </div>
        ))}
        <div className="trow trow--sum">
          <span>الإجمالي</span>
          <span dir="ltr">{grandTotal}</span>
        </div>
      </div>
    </aside>
  );
}
