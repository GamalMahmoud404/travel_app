import Link from 'next/link';

/* رحلتي wordmark — navy location pin + teal swoosh + gold star */
export default function Logo({ size = 38, href = '/', name }) {
  const Mark = (
    <svg
      className="logo__mark"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M24 4c-8.4 0-15.2 6.6-15.2 14.8 0 9.9 11.9 21.4 14.3 23.6a1.3 1.3 0 0 0 1.8 0c2.4-2.2 14.3-13.7 14.3-23.6C39.2 10.6 32.4 4 24 4Z"
        fill="#0d2b45"
      />
      <path
        d="M10.5 20.5c4.6 4.9 12.6 7.4 21.9 5.6 3.6-.7 6.4-2 8.4-3.3-2.6 3-6.6 5.5-11.6 6.5-8.9 1.7-16.6-1.5-18.7-8.8Z"
        fill="#1ca6a6"
      />
      <circle cx="24" cy="18.4" r="5.1" fill="#ffffff" />
      <path
        d="M35.6 6.6l1.5 3.4 3.4 1.5-3.4 1.5-1.5 3.4-1.5-3.4-3.4-1.5 3.4-1.5 1.5-3.4Z"
        fill="#f5a524"
      />
    </svg>
  );

  const content = (
    <>
      {Mark}
      <span className="logo__word">{name}</span>
    </>
  );

  if (!href) return <span className="logo">{content}</span>;

  return (
    <Link href={href} className="logo" aria-label={`${name} — الصفحة الرئيسية`}>
      {content}
    </Link>
  );
}
