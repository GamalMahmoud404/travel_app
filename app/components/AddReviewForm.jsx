'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { addReviewAction } from '../lib/actions';
import { loadSession, readHint, sessionKey } from './session-store';
import { CheckCircle, Edit, Star, XCircle } from './Icons';

/* ==========================================================================
   «شارك رأيك» في صفحة آراء العملاء.

   الصفحة ثابتة (ISR) فلا يعرف الخادم من الزائر — الجلسة تُقرأ في المتصفح من
   كوكي التلميح ثم من /api/session، كما يفعل الشريط وأزرار المفضلة. الاسم
   والصورة لا يُكتبان في النموذج: الإجراء يأخذهما من الملف الشخصي.

   بعد النشر: الإجراء يُبطل مخزَّن المحتوى، و router.refresh() يعيد جلب
   الصفحة الثابتة المحدَّثة فيظهر الرأي في القائمة أعلاه بلا تحديث يدوي.
   ========================================================================== */

/* نص عربي خالص: خلط رموز ★ بالعربية في الخيار نفسه يقلب ترتيب الاتجاهين */
const STARS = [
  { value: 5, label: '5 من 5 — ممتاز' },
  { value: 4, label: '4 من 5 — جيد جدًا' },
  { value: 3, label: '3 من 5 — جيد' },
  { value: 2, label: '2 من 5 — مقبول' },
  { value: 1, label: '1 من 5 — سيئ' },
];

export default function AddReviewForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(addReviewAction, {});
  const [session, setSession] = useState({ status: 'loading', user: null });

  useEffect(() => {
    let alive = true;

    const key = sessionKey();
    const hint = readHint(key);
    if (hint) setSession({ status: 'hint', user: hint });

    loadSession(key).then((data) => {
      if (alive && data) setSession({ status: 'ready', user: data.user });
    });

    return () => { alive = false; };
  }, []);

  // الرأي المنشور يظهر في القائمة أعلاه بعد إعادة الجلب
  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state?.ok, router]);

  if (session.status === 'loading') {
    return <div className="panel panel__pad review-form" aria-hidden="true"><span className="sk" style={{ height: 18, width: '40%' }} /></div>;
  }

  if (!session.user) {
    return (
      <div className="panel panel__pad review-form review-form--guest">
        <div>
          <strong>شارك تجربتك مع رحلتي</strong>
          <p className="price__label">سجّل الدخول لتكتب رأيك ويظهر في هذه الصفحة.</p>
        </div>
        <Link href="/login?next=%2Freviews" className="btn btn--primary">تسجيل الدخول</Link>
      </div>
    );
  }

  const values = state?.values ?? {};

  return (
    <form action={action} className="panel review-form">
      <div className="info-card__head">
        <h2>
          <Edit size={18} />
          شارك رأيك
        </h2>
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? 'جارٍ النشر…' : 'انشر رأيي'}
        </button>
      </div>

      <div className="info-card__body">
        {state?.error && (
          <p className="auth__error" role="alert">
            <XCircle size={16} />
            {state.error}
          </p>
        )}
        {state?.ok && (
          <p className="form-ok" role="status">
            <CheckCircle size={16} />
            {state.ok}
          </p>
        )}

        <p className="review-form__who">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {session.user.avatar && <img src={session.user.avatar} alt="" />}
          يُنشَر باسم <strong>{session.user.name}</strong> وصورة ملفك الشخصي
        </p>

        <div className="form-row form-row--2">
          <div className="control">
            <label className="control__label" htmlFor="review-trip">الرحلة</label>
            <div className="input">
              <input
                id="review-trip"
                name="trip"
                required
                defaultValue={values.trip ?? ''}
                placeholder="باقة شرم للاسترخاء"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="control">
            <label className="control__label" htmlFor="review-rating">التقييم</label>
            <div className="input input--select">
              <Star size={15} />
              <select id="review-rating" name="rating" defaultValue={values.rating || '5'}>
                {STARS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="control">
          <label className="control__label" htmlFor="review-text">رأيك</label>
          <div className="input input--area">
            <textarea
              id="review-text"
              name="text"
              rows={4}
              required
              maxLength={600}
              defaultValue={values.text ?? ''}
              placeholder="ما الذي أعجبك في تجربتك؟"
            />
          </div>
          <span className="content-hint">حتى 600 حرف — رأي واحد لكل حساب، والكتابة مرة أخرى تُحدّث رأيك.</span>
        </div>
      </div>
    </form>
  );
}
