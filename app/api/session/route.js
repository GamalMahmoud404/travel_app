import { getSessionUser, pruneStaleSession } from '../../lib/auth';
import { roleOf } from '../../lib/permissions';
import { getFavoriteIds } from '../../lib/favorites';
import { isDbUnreachable } from '../../lib/db-status';

/* الجلسة عبر نقطة مستقلة — حتى تبقى الصفحات ثابتة وقابلة للتحميل المسبق */
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    // هذه النقطة route handler، فيُسمح فيها بتعديل الكوكيز — نُنظّف الجلسة الميتة
    await pruneStaleSession();
    return Response.json({ user: null }, { headers: { 'Cache-Control': 'no-store' } });
  }

  // المفضلة مع الجلسة في طلب واحد — أزرار القلب في الصفحات الثابتة تقرؤها
  const [role, favorites] = await Promise.all([
    roleOf(user),
    getFavoriteIds(user.id).catch((error) => {
      if (isDbUnreachable(error)) return [];
      throw error;
    }),
  ]);

  return Response.json(
    {
      user: {
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        roleLabel: role?.label ?? user.role,
      },
      favorites,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
