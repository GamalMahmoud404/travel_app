'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import prisma from './prisma';
import { getSessionUser } from './auth';
import { permissionsOf } from './permissions';
import { DB_DOWN_MESSAGE, isDbUnreachable } from './db-status';
import { collections, parseRow } from './content-schema';

/* ==========================================================================
   إجراءات محتوى لوحة التحكم — إضافة وتعديل وحذف صفوف الكتالوج.

   إجراء واحد يخدم كل المجموعات: النوع يأتي في المُرسَل (__type)، والوصف في
   content-schema.js هو ما يحدّد الحقول والتحقق. المُعرّف (__id) فارغ = إضافة.

   أمان: الإجراءات مكشوفة لطلبات POST مباشرة، فالتحقق من الجلسة والصلاحية
   يتكرّر داخل كل إجراء — لا يُكتفى بحارس الصفحة.
   ========================================================================== */

const LOGIN = '/login?next=%2Fadmin';

/** جلسة + صلاحية content.write، أو خروج */
async function requireWriter() {
  const actor = await getSessionUser();
  if (!actor) redirect(LOGIN);
  if (!(await permissionsOf(actor)).has('content.write')) return null;
  return actor;
}

function collectionOf(formData) {
  const type = String(formData.get('__type') ?? '');
  return collections[type] ?? null;
}

/** إبطال مخزَّن المحتوى — الصفحات تقرأ من unstable_cache بوسم content */
function refreshContent(type) {
  updateTag('content');
  revalidatePath(`/admin/content/${type}`);
  revalidatePath('/admin');
}

/**
 * القيمة الفريدة مأخوذة؟ MongoDB يرمي P2002 على القيد الفريد، لكن الرسالة
 * الخام غير مفهومة للأدمن — فنفحص قبل الكتابة ونعيد نصًّا واضحًا.
 */
async function identityTaken(collection, data, id) {
  const key = collection.identity;
  const where = { [key]: data[key] };

  // مُعرّف الغرفة فريد داخل فندقها فقط
  if (collection.parent) where[collection.parent.field] = data[collection.parent.field];

  const existing = await prisma[collection.model].findFirst({ where, select: { id: true } });
  return existing && existing.id !== id;
}

/* --------------------------------------------------------- إضافة وتعديل */

export async function saveContentAction(_prev, formData) {
  const actor = await requireWriter();
  if (!actor) return { error: 'ليست لديك صلاحية تعديل المحتوى.' };

  const collection = collectionOf(formData);
  if (!collection) return { error: 'نوع محتوى غير معروف.' };

  const id = String(formData.get('__id') ?? '').trim();
  const parsed = parseRow(collection, formData);
  if (!parsed.ok) return { error: parsed.error, values: parsed.values };

  const { data, values } = parsed;
  const fail = (error) => ({ error, values });
  const delegate = prisma[collection.model];

  try {
    // الأب موجود؟ (الغرفة بلا فندق تختفي من الواجهة بلا خطأ ظاهر)
    if (collection.parent) {
      const parentId = data[collection.parent.field];
      const parent = await prisma[collection.parent.model].findUnique({
        where: { id: parentId },
        select: { id: true },
      });
      if (!parent) return fail(`${collection.parent.label} المختار غير موجود.`);
    }

    if (await identityTaken(collection, data, id)) {
      return fail(`القيمة «${data[collection.identity]}» مستخدمة بالفعل — اختر غيرها.`);
    }

    if (id) {
      const current = await delegate.findUnique({ where: { id }, select: { id: true } });
      if (!current) return fail('هذا الصف غير موجود — ربما حُذف من نافذة أخرى.');

      await delegate.update({ where: { id }, data });
      refreshContent(collection.key);
      return { ok: `تم حفظ التعديلات على «${data[collection.identity]}».` };
    }

    // ما لا يُضاف من اللوحة (الآراء) لا يُضاف بطلب POST مباشر أيضًا
    if (collection.noCreate) return fail(collection.noCreate.note);

    // الترتيب الفارغ = في نهاية القائمة
    if (data.order === undefined) data.order = await delegate.count();

    await delegate.create({ data });
    refreshContent(collection.key);
    return { ok: `تمت إضافة ${collection.single} «${data[collection.identity]}».` };
  } catch (error) {
    if (isDbUnreachable(error)) return fail(DB_DOWN_MESSAGE);
    if (error?.code === 'P2002') return fail('هذه القيمة مستخدمة بالفعل — اختر مُعرّفًا آخر.');
    throw error;
  }
}

/* ------------------------------------------------------------------ حذف */

export async function deleteContentAction(formData) {
  const actor = await requireWriter();
  if (!actor) return;

  const collection = collectionOf(formData);
  if (!collection) return;

  const id = String(formData.get('__id') ?? '').trim();
  if (!id) return;

  try {
    await prisma[collection.model].delete({ where: { id } });
  } catch (error) {
    if (isDbUnreachable(error)) return;
    if (error?.code === 'P2025') return; // حُذف بالفعل
    throw error;
  }

  refreshContent(collection.key);
  redirect(`/admin/content/${collection.key}`);
}
