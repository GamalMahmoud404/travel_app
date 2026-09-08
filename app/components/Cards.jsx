import Link from 'next/link';
import FavButton from './FavButton';
import { Icon } from './iconMap';
import { Clock, MapPin, Star, Tag } from './Icons';

const money = (n) => `${n.toLocaleString('en-US')} EGP`;

function Rating({ value }) {
  return (
    <span className="rating-chip">
      <Star size={12} />
      {value}
    </span>
  );
}

/* ------------------------------------------------------------ فندق */
export function HotelCard({ hotel }) {

  return (
    <article className="card">
      <div className="card__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hotel.image} alt={hotel.name} loading="lazy" />
        <FavButton kind="hotels" slug={hotel.slug} />
        <Rating value={hotel.rating} />
      </div>

      <div className="card__body">
        <h3 className="card__title">{hotel.name}</h3>
        <p className="card__meta">
          <MapPin size={14} />
          {hotel.location}
        </p>

        <div className="tags">
          {hotel.tags.map((t) => (
            <span className="tag" key={t}>{t}</span>
          ))}
          {hotel.extraTags ? <span className="tag tag--count">+{hotel.extraTags}</span> : null}
        </div>

        <p className="card__note">{hotel.cancel}</p>

        <div className="price">
          <span className="price__label">ابتداءً من</span>
          <div className="price__row">
            <span className="price__now">{money(hotel.price)}</span>
            {hotel.was ? <span className="price__was">{money(hotel.was)}</span> : null}
          </div>
          <div className="price__row">
            <span className="price__unit">{hotel.unit}</span>
            {hotel.discount ? <span className="price__save">خصم {hotel.discount}%</span> : null}
          </div>
        </div>
      </div>

      <div className="card__foot">
        <Link href={`/hotels/${hotel.slug}`} className="btn btn--primary btn--block">
          عرض التفاصيل
        </Link>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------ نشاط */
export function ActivityCard({ activity }) {

  return (
    <article className="card">
      <div className="card__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={activity.image} alt={activity.name} loading="lazy" />
        <FavButton kind="activities" slug={activity.slug} />
        <Rating value={activity.rating} />
      </div>

      <div className="card__body">
        <h3 className="card__title">{activity.name}</h3>
        <p className="card__meta">
          <Clock size={14} />
          {activity.duration}
        </p>
        <p className="card__desc">{activity.desc}</p>

        <div className="tags">
          <span className="tag tag--solid">{activity.slot}</span>
          {activity.scarce ? <span className="tag tag--danger">{activity.scarce}</span> : null}
        </div>

        <div className="price">
          <span className="price__label">ابتداءً من</span>
          <span className="price__now">{money(activity.price)}</span>
          <span className="price__unit">{activity.unit}</span>
        </div>
      </div>

      <div className="card__foot">
        <Link href="/booking/travelers" className="btn btn--primary btn--block">احجز الآن</Link>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------- سيارة */
export function CarCard({ car }) {

  return (
    <article className="card">
      <div className="card__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={car.image} alt={car.name} loading="lazy" />
        <FavButton kind="transport" slug={car.slug} />
        <Rating value={car.rating} />
      </div>

      <div className="card__body">
        <h3 className="card__title">{car.name}</h3>
        <p className="card__meta">
          <Icon name="card" size={14} />
          {car.contract}
        </p>
        <p className="card__note">{car.contractNote}</p>

        <div className="price">
          <span className="price__label">{car.unit}</span>
          <span className="price__now">{money(car.price)}</span>
        </div>
      </div>

      <div className="card__foot">
        <Link href="/booking/travelers" className="btn btn--primary btn--block">احجز الآن</Link>
      </div>
    </article>
  );
}

/* ------------------------------------------------------- مرشد سياحي */
export function GuideCard({ guide }) {

  return (
    <article className="card">
      <div className="card__media guide__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={guide.image} alt={guide.name} loading="lazy" />
      </div>

      <div className="card__body">
        <h3 className="card__title" style={{ textAlign: 'center' }}>{guide.name}</h3>
        <p className="card__meta" style={{ justifyContent: 'center' }}>
          <MapPin size={14} />
          {guide.location}
        </p>

        <div className="guide__langs">
          <span className="price__label">اللغات المتاحة</span>
          <div className="tags">
            {guide.languages.map((l) => (
              <span className={`tag${l.primary ? ' tag--solid' : ''}`} key={l.label}>
                {l.label}
              </span>
            ))}
          </div>
        </div>

        <div className="guide__row">
          <span className="card__meta">
            <Tag size={14} />
            <strong dir="ltr">{guide.price}</strong>
            <span className="price__unit">{guide.unit}</span>
          </span>
          <span className="stars">
            <Star size={13} />
            {guide.rating}
            <small>({guide.reviews})</small>
          </span>
        </div>
      </div>

      <div className="card__foot">
        <Link href="/booking/travelers" className="btn btn--primary btn--block">احجز الآن</Link>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------ باقة */
export function PackageCard({ pack }) {

  return (
    <article className="card">
      <div className="card__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pack.image} alt={pack.name} loading="lazy" />
        <FavButton kind="packages" slug={pack.slug} />
        <span className="discount-chip">خصم {pack.discount}%</span>
      </div>

      <div className="card__body">
        <h3 className="card__title" style={{ textAlign: 'center' }}>{pack.name}</h3>
        <div className="card__meta" style={{ justifyContent: 'center', gap: 16 }}>
          <span className="card__meta">
            <MapPin size={14} />
            {pack.location}
          </span>
          <span className="card__meta">
            <Icon name="calendar" size={14} />
            {pack.nights}
          </span>
        </div>
        <p className="card__desc" style={{ textAlign: 'center' }}>{pack.desc}</p>

        <div className="guide__langs guide__langs--center">
          <span className="price__label">تشمل الباقة:</span>
          <div className="tags">
            {pack.includes.map((t) => (
              <span className="tag tag--plain" key={t}>{t}</span>
            ))}
          </div>
        </div>

        <div className="price">
          <span className="price__label">للفرد</span>
          <div className="price__row">
            <span className="price__now">{money(pack.price)}</span>
            <span className="price__was">{money(pack.was)}</span>
          </div>
          <div>
            <span className="price__save">وفر {pack.save.toLocaleString('en-US')} EGP</span>
          </div>
        </div>
      </div>

      <div className="card__foot">
        <Link href="/hotels/blue-lagoon-dahab" className="btn btn--primary btn--block">
          عرض التفاصيل
        </Link>
      </div>
    </article>
  );
}

/* -------------------------------------------------- أكثر الرحلات حجزًا */
export function TrendCard({ trip }) {

  return (
    <article className="trend">
      <span className="trend__badge">خصم {trip.discount}%</span>
      <h3 className="trend__title">{trip.name}</h3>
      <p className="trend__meta">{trip.meta}</p>
      <div className="trend__foot">
        <span className="trend__price">
          يبدأ من <strong>{trip.from.toLocaleString('en-US')} ج.م</strong>
        </span>
        <span className="stars">
          <Star size={13} />
          {trip.rating}
          <small>({trip.reviews.toLocaleString('en-US')})</small>
        </span>
      </div>
    </article>
  );
}

/* --------------------------------------------------------- المفضلة */
export function FavoriteCard({ item }) {

  return (
    <article className="card">
      <div className="card__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt={item.name} loading="lazy" />
        <FavButton kind={item.kind} slug={item.slug} initial label="إزالة من المفضلة" />
        {item.rating ? <Rating value={item.rating} /> : null}
      </div>

      <div className="card__body">
        <h3 className="card__title">{item.name}</h3>
        <p className="card__meta">
          <Icon name={item.locationIcon || 'pin'} size={14} />
          {item.location}
        </p>
        <div className="price">
          <span className="price__label">{item.fromLabel}</span>
          <span className="price__now">{item.price}</span>
          <span className="price__unit">{item.unit}</span>
        </div>
      </div>

      <div className="card__foot">
        <Link href={item.href} className="btn btn--primary btn--block">{item.cta}</Link>
      </div>
    </article>
  );
}
