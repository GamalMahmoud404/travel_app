import { setUserRoleAction } from '../lib/actions';
import { Users } from './Icons';

export default function UsersPanel({ title, sub, users, roles, currentUserId, canWrite, adminCount }) {
  const labelOf = (key) => roles.find((r) => r.key === key)?.label ?? key;

  return (
    <div className="panel" style={{ marginTop: 20 }}>
      <h2 className="panel__head">
        <Users size={18} />
        <span style={{ display: 'grid', gap: 0 }}>
          {title}
          <span className="price__label" style={{ fontWeight: 500 }}>{sub}</span>
        </span>
      </h2>

      <div className="info-card__body">
        <div className="admin-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>الحساب</th>
                <th>البريد الإلكتروني</th>
                <th>الصفة</th>
                {canWrite && <th>تغيير الصفة</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUserId;
                const lastAdmin = u.role === 'admin' && adminCount <= 1;
                const locked = isSelf || lastAdmin;

                return (
                  <tr key={u.id}>
                    <td>
                      <span className="admin-user">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u.avatar} alt="" />
                        <span>
                          <strong>{u.fullName}</strong>
                          <span dir="ltr">{u.phone}</span>
                        </span>
                      </span>
                    </td>
                    <td dir="ltr">{u.email}</td>
                    <td>
                      <span className={`role-badge${u.role === 'admin' ? ' role-badge--admin' : ''}`}>
                        {labelOf(u.role)}
                      </span>
                    </td>

                    {canWrite && (
                      <td>
                        {locked ? (
                          <span className="perm-meta" style={{ marginTop: 0 }}>
                            {isSelf ? 'لا يمكنك تغيير صفتك' : 'آخر أدمن — لا يمكن تخفيضه'}
                          </span>
                        ) : (
                          <form action={setUserRoleAction} className="role-form">
                            <input type="hidden" name="id" value={u.id} />
                            <div className="input input--select" style={{ minHeight: 38 }}>
                              <select name="role" defaultValue={u.role}>
                                {roles.map((r) => (
                                  <option key={r.key} value={r.key}>{r.label}</option>
                                ))}
                              </select>
                            </div>
                            <button type="submit" className="btn btn--ghost">حفظ</button>
                          </form>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
