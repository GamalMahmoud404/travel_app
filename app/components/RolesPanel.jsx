import { Check, ShieldCheck } from './Icons';

const groups = {
  content: 'المحتوى',
  bookings: 'الحجوزات',
  users: 'المستخدمون',
  system: 'النظام',
};

export default function RolesPanel({ title, sub, roles, permissions }) {
  return (
    <div className="panel" style={{ marginTop: 20 }}>
      <h2 className="panel__head">
        <ShieldCheck size={18} />
        <span style={{ display: 'grid', gap: 0 }}>
          {title}
          <span className="price__label" style={{ fontWeight: 500 }}>{sub}</span>
        </span>
      </h2>

      <div className="info-card__body">
        <div className="admin-wrap">
          <table className="admin-table perm-table">
            <thead>
              <tr>
                <th>الصلاحية</th>
                {roles.map((r) => (
                  <th key={r.key} style={{ textAlign: 'center' }}>{r.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => (
                <tr key={p.key}>
                  <td>
                    <strong style={{ fontSize: 13 }}>{p.label}</strong>
                    <span className="perm-meta">
                      {groups[p.group] ?? p.group} · <code>{p.key}</code>
                    </span>
                  </td>
                  {roles.map((r) => {
                    const on = r.permissions.includes(p.key);
                    return (
                      <td key={r.key} style={{ textAlign: 'center' }}>
                        <span className={`perm-dot${on ? ' is-on' : ''}`}>
                          {on ? <Check size={13} /> : '—'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {roles.map((r) => (
          <p className="perm-note" key={r.key}>
            <span className={`role-badge${r.key === 'admin' ? ' role-badge--admin' : ''}`}>{r.label}</span>
            {r.description}
          </p>
        ))}
      </div>
    </div>
  );
}
