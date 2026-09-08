'use client';

export default function SortBar({ options }) {

  if (!options?.length) return null;

  return (
    <div className="sortbar">
      <label className="sortbar__label" htmlFor="sort">ترتيب حسب:</label>
      <select id="sort" className="select" defaultValue={options[0].label}>
        {options.map((o) => (
          <option key={o.key} value={o.label}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
