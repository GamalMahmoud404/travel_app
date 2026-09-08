'use client';

import { useState } from 'react';
import { FavoriteCard } from './Cards';
import { Search } from './Icons';

export default function FavoritesGrid({ favorites, filters }) {
  const [filter, setFilter] = useState(filters[0]?.key);
  const [query, setQuery] = useState('');

  const list = favorites.filter((f) => {
    const byKind = filter === filters[0]?.key || f.kind === filter;
    const byQuery = !query.trim() || f.name.includes(query.trim());
    return byKind && byQuery;
  });

  return (
    <>
      <div className="fav-toolbar">
        <div className="input search-inline">
          <Search size={16} />
          <input
            placeholder="ابحث"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="ابحث في المفضلة"
          />
        </div>

        <div className="chips">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              className="chip"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <p>لا توجد عناصر مطابقة في المفضلة.</p>
        </div>
      ) : (
        <div className="grid-3">
          {list.map((item) => (
            <FavoriteCard item={item} key={item.id} />
          ))}
        </div>
      )}
    </>
  );
}
