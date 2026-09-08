'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';
import { Icon } from './iconMap';

export default function AccountSidebar({ user, nav, permissions = [], roleLabel }) {
  const pathname = usePathname();
  const allowed = new Set(permissions);
  const items = nav.filter((item) => !item.requires || allowed.has(item.requires));

  return (
    <aside className="panel acct-side">
      <div className="acct-side__user">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={user.avatar} alt="" />
        <strong>{user.fullName}</strong>
        <span className={`role-badge${user.role === 'admin' ? ' role-badge--admin' : ''}`}>
          {roleLabel ?? user.role}
        </span>
        <span dir="ltr">{user.email}</span>
        <span dir="ltr">{user.phone}</span>
      </div>

      <nav className="acct-side__nav" aria-label="حسابي">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`acct-side__link${pathname === item.href ? ' is-active' : ''}`}
          >
            <Icon name={item.icon} size={16} />
            {item.label}
          </Link>
        ))}

        <LogoutButton />
      </nav>
    </aside>
  );
}
