'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadSession, readHint, sessionKey } from './session-store';

/* ==========================================================================
   بطاقة المستخدم في الشريط.

   الاسم يُقرأ من كوكي التلميح (rehlaty_user) فتظهر البطاقة مع أول رسم بلا
   انتظار الشبكة. التلميح للعرض فقط ولا يمنح أي وصول — التحقق يبقى على الكوكي
   الموقَّع httpOnly، و/api/session تصحّح البطاقة في الخلفية.
   ========================================================================== */

export default function UserChip() {
  const pathname = usePathname();
  const [state, setState] = useState({ status: 'loading', user: null });

  useEffect(() => {
    let alive = true;

    const key = sessionKey();
    const hint = readHint(key);
    if (hint) setState({ status: 'hint', user: hint });

    loadSession(key).then((data) => {
      if (!alive || !data) return;
      setState({ status: 'ready', user: data.user });
    });

    return () => { alive = false; };
  }, [pathname]);

  if (state.status === 'loading') {
    return <span className="nav__chip-skeleton" aria-hidden="true" />;
  }

  if (!state.user) {
    return (
      <Link href="/login" className="btn btn--primary nav__login">
        تسجيل الدخول
      </Link>
    );
  }

  const { name, avatar } = state.user;

  return (
    <Link href="/account" className="nav__user">
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="nav__avatar" src={avatar} alt="" />
      ) : (
        // التلميح لا يحمل الصورة المرفوعة (أكبر من حدّ الكوكي) — حرف حتى تصل
        <span className="nav__avatar nav__avatar--initial" aria-hidden="true">
          {[...name][0] ?? '؟'}
        </span>
      )}
      <span>{name}</span>
    </Link>
  );
}
