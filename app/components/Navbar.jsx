'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import UserChip from './UserChip';
import { Bell, ChevronDown, Menu, X } from './Icons';

export default function Navbar({ site }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    const base = href.split('#')[0];
    return base.length > 1 && pathname.startsWith(base);
  };

  /* التنقّل يُغلق القائمة — الروابط تنقّل من طرف العميل فلا تُعاد تركيب الصفحة */
  useEffect(() => setOpen(false), [pathname]);

  /* فوق نقطة الكسر يعود الشريط الأفقي — نُغلق فلا يبقى قفل التمرير معلّقًا */
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 901px)');
    const sync = () => { if (wide.matches) setOpen(false); };

    sync();
    wide.addEventListener('change', sync);
    return () => wide.removeEventListener('change', sync);
  }, []);

  /**
   * Escape للإغلاق، ومنع تمرير الصفحة خلف القائمة المفتوحة.
   * القفل صفٌّ في الـ CSS داخل نقطة الكسر لا style مباشرًا: فلو اتّسعت النافذة
   * والقائمة مفتوحة يسقط القفل من تلقائه بلا انتظار أي حدث JS.
   */
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };

    document.addEventListener('keydown', onKey);
    document.body.classList.add('is-nav-open');

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-nav-open');
    };
  }, [open]);

  const links = (className) =>
    site.navLinks.map((link) => (
      <Link
        key={link.label}
        href={link.href}
        prefetch
        className={`${className}${isActive(link.href) ? ' is-active' : ''}`}
      >
        {link.label}
        {link.hasMenu && <ChevronDown size={15} />}
      </Link>
    ));

  return (
    <header className="nav">
      <div className="container nav__inner">
        <Logo name={site.name} />

        <nav className="nav__links" aria-label="القائمة الرئيسية">
          {links('nav__link')}
        </nav>

        <div className="nav__tools">
          <button type="button" className="nav__bell" aria-label="الإشعارات">
            <Bell size={17} />
          </button>

          <ThemeToggle />

          <UserChip />

          <button
            type="button"
            className="nav__burger"
            aria-label={open ? 'إغلاق القائمة' : 'القائمة'}
            aria-expanded={open}
            aria-controls="nav-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {open && (
        <>
          <button
            type="button"
            className="nav__backdrop"
            aria-label="إغلاق القائمة"
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <nav id="nav-menu" className="nav__menu" aria-label="القائمة الرئيسية">
            {links('nav__menu-link')}
          </nav>
        </>
      )}
    </header>
  );
}
