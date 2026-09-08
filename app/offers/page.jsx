import SectionHead from '../components/SectionHead';
import { safeMetadata } from '../lib/metadata';
import { PackageCard } from '../components/Cards';
import {
  getPackages, getSectionCopy, getSite,
} from '../lib/queries';

export const revalidate = 300;
export async function generateMetadata() {
  return safeMetadata(async () => {
    const [site, copy] = await Promise.all([getSite(), getSectionCopy()]);
    return { title: `${copy['offers'].title} — ${site.name}` };
  });
}

export default async function OffersPage() {
  const [packages, copy] = await Promise.all([getPackages(), getSectionCopy()]);
  const head = copy.offers;

  return (
    <section className="container sect">
      <SectionHead title={head.title} highlight={head.highlight} sub={head.sub} />
      <div className="grid-3" style={{ marginTop: 40 }}>
        {packages.map((p) => (
          <PackageCard pack={p} key={p.id} />
        ))}
      </div>
    </section>
  );
}
