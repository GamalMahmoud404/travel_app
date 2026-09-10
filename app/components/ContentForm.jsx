'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { saveContentAction } from '../lib/content-actions';
import { Icon } from './iconMap';
import { CheckCircle, Edit, Sparkle, X, XCircle } from './Icons';

/* ==========================================================================
   نموذج المحتوى — يُرسم من وصف المجموعة في content-schema.js.

   الحقول غير المضبوطة (uncontrolled) بقيم افتراضية: عند الخطأ يعيد الإجراء ما
   كتبه الأدمن في state.values فلا يفقد المدخلات، وبعد النجاح يعيد React ضبط
   النموذج على القيم الافتراضية الجديدة القادمة من الخادم.
   ========================================================================== */

const AREA_TYPES = ['area', 'list', 'urls', 'pairs', 'langs'];
const NUMBER_TYPES = ['int', 'float'];

const rows = (type) => (type === 'area' ? 4 : 5);

export default function ContentForm({ collection, editing, initial, refOptions = [] }) {
  const [state, action, pending] = useActionState(saveContentAction, {});

  // بعد خطأ: ما كتبه الأدمن. غير ذلك: قيم الصف من القاعدة (أو الفراغ للإضافة).
  const values = state?.values ?? initial ?? {};
  const valueOf = (name) => values[name] ?? '';

  return (
    <form action={action} className="panel" style={{ marginTop: 20 }}>
      <input type="hidden" name="__type" value={collection.key} />
      <input type="hidden" name="__id" value={editing?.id ?? ''} />

      <div className="info-card__head">
        <h2>
          {editing ? <Edit size={18} /> : <Sparkle size={18} />}
          {editing ? `تعديل: ${editing.title}` : `إضافة ${collection.single}`}
        </h2>

        <div className="content-form__head-actions">
          {editing && (
            <Link href={`/admin/content/${collection.key}`} className="btn btn--ghost">
              <X size={15} />
              إلغاء التعديل
            </Link>
          )}
          <button type="submit" className="btn btn--primary" disabled={pending}>
            {pending ? 'جارٍ الحفظ…' : editing ? 'حفظ التعديلات' : `إضافة ${collection.single}`}
          </button>
        </div>
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

        <div className="content-grid">
          {collection.fields.map((field) => {
            const id = `cf-${collection.key}-${field.name}`;
            const isArea = AREA_TYPES.includes(field.type);
            const isNumber = NUMBER_TYPES.includes(field.type);

            return (
              <div
                className={`control${field.wide || isArea ? ' content-grid__wide' : ''}`}
                key={field.name}
              >
                <label className="control__label" htmlFor={id}>
                  {field.label}
                  {!field.required && <span className="content-opt">اختياري</span>}
                </label>

                {field.type === 'ref' ? (
                  <div className="input input--select">
                    {field.icon && <Icon name={field.icon} size={16} />}
                    <select id={id} name={field.name} required defaultValue={valueOf(field.name)}>
                      <option value="">— اختر —</option>
                      {refOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : isArea ? (
                  <div className="input input--area">
                    <textarea
                      id={id}
                      name={field.name}
                      rows={rows(field.type)}
                      required={field.required}
                      defaultValue={valueOf(field.name)}
                      placeholder={field.placeholder ?? ''}
                    />
                  </div>
                ) : (
                  <div className="input">
                    {field.icon && <Icon name={field.icon} size={16} />}
                    <input
                      id={id}
                      name={field.name}
                      required={field.required}
                      defaultValue={valueOf(field.name)}
                      placeholder={field.placeholder ?? ''}
                      dir={isNumber || field.type === 'slug' || field.type === 'url' ? 'ltr' : undefined}
                      inputMode={isNumber ? 'decimal' : undefined}
                      autoComplete="off"
                    />
                  </div>
                )}

                {field.hint && <span className="content-hint">{field.hint}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </form>
  );
}
