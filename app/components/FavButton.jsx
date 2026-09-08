'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { toggleFavoriteAction } from '../lib/actions';
import { favoriteKey } from '../lib/favorite-key';
import { loadSession, markFavorite, sessionKey } from './session-store';
import { Heart, HeartFilled } from './Icons';

/* ==========================================================================
   زر المفضلة.

   الصفحات العامة ثابتة، فحالة القلب تأتي من /api/session بعد التحميل (مخزَّنة
   ومشتركة بين كل الأزرار). صفحة المفضلة ديناميكية فتُمرّر initial مباشرة.

   الضغط يقلب الشكل فورًا ثم يُنفّذ الإجراء؛ إن فشل يرجع الشكل كما كان. غير
   المسجَّل يُحوَّل إلى /login مع العودة إلى مكانه.
   ========================================================================== */

export default function FavButton({ kind, slug, initial = false, label }) {
  const pathname = usePathname();
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();

  const id = favoriteKey(kind, slug);

  useEffect(() => {
    if (initial) return; // صفحة المفضلة: الحالة معروفة من الخادم
    let alive = true;

    loadSession(sessionKey()).then((data) => {
      if (alive && Array.isArray(data?.favorites)) setOn(data.favorites.includes(id));
    });

    return () => { alive = false; };
  }, [id, initial, pathname]);

  const toggle = () => {
    if (pending) return;

    const next = !on;
    setOn(next);
    markFavorite(id, next);

    start(async () => {
      const result = await toggleFavoriteAction({ kind, slug, from: pathname });

      // الإجراء يعيد الحالة الفعلية — نرجع عن التفاؤل إن رفضها الخادم
      if (result && result.ok === false) {
        setOn(!next);
        markFavorite(id, !next);
      }
    });
  };

  const text = label ?? (on ? 'إزالة من المفضلة' : 'أضف إلى المفضلة');

  return (
    <button
      type="button"
      className={`fav${on ? ' is-on' : ''}`}
      aria-pressed={on}
      aria-label={text}
      title={text}
      onClick={toggle}
    >
      {on ? <HeartFilled size={17} /> : <Heart size={17} />}
    </button>
  );
}
