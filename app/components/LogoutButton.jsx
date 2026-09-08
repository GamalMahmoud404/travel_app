'use client';

import { useFormStatus } from 'react-dom';
import { logoutAction } from '../lib/actions';
import { LogOut } from './Icons';

function Submit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="acct-side__link acct-side__link--danger"
      disabled={pending}
      style={{ background: 'none', border: 0, textAlign: 'start', width: '100%' }}
    >
      <LogOut size={16} />
      {pending ? 'جارٍ الخروج…' : 'تسجيل الخروج'}
    </button>
  );
}

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Submit />
    </form>
  );
}
