'use client';

import { useState } from 'react';
import SectionHead from './SectionHead';
import SortBar from './SortBar';
import { ActivityCard, CarCard, GuideCard, HotelCard } from './Cards';
import { Icon } from './iconMap';
import { Search } from './Icons';

const renderers = {
  hotels: (list) => list.map((h) => <HotelCard hotel={h} key={h.id} />),
  activities: (list) => list.map((a) => <ActivityCard activity={a} key={a.id} />),
  transport: (list) => list.map((c) => <CarCard car={c} key={c.id} />),
  guides: (list) => list.map((g) => <GuideCard guide={g} key={g.id} />),
};

export default function HomeExplorer({ tabs, results, sortOptions }) {
  const [active, setActive] = useState(tabs[0]?.key);
  const tab = tabs.find((t) => t.key === active) ?? tabs[0];
  const list = results[tab.key] ?? [];

  return (
    <>
      <div className="container">
        <div className="search">
          <div className="search__tabs" role="tablist" aria-label="نوع الخدمة">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                id={`tab-${t.key}`}
                aria-selected={t.key === tab.key}
                aria-controls="search-panel"
                className="search__tab"
                onClick={() => setActive(t.key)}
              >
                <Icon name={t.icon} size={17} />
                {t.label}
              </button>
            ))}
          </div>

          <form
            className="search__form"
            id="search-panel"
            role="tabpanel"
            aria-labelledby={`tab-${tab.key}`}
            onSubmit={(e) => e.preventDefault()}
          >
            {tab.fields.map((f) => (
              <label className="field" key={`${tab.key}-${f.label}`}>
                <span className="field__label">{f.label}</span>
                <span className="field__value">
                  <Icon name={f.icon} size={15} />
                  <input defaultValue={f.value} aria-label={f.label} />
                </span>
              </label>
            ))}

            <button type="submit" className="btn btn--primary search__submit">
              <Search size={17} />
              ابحث الآن
            </button>
          </form>
        </div>
      </div>

      <section className="container sect" id="services">
        <SectionHead title={tab.headTitle} sub={tab.headSub} />
        <SortBar options={sortOptions} />
        <div className="grid-3">{renderers[tab.key]?.(list)}</div>
      </section>
    </>
  );
}
