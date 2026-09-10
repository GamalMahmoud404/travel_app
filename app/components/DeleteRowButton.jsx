'use client';

import { Trash } from './Icons';

/**
 * زر حذف صف محتوى — بتأكيد قبل الإرسال.
 * الحذف يزيل العنصر من كل الواجهة، فالسؤال قبله يمنع نقرة عابرة. بلا جافاسكربت
 * يبقى النموذج عاملًا (يُرسَل مباشرة) — التأكيد تحسين لا شرط.
 */
export default function DeleteRowButton({ action, type, id, label }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`حذف «${label}»؟ لا يمكن التراجع.`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="__type" value={type} />
      <input type="hidden" name="__id" value={id} />
      <button type="submit" className="btn btn--danger btn--sm" aria-label={`حذف ${label}`}>
        <Trash size={14} />
        حذف
      </button>
    </form>
  );
}
