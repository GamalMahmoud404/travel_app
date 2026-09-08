'use client';

import Link from 'next/link';
import { Info } from './components/Icons';

/**
 * حدود خطأ عامة — تمنع صفحة 500 الخام حين تتعذّر قاعدة البيانات
 * (انقطاع شبكة، أو حجب TLS لـ Atlas).
 */
export default function Error({ error, reset }) {
  const dbDown = /Server selection timeout|InternalError|querySrv|ECONNREFUSED|P1001|P2010/i.test(
    `${error?.message ?? ''} ${error?.digest ?? ''}`,
  );

  return (
    <section className="container sect">
      <div className="empty" style={{ marginTop: 40, maxWidth: 620, marginInline: 'auto' }}>
        <Info size={40} />
        <h1 style={{ fontSize: 21, color: 'var(--text)' }}>
          {dbDown ? 'تعذّر الوصول إلى قاعدة البيانات' : 'حدث خطأ غير متوقع'}
        </h1>
        <p style={{ lineHeight: 1.9 }}>
          {dbDown
            ? 'الاتصال بـ MongoDB Atlas مرفوض من الشبكة الحالية. الصفحات المخزَّنة تعمل، أما ما يحتاج قراءة مباشرة (حجوزاتك وحسابك) فيحتاج عودة الاتصال.'
            : 'أعد المحاولة، وإن تكرّر الخطأ فراجع سجل الخادم.'}
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button type="button" className="btn btn--primary" onClick={reset}>
            إعادة المحاولة
          </button>
          <Link href="/" className="btn btn--outline">العودة إلى الرئيسية</Link>
        </div>
      </div>
    </section>
  );
}
