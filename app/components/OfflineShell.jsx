'use client';

import { Info } from './Icons';

/**
 * تُعرض حين يتعذّر على الـ layout الجذري قراءة إعدادات الموقع من القاعدة.
 * لا تعرض محتوى مُختلقًا — سببًا واضحًا وخطوات فقط.
 */
export default function OfflineShell({ detail, onRetry }) {
  const tlsAlert = /InternalError|fatal alert/i.test(detail ?? '');

  return (
    <section className="container sect">
      <div className="offline">
        <span className="offline__icon">
          <Info size={34} />
        </span>

        <h1>تعذّر الوصول إلى قاعدة البيانات</h1>
        <p className="offline__lead">
          كل محتوى الموقع يُقرأ من MongoDB، والاتصال بعُقد الكلاستر مرفوض حاليًا.
          لم يُفقد شيء — المحتوى محفوظ في <code>prisma/seed-data.json</code>.
        </p>

        {tlsAlert && (
          <p className="offline__lead offline__hint">
            الرفض على مستوى TLS من الكلاستر نفسه (لا من الشبكة)، وأشهر سببين:
            <strong> عنوان IP غير مُدرَج في Atlas</strong>، أو <strong>كلاستر متوقّف</strong>.
          </p>
        )}

        <ol className="offline__steps">
          <li>
            في Atlas → <strong>Network Access</strong> → <strong>IP Access List</strong>:
            أضف عنوانك الحالي (اضغط «Add Current IP Address»)، أو <code>0.0.0.0/0</code>
            مؤقتًا للتطوير. عنوان الإنترنت المنزلي متغيّر، فتغيّره يقطع الاتصال فجأة.
          </li>
          <li>
            في Atlas → <strong>Database</strong>: إن ظهر الكلاستر <strong>Paused</strong>،
            اضغط <strong>Resume</strong> وانتظر دقيقتين.
          </li>
          <li>
            ثم أعد الزرع: <code>npm run db:seed -- --force</code>
          </li>
        </ol>

        {detail && (
          <details className="offline__detail">
            <summary>تفاصيل الخطأ</summary>
            <pre dir="ltr">{detail}</pre>
          </details>
        )}

        <button
          type="button"
          className="btn btn--primary btn--lg"
          onClick={onRetry ?? (() => window.location.reload())}
        >
          إعادة المحاولة
        </button>
      </div>
    </section>
  );
}
