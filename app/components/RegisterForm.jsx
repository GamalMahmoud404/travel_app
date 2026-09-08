'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import AvatarPicker from './AvatarPicker';
import { registerAction } from '../lib/actions';
import { Lock, Mail, Phone, User, XCircle } from './Icons';

export default function RegisterForm({ legend, next }) {
  const [state, action, pending] = useActionState(registerAction, {});
  const v = state?.values ?? {};

  return (
    <form action={action} className="panel auth__card">
      <div className="form-bar">{legend}</div>

      <div className="auth__body">
        {state?.error && (
          <p className="auth__error" role="alert">
            <XCircle size={16} />
            {state.error}
          </p>
        )}

        <input type="hidden" name="next" value={next} />

        <AvatarPicker />

        <div className="control">
          <label className="control__label" htmlFor="reg-name">الاسم بالكامل</label>
          <div className="input">
            <User size={16} />
            <input
              id="reg-name"
              name="fullName"
              autoComplete="name"
              required
              defaultValue={v.fullName ?? ''}
              placeholder="أدخل اسمك بالكامل"
            />
          </div>
        </div>

        <div className="control">
          <label className="control__label" htmlFor="reg-email">عنوان البريد الإلكتروني</label>
          <div className="input">
            <Mail size={16} />
            <input
              id="reg-email"
              name="email"
              type="email"
              dir="ltr"
              autoComplete="email"
              required
              defaultValue={v.email ?? ''}
              placeholder="Email@gmail.com"
            />
          </div>
        </div>

        <div className="control">
          <label className="control__label" htmlFor="reg-phone">رقم الهاتف</label>
          <div className="input">
            <Phone size={16} />
            <span className="phone__cc">
              <span className="flag" aria-hidden="true"><i /><i /><i /></span>
              +20
            </span>
            <input
              id="reg-phone"
              name="phone"
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              defaultValue={v.phone ?? ''}
              placeholder="+20 — 10 xxx xxxx"
            />
          </div>
        </div>

        <div className="form-row form-row--2">
          <div className="control">
            <label className="control__label" htmlFor="reg-password">كلمة المرور</label>
            <div className="input">
              <Lock size={16} />
              <input
                id="reg-password"
                name="password"
                type="password"
                dir="ltr"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="8 أحرف على الأقل"
              />
            </div>
          </div>
          <div className="control">
            <label className="control__label" htmlFor="reg-confirm">تأكيد كلمة المرور</label>
            <div className="input">
              <Lock size={16} />
              <input
                id="reg-confirm"
                name="confirm"
                type="password"
                dir="ltr"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="أعد كتابة كلمة المرور"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={pending}>
          {pending ? 'جارٍ إنشاء الحساب…' : 'إنشاء الحساب'}
        </button>

        <p className="auth__switch">
          لديك حساب بالفعل؟ <Link href="/login" className="link-teal">تسجيل الدخول</Link>
        </p>
      </div>
    </form>
  );
}
