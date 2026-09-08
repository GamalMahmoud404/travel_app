import SectionHead from '../components/SectionHead';
import { safeMetadata } from '../lib/metadata';
import { Star } from '../components/Icons';
import {
  getReviews, getSectionCopy, getSite,
} from '../lib/queries';

export const revalidate = 300;
export async function generateMetadata() {
  return safeMetadata(async () => {
    const [site, copy] = await Promise.all([getSite(), getSectionCopy()]);
    return { title: `${copy['reviews'].title} — ${site.name}` };
  });
}

export default async function ReviewsPage() {
  const [reviews, copy] = await Promise.all([getReviews(), getSectionCopy()]);
  const head = copy.reviews;

  return (
    <section className="container sect">
      <SectionHead title={head.title} highlight={head.highlight} sub={head.sub} />

      <div className="grid-3" style={{ marginTop: 40 }}>
        {reviews.map((r) => (
          <div className="panel panel__pad" key={r.id} style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.avatar}
                alt=""
                style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ display: 'grid' }}>
                <strong style={{ fontSize: 14.5 }}>{r.name}</strong>
                <span className="price__label">{r.trip}</span>
              </div>
            </div>

            <span className="starrow" style={{ display: 'inline-flex', gap: 3, color: 'var(--amber)' }}>
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star size={15} key={i} />
              ))}
            </span>

            <p style={{ color: 'var(--para)', fontSize: 13.5, lineHeight: 1.95 }}>{r.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
