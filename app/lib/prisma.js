import { PrismaClient } from '@prisma/client';
import {
  DbUnreachableError,
  dbCircuitOpen,
  isDbUnreachable,
  noteDbReachable,
  noteDbUnreachable,
} from './db-status';

/**
 * عميل Prisma واحد لكل عملية — يمنع فتح اتصالات جديدة مع كل hot-reload.
 *
 * سجل الأخطاء: في التطوير نكتم `error` لأن Prisma يسجّل كل فشل استعلام في
 * الـ console حتى لو أمسكناه، فتعرضه طبقة Next كبطاقة خطأ وتبدو الأخطاء
 * المُعالَجة كأنها انهيار. الفشل يظهر للمستخدم عبر OfflineShell بدلًا من ذلك.
 *
 * القاطع: كل استعلام يمرّ على قاطع الدورة في db-status. فبعد أول فشل اتصال
 * تفشل الاستعلامات فورًا بدل انتظار مهلة اختيار الخادم في كل طلب — وهو سبب
 * تجمّد تسجيل الدخول ثوانٍ قبل ظهور الرسالة.
 */
const globalForPrisma = globalThis;

const createClient = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn'],
  }).$extends({
    query: {
      async $allOperations({ args, query }) {
        if (dbCircuitOpen()) throw new DbUnreachableError();

        try {
          const result = await query(args);
          noteDbReachable();
          return result;
        } catch (error) {
          // أي رد من القاعدة — ولو خطأ منطق — يعني أنها متاحة
          if (isDbUnreachable(error)) noteDbUnreachable();
          else noteDbReachable();
          throw error;
        }
      },
    },
  });

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
