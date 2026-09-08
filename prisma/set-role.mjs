/**
 * تغيير صفة حساب مسجَّل — لا يُنشئ حسابات.
 *
 *   npm run db:role -- you@mail.com admin
 *   npm run db:role -- you@mail.com user
 *   npm run db:role                        # يعرض الحسابات الحالية
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const [email, role] = process.argv.slice(2);

async function main() {
  if (!email) {
    const users = await prisma.user.findMany({
      select: { fullName: true, email: true, role: true },
      orderBy: { createdAt: 'asc' },
    });
    if (users.length === 0) {
      console.log('لا توجد حسابات — سجّل حسابًا من /register أولًا.');
      return;
    }
    console.log('الحسابات:');
    for (const u of users) console.log(`  ${u.fullName} <${u.email}> — ${u.role}`);
    console.log('\nللترقية: npm run db:role -- <email> admin');
    return;
  }

  if (!['admin', 'user'].includes(role)) {
    console.log('الصفة يجب أن تكون admin أو user.');
    process.exitCode = 1;
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    console.log(`لا يوجد حساب بالبريد ${email}.`);
    process.exitCode = 1;
    return;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role },
  });
  console.log(`✓ ${updated.fullName} <${updated.email}> — الصفة الآن: ${updated.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
