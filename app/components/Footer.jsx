import Link from 'next/link';
import Logo from './Logo';
import { Facebook, Instagram, Mail, MapPin, Phone, TikTok, Twitter } from './Icons';

const socialIcons = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  tiktok: TikTok,
};

export default function Footer({ site }) {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        {site.footerColumns.map((col) => (
          <div className="footer__col" key={col.title}>
            <h4>{col.title}</h4>
            <ul className="footer__links">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="footer__col">
          <h4>تواصل معنا</h4>
          <ul className="footer__contact">
            <li>
              <span className="footer__ic"><Phone size={15} /></span>
              <span dir="ltr">{site.phone}</span>
            </li>
            <li>
              <span className="footer__ic"><Mail size={15} /></span>
              <span dir="ltr">{site.email}</span>
            </li>
            <li>
              <span className="footer__ic"><MapPin size={15} /></span>
              <span>{site.address}</span>
            </li>
          </ul>
        </div>

        <div className="footer__brand">
          <span className="footer__logo">
            <Logo size={30} href={null} name={site.name} />
          </span>
          <p className="footer__tagline">{site.tagline}</p>
          <span className="footer__follow">{site.followLabel}</span>
          <div className="socials">
            {site.socials.map((s) => {
              const Icon = socialIcons[s.platform] ?? Instagram;
              return (
                <a key={s.platform} href={s.href} aria-label={s.label}>
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container footer__bar">
        <span>© {new Date().getFullYear()} {site.name} — {site.copyright}</span>
        <span>{site.footerNote}</span>
      </div>
    </footer>
  );
}
