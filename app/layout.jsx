import { Cairo } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import OfflineShell from './components/OfflineShell';
import { getSite } from './lib/queries';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-cairo',
});

/* يُطبَّق قبل أول رسم فلا يحدث وميض من الفاتح إلى المظلم */
const THEME_INIT = `(function(){try{var t=localStorage.getItem('rehlaty-theme');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t}}catch(e){}})()`;

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0d2b45' },
    { media: '(prefers-color-scheme: dark)', color: '#0a1520' },
  ],
};

/**
 * إعدادات الموقع أو null.
 * لا نرمي من الـ layout الجذري لأن أخطاءه لا يمسكها app/error.jsx.
 */
async function siteOrNull() {
  try {
    return { site: await getSite() };
  } catch (error) {
    return { site: null, error: String(error?.message ?? error) };
  }
}

export async function generateMetadata() {
  const { site } = await siteOrNull();

  return site
    ? { title: site.metaTitle, description: site.metaDescription }
    : { title: 'رحلتي — تعذّر الوصول إلى قاعدة البيانات' };
}

export default async function RootLayout({ children }) {
  const { site, error } = await siteOrNull();

  const shell = (body) => (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        {body}
      </body>
    </html>
  );

  if (!site) {
    return shell(<main className="page"><OfflineShell detail={error} /></main>);
  }

  return shell(
    <>
      <Navbar site={site} />
      <main className="page">{children}</main>
      <Footer site={site} />
    </>,
  );
}
