'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import UserChip from './UserChip';
import { Bell, ChevronDown, Menu } from './Icons';

export default function Navbar({ site }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    const base = href.split('#')[0];
    return base.length > 1 && pathname.startsWith(base);
  };

  return (
    <header className="nav">
      <div className="container nav__inner">
        <Logo name={site.name} />

        <nav className="nav__links" aria-label="القائمة الرئيسية">
          {site.navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              prefetch
              className={`nav__link${isActive(link.href) ? ' is-active' : ''}`}
            >
              {link.label}
              {link.hasMenu && <ChevronDown size={15} />}
            </Link>
          ))}
        </nav>

        <div className="nav__tools">
          <button type="button" className="nav__bell" aria-label="الإشعارات">
            <Bell size={17} />
          </button>

          <ThemeToggle />

          <UserChip />

          <button type="button" className="nav__burger" aria-label="القائمة">
            <Menu size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}
