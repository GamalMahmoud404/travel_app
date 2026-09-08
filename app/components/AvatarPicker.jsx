'use client';

import { useRef, useState } from 'react';
import { Camera, Trash, User } from './Icons';

const SIZE = 256;
const QUALITIES = [0.82, 0.7, 0.6];
const MAX_BYTES = 400 * 1024;

const bytesOf = (dataUrl) => Math.floor((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75);

/** يقصّ الصورة مربعًا من المنتصف ويصغّرها إلى 256px ثم يعيدها data URL */
async function shrink(file) {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, SIZE, SIZE);
  bitmap.close?.();

  for (const q of QUALITIES) {
    const url = canvas.toDataURL('image/jpeg', q);
    if (bytesOf(url) <= MAX_BYTES) return url;
  }
  return canvas.toDataURL('image/jpeg', 0.5);
}

export default function AvatarPicker({ name = 'avatar', initial = '', label = 'الصورة الشخصية' }) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  async function onPick(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!/^image\/(jpeg|png|webp|gif|avif)$/.test(file.type)) {
      setError('اختر صورة بصيغة JPEG أو PNG أو WebP.');
      return;
    }

    setError('');
    setBusy(true);
    try {
      setValue(await shrink(file));
    } catch {
      setError('تعذّر قراءة الصورة — جرّب صورة أخرى.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="control">
      <span className="control__label">{label}</span>

      <div className="avatar-pick">
        <span className="avatar-pick__preview">
          {value ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={value} alt="" />
          ) : (
            <User size={26} />
          )}
        </span>

        <div className="avatar-pick__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            <Camera size={15} />
            {busy ? 'جارٍ المعالجة…' : value ? 'تغيير الصورة' : 'اختر صورة'}
          </button>

          {value && (
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => { setValue(''); setError(''); }}
            >
              <Trash size={15} />
              إزالة
            </button>
          )}

          <p className="avatar-pick__hint">JPEG أو PNG أو WebP — تُصغَّر تلقائيًا إلى 256×256.</p>
        </div>
      </div>

      {error && <p className="avatar-pick__error">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={onPick}
        hidden
      />
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
