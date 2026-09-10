import Link from 'next/link';
import { notFound } from 'next/navigation';
import AccountSidebar from '../../../components/AccountSidebar';
import ContentForm from '../../../components/ContentForm';
import ContentTable from '../../../components/ContentTable';
import { Icon } from '../../../components/iconMap';
import { ChevronLeft } from '../../../components/Icons';
import prisma from '../../../lib/prisma';
import { requirePermission } from '../../../lib/permissions';
import { getAccountNav } from '../../../lib/queries';
import { safeMetadata } from '../../../lib/metadata';
import { collections, collectionList, serializeRow } from '../../../lib/content-schema';

/* ==========================================================================
   إدارة محتوى الكتالوج — جدول لكل مجموعة ونموذج إضافة/تعديل تحته.

   مسار واحد يخدم كل المجموعات: النوع في الرابط، والوصف في content-schema.js
   هو ما يحدّد الأعمدة والحقول. ‎?edit=<id>‎ يفتح صفًّا للتعديل في النموذج نفسه.
   ========================================================================== */

export const dynamic = 'force-dynamic';

/** «صف واحد» و«صفان» و«3 صفوف» و«12 صفًا» — جمع العربية يتغيّر مع العدد */
function countLabel(count) {
  if (count === 1) return 'صف واحد';
  if (count === 2) return 'صفان';
  if (count <= 10) return `${count} صفوف`;
  return `${count} صفًا`;
}

export async function generateMetadata({ params }) {
  return safeMetadata(async () => {
    const { type } = await params;
    const collection = collections[type];
    return { title: collection ? `${collection.label} — لوحة التحكم` : 'لوحة التحكم' };
  });
}

export default async function ContentAdminPage({ params, searchParams }) {
  const { type } = await params;
  const collection = collections[type];
  if (!collection) notFound();

  const { user, permissions, roleLabel } = await requirePermission(
    'content.write',
    `/admin/content/${type}`,
  );

  const { edit } = await searchParams;

  const [nav, rows, parents] = await Promise.all([
    getAccountNav(),
    prisma[collection.model].findMany({
      orderBy: { order: 'asc' },
      ...(collection.parent && { include: { [collection.parent.model]: { select: { name: true } } } }),
    }),
    collection.parent
      ? prisma[collection.parent.model].findMany({
          orderBy: { name: 'asc' },
          select: { id: true, name: true },
        })
      : [],
  ]);

  // اسم الأب يُعرَض في عمود بدل مُعرّفه
  const listed = collection.parent
    ? rows.map((row) => ({ ...row, __parent: row[collection.parent.model]?.name }))
    : rows;

  const editingRow = edit ? listed.find((row) => row.id === edit) : undefined;

  // الإضافة تبدأ بالقيم الافتراضية للحقول (نجوم 5، خصم 0 …)
  const defaults = Object.fromEntries(
    collection.fields
      .filter((field) => field.default !== undefined)
      .map((field) => [field.name, String(field.default)]),
  );

  return (
    <div className="container account">
      <AccountSidebar user={user} nav={nav} permissions={permissions} roleLabel={roleLabel} />

      <section>
        <div className="pagehead">
          <div className="pagehead__row">
            <Icon name={collection.icon} size={19} />
            <h1>{collection.label}</h1>
          </div>
          <p>{collection.sub}</p>
        </div>

        <div className="content-nav">
          <Link href="/admin" className="chip">
            <ChevronLeft size={14} />
            لوحة التحكم
          </Link>
          {collectionList.map((item) => (
            <Link
              key={item.key}
              href={`/admin/content/${item.key}`}
              className="chip"
              aria-pressed={item.key === collection.key}
            >
              <Icon name={item.icon} size={14} />
              {item.label}
            </Link>
          ))}
        </div>

        <p className="content-count">
          {listed.length === 0 ? 'لا صفوف بعد' : `${countLabel(listed.length)} — الترتيب الأصغر يظهر أولًا`}
        </p>

        <ContentTable collection={collection} rows={listed} editingId={editingRow?.id} />

        {/* مجموعة لا تُضاف من اللوحة: النموذج للتعديل وحده، ومعه سبب ذلك */}
        {collection.noCreate && !editingRow ? (
          <p className="perm-note" style={{ marginTop: 20 }}>
            <Icon name={collection.icon} size={15} />
            {collection.noCreate.note}
            {collection.noCreate.href && (
              <Link href={collection.noCreate.href} className="content-note__link">
                افتح الصفحة
              </Link>
            )}
          </p>
        ) : (
          <ContentForm
            key={editingRow?.id ?? 'new'}
            collection={collection}
            editing={
              editingRow
                ? { id: editingRow.id, title: String(editingRow[collection.identity]) }
                : null
            }
            initial={editingRow ? serializeRow(collection, editingRow) : defaults}
            refOptions={parents.map((row) => ({ value: row.id, label: row.name }))}
          />
        )}
      </section>
    </div>
  );
}
