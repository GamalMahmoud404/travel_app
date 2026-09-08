import { notFound, redirect } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import prisma from './prisma';
import { isDbUnreachable } from './db-status';
import { getSessionUser } from './auth';

/* ==========================================================================
   الصلاحيات: كل دور في مجموعة Role يحمل قائمة مفاتيح من مجموعة Permission.
   تعديل ما يستطيعه دور = تعديل مستند في القاعدة، بلا نشر جديد.
   ========================================================================== */

const rbacCache = (fn, key) =>
  unstable_cache(fn, [key], { revalidate: 300, tags: ['content', 'rbac'] });

export const getRoles = rbacCache(() => prisma.role.findMany({ orderBy: { order: 'asc' } }), 'roles');
export const getPermissions = rbacCache(() => prisma.permission.findMany({ orderBy: { order: 'asc' } }), 'permissions');

const readRole = rbacCache((key) => prisma.role.findUnique({ where: { key } }), 'role');

/** مفاتيح صلاحيات المستخدم — مجموعة فارغة لغير المسجَّل أو لدور غير معروف */
export async function roleOf(user) {
  if (!user?.role) return null;
  try {
    return await readRole(user.role);
  } catch (error) {
    if (isDbUnreachable(error)) return null;
    throw error;
  }
}

export async function permissionsOf(user) {
  const role = await roleOf(user);
  return new Set(role?.permissions ?? []);
}

export async function userCan(user, permission) {
  return (await permissionsOf(user)).has(permission);
}

/**
 * يحمي صفحة بصلاحية:
 *  - غير مسجَّل → /login مع العودة
 *  - مسجَّل بلا صلاحية → 404 (لا نكشف وجود الصفحة)
 */
export async function requirePermission(permission, returnTo) {
  const user = await getSessionUser();
  if (!user) redirect(`/login${returnTo ? `?next=${encodeURIComponent(returnTo)}` : ''}`);

  const role = await roleOf(user);
  const allowed = new Set(role?.permissions ?? []);
  if (!allowed.has(permission)) notFound();

  return { user, role, roleLabel: role?.label ?? user.role, can: (p) => allowed.has(p), permissions: [...allowed] };
}

/** مثل requirePermission لكن يعيد المستخدم وصلاحياته معًا للاستخدام في الصفحة */
export async function requireSession(returnTo) {
  const user = await getSessionUser();
  if (!user) redirect(`/login${returnTo ? `?next=${encodeURIComponent(returnTo)}` : ''}`);

  const role = await roleOf(user);
  const allowed = new Set(role?.permissions ?? []);
  return { user, role, roleLabel: role?.label ?? user.role, can: (p) => allowed.has(p), permissions: [...allowed] };
}
