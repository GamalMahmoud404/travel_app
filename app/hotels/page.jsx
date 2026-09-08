import SectionHead from '../components/SectionHead';
import { safeMetadata } from '../lib/metadata';
import SortBar from '../components/SortBar';
import { HotelCard } from '../components/Cards';
import {
  getHotels, getSearchTabs, getSectionCopy, getSite, getSortOptions,
} from '../lib/queries';

export const revalidate = 300;
export async function generateMetadata() {
  return safeMetadata(async () => {
    const [site, copy] = await Promise.all([getSite(), getSectionCopy()]);
    return { title: `${copy['hotels'].title} — ${site.name}` };
  });
}

export default async function HotelsPage() {
  const [hotels, tabs, sortOptions] = await Promise.all([
    getHotels(),
    getSearchTabs(),
    getSortOptions(),
  ]);
  const head = tabs.find((t) => t.key === 'hotels');

  return (
    <section className="container sect">
      <SectionHead title={head?.headTitle} sub={head?.headSub} />
      <SortBar options={sortOptions} />
      <div className="grid-3">
        {hotels.map((h) => (
          <HotelCard hotel={h} key={h.id} />
        ))}
      </div>
    </section>
  );
}
