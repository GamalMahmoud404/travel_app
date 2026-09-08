'use client';

import { useState } from 'react';
import { Calendar, Cash, Check, CreditCard, Lock } from './Icons';

function Brand({ name }) {
  const cls =
    name === 'VISA' ? 'brandmark brandmark--visa'
      : name === 'MC' ? 'brandmark brandmark--mc'
        : name === 'ميزة' ? 'brandmark brandmark--meeza'
          : 'brandmark';

  if (name === 'MC') {
    return (
      <span className={cls} aria-label="Mastercard">
        <svg width="26" height="16" viewBox="0 0 32 20" aria-hidden="true">
          <circle cx="12" cy="10" r="8" fill="#eb001b" />
          <circle cx="20" cy="10" r="8" fill="#f79e1b" opacity=".85" />
        </svg>
      </span>
    );
  }

  if (name === 'Pay') {
    return <span className="brandmark" aria-label="Apple Pay">Pay</span>;
  }

  if (name === 'Cash') {
    return <span className="brandmark" aria-label="نقدًا" style={{ color: '#16a34a' }}><Cash size={15} /></span>;
  }

  return <span className={cls}>{name}</span>;
}

export default function PaymentMethods({ methods, copy }) {
  const [method, setMethod] = useState(methods[0]?.key);

  return (
    <div className="panel">
      <h2 className="panel__head">
        <Lock size={18} />
        <span style={{ display: 'grid', gap: 0 }}>
          {copy.title}
          <span className="price__label" style={{ fontWeight: 500 }}>{copy.sub}</span>
        </span>
      </h2>

      <div className="panel__text" style={{ gap: 14 }}>
        {methods.map((m) => (
          <div key={m.key}>
            <label className={`pay-option${method === m.key ? ' is-on' : ''}`}>
              <span className="pay-option__label">
                <strong>{m.title}</strong>
                <span>{m.note}</span>
              </span>
              <span className="pay-option__aside">
                {m.brands.map((b) => <Brand name={b} key={b} />)}
                <input
                  type="radio"
                  name="pay"
                  value={m.key}
                  checked={method === m.key}
                  onChange={() => setMethod(m.key)}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                />
                <span className={`radio${method === m.key ? ' is-on' : ''}`} aria-hidden="true">
                  {method === m.key && <Check size={13} />}
                </span>
              </span>
            </label>

            {m.key === 'card' && method === 'card' && (
              <div className="card-fields">
                <div className="control">
                  <label className="control__label" htmlFor="cardno">رقم البطاقة</label>
                  <div className="input">
                    <CreditCard size={16} />
                    <input id="cardno" dir="ltr" inputMode="numeric" placeholder="1234 5678 9012 3456" />
                  </div>
                </div>

                <div className="form-row form-row--2">
                  <div className="control">
                    <label className="control__label" htmlFor="exp">تاريخ الانتهاء</label>
                    <div className="input">
                      <Calendar size={16} />
                      <input id="exp" dir="ltr" placeholder="MM / YY" />
                    </div>
                  </div>
                  <div className="control">
                    <label className="control__label" htmlFor="cvv">CVV</label>
                    <div className="input">
                      <Lock size={16} />
                      <input id="cvv" dir="ltr" inputMode="numeric" placeholder="123" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
