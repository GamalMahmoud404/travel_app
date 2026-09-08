import Link from 'next/link';
import { Compass } from './components/Icons';

export default function NotFound() {
  return (
    <section className="container sect">
      <div className="empty" style={{ marginTop: 40 }}>
        <Compass size={44} />
        <h1 style={{ fontSize: 22, color: 'var(--text)' }}>الصفحة غير موجودة</h1>
        <p>يبدو أن هذه الوجهة ليست على خريطتنا بعد.</p>
        <Link href="/" className="btn btn--primary">العودة إلى الرئيسية</Link>
      </div>
    </section>
  );
}
