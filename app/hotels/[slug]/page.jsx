import Link from 'next/link';
import { safeMetadata } from '../../lib/metadata';
import { notFound } from 'next/navigation';
import SectionHead from '../../components/SectionHead';
import MiniMap from '../../components/MiniMap';
import { Icon } from '../../components/iconMap';
import { Building, ExternalLink, MapPin, Star } from '../../components/Icons';
import {
  getCheckoutDraft, getHotelBySlug, getHotels, getSectionCopy, getSite,
} from '../../lib/queries';

export const revalidate = 300;

/** توليد صفحات الفنادق مسبقًا — فتصبح النقرة من البطاقة فورية */
export async function generateStaticParams() {
  try {
    const hotels = await getHotels();
    return hotels.map((h) => ({ slug: h.slug }));
  } catch {
    // القاعدة غير متاحة وقت البناء — تُولَّد الصفحات عند الطلب بدل فشل البناء
    return [];
  }
}

const money = (n) => `${n.toLocaleString('en-US')} EGP`;

export async function generateMetadata({ params }) {
  return safeMetadata(async () => {
    const { slug } = await params;
    const hotel = await getHotelBySlug(slug);
    const site = await getSite();
    return { title: hotel ? `${hotel.name} — ${site.name}` : site.name };
  });
}

export default async function HotelDetailPage({ params }) {
  const { slug } = await params;
  const [h, copy, draft] = await Promise.all([getHotelBySlug(slug), getSectionCopy(), getCheckoutDraft()]);
  if (!h) notFound();
  const stayFacts = draft?.stayFacts ?? [];

  const gallery = h.gallery.length ? h.gallery : [h.image, h.image, h.image];

  return (
    <>
      <section className="container detail">
        <div className="detail__top">
          <div className="detail__head">
            <h1 className="sect__title">{h.name}</h1>

            <div className="detail__badges">
              <span className="badge-stars">
                <Star size={13} />
                {h.starsLabel ?? `فندق ${h.stars} نجوم`}
              </span>
              <span className="detail__rate">
                <span className="starrow">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Star size={14} key={i} />
                  ))}
                </span>
                <strong dir="ltr">{h.rating}</strong>
                {h.reviews > 0 && <span>({h.reviews.toLocaleString('en-US')} تقييم)</span>}
              </span>
            </div>

            <p className="card__meta">
              <MapPin size={15} />
              {h.location}
            </p>

            {h.intro && <p className="detail__desc">{h.intro}</p>}

            {h.amenities.length > 0 && (
              <>
                <h2 className="amen-title">{copy['hotel.amenities'].title}</h2>
                <div className="amenities">
                  {h.amenities.map((a) => (
                    <span className="amenity" key={a.label}>
                      <Icon name={a.icon} size={16} />
                      {a.label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="gallery">
            <figure className="gallery__main">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gallery[0]} alt={h.name} />
            </figure>
            <figure className="gallery__thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gallery[1]} alt="غرفة داخلية" loading="lazy" />
            </figure>
            <figure className="gallery__thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gallery[2]} alt="مرافق المنتجع" loading="lazy" />
              {h.moreCount > 0 && (
                <button type="button" className="gallery__more">
                  +{h.moreCount} عرض الكل
                </button>
              )}
            </figure>
          </div>
        </div>

        <div className="detail__bottom">
          <div className="panel">
            <h2 className="panel__head">
              <Building size={19} />
              {copy['hotel.about'].title}
            </h2>
            <div className="panel__text">
              {h.about.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
              <button
                type="button"
                className="link-teal"
                style={{ justifySelf: 'start', background: 'none', border: 0, padding: 0 }}
              >
                اقرأ المزيد
              </button>
            </div>
          </div>

          <div className="panel map-card">
            <div className="map-card__frame">
              <MiniMap label={h.name} />
              <span className="map-card__link">
                <ExternalLink size={11} />
                فتح في خرائط جوجل
              </span>
              <span className="map-card__pin">
                <MapPin size={15} />
              </span>
            </div>
            <div className="map-card__body">
              <p className="card__meta">
                <Building size={14} />
                <strong>{h.name}</strong>
              </p>
              <p className="card__meta">
                <MapPin size={14} />
                {h.location}
              </p>
            </div>
            <div className="map-card__foot">
              <a
                className="btn btn--primary btn--block"
                href={`https://maps.google.com/?q=${encodeURIComponent(h.location)}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={15} />
                فتح في خرائط جوجل
              </a>
            </div>
          </div>
        </div>
      </section>

      {h.rooms.length > 0 && (
        <section className="container sect">
          <SectionHead
            title={copy['hotel.rooms'].title}
            sub={copy['hotel.rooms'].sub}
          />

          <div className="rooms" style={{ marginTop: 40 }}>
            <div className="rooms__list">
              {h.rooms.map((r) => (
                <article className="room" key={r.id}>
                  <div className="room__body">
                    <h3 className="room__title">{r.name}</h3>
                    <div className="room__specs">
                      {r.specs.map((s) => (
                        <span className="room__spec" key={s.label}>
                          <Icon name={s.icon} size={15} />
                          {s.label}
                        </span>
                      ))}
                    </div>
                    <div className="price">
                      <span className="price__label">سعر الغرفة</span>
                      <span className="price__now">{money(r.price)}</span>
                      <span className="price__unit">في اليوم</span>
                    </div>
                    <div>
                      <Link href="/booking/travelers" className="btn btn--primary">
                        اختر الغرفة
                      </Link>
                    </div>
                  </div>
                  <div className="room__media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.image} alt={r.name} loading="lazy" />
                  </div>
                </article>
              ))}
            </div>

            <aside className="panel summary">
              <h2 className="summary__title">{copy['hotel.stay'].title}</h2>
              <div className="summary__rows">
                {stayFacts.map((f) => (
                  <div className="srow" key={f.key}>
                    <span className="srow__key">
                      <Icon name={f.icon} size={15} />
                      {f.key}
                    </span>
                    <span className="srow__val">{f.val}</span>
                  </div>
                ))}
                <button type="button" className="btn btn--primary btn--block" style={{ marginTop: 6 }}>
                  تعديل البحث
                </button>
              </div>
            </aside>
          </div>
        </section>
      )}
    </>
  );
}
