import Link from 'next/link';
import DeleteRowButton from './DeleteRowButton';
import { deleteContentAction } from '../lib/content-actions';
import { fieldOf, formatCell } from '../lib/content-schema';
import { Edit } from './Icons';
import { Icon } from './iconMap';

/* جدول صفوف مجموعة واحدة — الأعمدة من وصف المجموعة */
export default function ContentTable({ collection, rows, editingId }) {
  const identity = fieldOf(collection, collection.identity);
  const columns = collection.columns.map((name) => fieldOf(collection, name)).filter(Boolean);

  if (rows.length === 0) {
    return (
      <div className="empty" style={{ padding: '34px 20px' }}>
        <Icon name={collection.icon} size={34} />
        <p>
          {collection.noCreate
            ? `لا توجد بيانات في ${collection.label} بعد.`
            : `لا توجد بيانات في ${collection.label} بعد — أضف أول ${collection.single} من النموذج أدناه.`}
        </p>
      </div>
    );
  }

  return (
    <div className="admin-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>{identity?.label ?? collection.identity}</th>
            {collection.parent && <th>{collection.parent.label}</th>}
            {columns.map((field) => (
              <th key={field.name}>{field.label}</th>
            ))}
            <th>الترتيب</th>
            <th>تحرير</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const title = String(row[collection.identity] ?? row.id);

            return (
              <tr key={row.id} className={row.id === editingId ? 'is-editing' : undefined}>
                <td>
                  <strong dir={identity?.type === 'slug' ? 'ltr' : undefined}>{title}</strong>
                </td>

                {collection.parent && <td>{row.__parent ?? '—'}</td>}

                {columns.map((field) => (
                  <td key={field.name}>{formatCell(field, row[field.name])}</td>
                ))}

                <td dir="ltr">{row.order}</td>

                <td>
                  <div className="content-actions">
                    <Link
                      href={`/admin/content/${collection.key}?edit=${row.id}`}
                      className="btn btn--ghost btn--sm"
                      scroll={false}
                    >
                      <Edit size={14} />
                      تعديل
                    </Link>

                    <DeleteRowButton
                      action={deleteContentAction}
                      type={collection.key}
                      id={row.id}
                      label={title}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
