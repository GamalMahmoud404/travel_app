'use client';

import OfflineShell from './components/OfflineShell';
import './globals.css';

/**
 * شبكة الأمان الأخيرة: أخطاء الـ layout الجذري لا يمسكها app/error.jsx،
 * وهذا الملف وحده يمسكها — لذلك يجب أن يرسم <html> و<body> بنفسه.
 */
export default function GlobalError({ error, reset }) {
  const dbDown = /Server selection timeout|InternalError|querySrv|ECONNREFUSED|P1001|P2010|siteSetting/i.test(
    `${error?.message ?? ''} ${error?.digest ?? ''}`,
  );

  return (
    <html lang="ar" dir="rtl">
      <body>
        <main className="page">
          {dbDown ? (
            <OfflineShell detail={error?.message} onRetry={reset} />
          ) : (
            <section className="container sect">
              <div className="offline">
                <h1>حدث خطأ غير متوقع</h1>
                <p className="offline__lead">{error?.message ?? 'خطأ غير معروف.'}</p>
                <button type="button" className="btn btn--primary btn--lg" onClick={reset}>
                  إعادة المحاولة
                </button>
              </div>
            </section>
          )}
        </main>
      </body>
    </html>
  );
}
