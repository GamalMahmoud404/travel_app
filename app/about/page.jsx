import { notFound } from 'next/navigation';
import { safeMetadata } from '../lib/metadata';
import SectionHead from '../components/SectionHead';
import { Compass, Sparkle, Ticket } from '../components/Icons';
import {
  getAboutPage, getSectionCopy, getSite,
} from '../lib/queries';

export const revalidate = 300;
export async function generateMetadata() {
  return safeMetadata(async () => {
    const [site, copy] = await Promise.all([getSite(), getSectionCopy()]);
    return { title: `${copy['about'].title} — ${site.name}` };
  });
}

const pillarIcons = { compass: Compass, sparkle: Sparkle, ticket: Ticket };

export default async function AboutPage() {
  const about = await getAboutPage();
  if (!about) notFound();

  return (
    <section className="container sect">
      <SectionHead title={about.title} highlight={about.highlight} />

      <div className="panel" style={{ marginTop: 40 }}>
        <div className="panel__text" style={{ padding: 26 }}>
          {about.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: 24 }}>
        {about.pillars.map((p) => {
          const Icon = pillarIcons[p.icon] ?? Compass;
          return (
            <div className="panel panel__pad" key={p.title} style={{ display: 'grid', gap: 10 }}>
              <span
                className="footer__ic"
                style={{ background: 'var(--secondary-050)', color: 'var(--secondary)', width: 40, height: 40 }}
              >
                <Icon size={20} />
              </span>
              <h3 style={{ fontSize: 16 }}>{p.title}</h3>
              <p style={{ color: 'var(--para)', fontSize: 13.5, lineHeight: 1.9 }}>{p.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
