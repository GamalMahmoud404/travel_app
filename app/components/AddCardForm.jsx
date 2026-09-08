'use client';

import { useActionState } from 'react';
import { addCardAction } from '../lib/actions';
import { Calendar, CheckCircle, CreditCard, User, XCircle } from './Icons';

export default function AddCardForm({ title, sub }) {
  const [state, action, pending] = useActionState(addCardAction, {});
  const v = state?.values ?? {};

  return (
    <form action={action} className="panel" style={{ marginTop: 20 }}>
      <h2 className="panel__head">
        <CreditCard size={18} />
        <span style={{ display: 'grid', gap: 0 }}>
          {title}
          <span className="price__label" style={{ fontWeight: 500 }}>{sub}</span>
        </span>
      </h2>

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

        <div className="control">
          <label className="control__label" htmlFor="card-holder">اسم صاحب البطاقة</label>
          <div className="input">
            <User size={16} />
            <input
              id="card-holder"
              name="holder"
              required
              defaultValue={v.holder ?? ''}
              placeholder="كما هو مكتوب على البطاقة"
            />
          </div>
        </div>

        <div className="form-row form-row--2">
          <div className="control">
            <label className="control__label" htmlFor="card-number">رقم البطاقة</label>
            <div className="input">
              <CreditCard size={16} />
              <input
                id="card-number"
                name="number"
                dir="ltr"
                inputMode="numeric"
                autoComplete="off"
                required
                placeholder="1234 5678 9012 3456"
              />
            </div>
          </div>
          <div className="control">
            <label className="control__label" htmlFor="card-expiry">تاريخ الانتهاء</label>
            <div className="input">
              <Calendar size={16} />
              <input
                id="card-expiry"
                name="expiry"
                dir="ltr"
                required
                defaultValue={v.expiry ?? ''}
                placeholder="MM / YY"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn--primary btn--lg" disabled={pending} style={{ justifySelf: 'start' }}>
          {pending ? 'جارٍ الإضافة…' : 'إضافة البطاقة'}
        </button>
      </div>
    </form>
  );
}
