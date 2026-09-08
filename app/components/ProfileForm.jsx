'use client';

import { useActionState } from 'react';
import AvatarPicker from './AvatarPicker';
import { updateProfileAction } from '../lib/actions';
import { CheckCircle, Edit, Mail, Phone, User, XCircle } from './Icons';

const local = (phone) => (phone ?? '').replace(/^\+20\s*/, '').replace(/^—$/, '');

export default function ProfileForm({ user, title }) {
  const [state, action, pending] = useActionState(updateProfileAction, {});
  const v = state?.values ?? {};

  return (
    <form action={action} className="panel">
      <div className="info-card__head">
        <h2>
          <User size={18} />
          {title}
        </h2>
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? 'جارٍ الحفظ…' : 'حفظ التعديلات'}
          <Edit size={15} />
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

        <AvatarPicker initial={user.avatar} />

        <div className="form-row form-row--2">
          <div className="control">
            <label className="control__label" htmlFor="fullname">الاسم بالكامل</label>
            <div className="input">
              <User size={16} />
              <input
                id="fullname"
                name="fullName"
                required
                defaultValue={v.fullName ?? user.fullName}
              />
            </div>
          </div>
          <div className="control">
            <label className="control__label" htmlFor="acc-email">عنوان البريد الإلكتروني</label>
            <div className="input">
              <Mail size={16} />
              <input
                id="acc-email"
                name="email"
                type="email"
                dir="ltr"
                required
                defaultValue={v.email ?? user.email}
              />
            </div>
          </div>
        </div>

        <div className="form-row form-row--2">
          <div className="control">
            <label className="control__label" htmlFor="acc-phone">رقم الهاتف</label>
            <div className="input">
              <Phone size={16} />
              <span className="phone__cc">
                <span className="flag" aria-hidden="true"><i /><i /><i /></span>
                +20
              </span>
              <input
                id="acc-phone"
                name="phone"
                dir="ltr"
                inputMode="tel"
                defaultValue={local(v.phone ?? user.phone)}
              />
            </div>
          </div>
          <div className="control">
            <label className="control__label" htmlFor="acc-phone2">رقم هاتف إضافي</label>
            <div className="input">
              <Phone size={16} />
              <span className="phone__cc">
                <span className="flag" aria-hidden="true"><i /><i /><i /></span>
                +20
              </span>
              <input
                id="acc-phone2"
                name="phoneAlt"
                dir="ltr"
                inputMode="tel"
                defaultValue={local(v.phoneAlt ?? user.phoneAlt ?? '')}
                placeholder="غير محدد"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
