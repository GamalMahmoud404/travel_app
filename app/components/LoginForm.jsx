'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { loginAction } from '../lib/actions';
import { Lock, Mail, XCircle } from './Icons';

export default function LoginForm({ legend, next }) {
  const [state, action, pending] = useActionState(loginAction, {});

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

        <div className="control">
          <label className="control__label" htmlFor="login-email">عنوان البريد الإلكتروني</label>
          <div className="input">
            <Mail size={16} />
            <input
              id="login-email"
              name="email"
              type="email"
              dir="ltr"
              autoComplete="email"
              required
              defaultValue={state?.email ?? ''}
              placeholder="Email@gmail.com"
            />
          </div>
        </div>

        <div className="control">
          <label className="control__label" htmlFor="login-password">كلمة المرور</label>
          <div className="input">
            <Lock size={16} />
            <input
              id="login-password"
              name="password"
              type="password"
              dir="ltr"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </div>
        </div>

        <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={pending}>
          {pending ? 'جارٍ الدخول…' : 'تسجيل الدخول'}
        </button>

        <p className="auth__switch">
          ليس لديك حساب؟ <Link href="/register" className="link-teal">إنشاء حساب جديد</Link>
        </p>
      </div>
    </form>
  );
}
