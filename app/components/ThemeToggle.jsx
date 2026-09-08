'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from './Icons';

const KEY = 'rehlaty-theme';

const systemPrefersDark = () =>
  typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

const stored = () => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'dark' || v === 'light' ? v : null;
  } catch {
    return null;
  }
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState(null); // null = لم يُقرأ بعد

  useEffect(() => {
    setTheme(stored() ?? (systemPrefersDark() ? 'dark' : 'light'));
  }, []);

  /* تتبّع تغيّر تفضيل النظام ما لم يختر المستخدم يدويًا */
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return undefined;

    const onChange = (e) => {
      if (stored()) return;
      const next = e.matches ? 'dark' : 'light';
      setTheme(next);
      document.documentElement.dataset.theme = next;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* وضع التصفّح الخاص — يبقى التبديل ساريًا لهذه الجلسة */
    }
  };

  const dark = theme === 'dark';

  return (
    <button
      type="button"
      className="nav__theme"
      onClick={toggle}
      aria-label={dark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع المظلم'}
      title={dark ? 'الوضع الفاتح' : 'الوضع المظلم'}
      aria-pressed={dark}
    >
      {theme === null ? <Sun size={17} /> : dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
