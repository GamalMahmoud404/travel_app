import HomeExplorer from './components/HomeExplorer';
import SectionHead from './components/SectionHead';
import { TrendCard } from './components/Cards';
import { getHomeData } from './lib/queries';

export const revalidate = 300;

export default async function HomePage() {
  const { site, tabs, copy, sortOptions, results, trending } = await getHomeData();
  const trend = copy['home.trending'];

  return (
    <>
      <section className="hero">
        <div className="hero__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={site.heroImage} alt="" fetchPriority="high" />
        </div>
        <div className="container">
          <div className="hero__copy">
            <h1 className="hero__title">
              {site.heroTitle.map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </h1>
            <p className="hero__sub">{site.heroSubtitle}</p>
          </div>
        </div>
      </section>

      <HomeExplorer tabs={tabs} results={results} sortOptions={sortOptions} />

      {trending.length > 0 && trend && (
        <section className="container sect">
          <SectionHead title={trend.title} highlight={trend.highlight} sub={trend.sub} />
          <div className="grid-4" style={{ marginTop: 40 }}>
            {trending.map((t) => (
              <TrendCard trip={t} key={t.id} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
