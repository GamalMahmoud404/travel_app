/* خريطة توضيحية لموقع الفندق (رسم متجه، بلا اعتماد على خدمة خارجية) */
export default function MiniMap({ label = '' }) {
  return (
    <svg viewBox="0 0 420 190" width="100%" height="100%" role="img" aria-label={label ? `خريطة ${label}` : 'خريطة الموقع'}>
      <defs>
        <linearGradient id="sea" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e7490" />
          <stop offset="55%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>

      <rect width="420" height="190" fill="url(#sea)" />

      {/* اليابسة */}
      <path d="M0 0h250c-14 22-46 30-58 52-12 22 6 42-6 62-14 24-64 20-92 48-14 14-58 22-94 28V0Z" fill="#e7e2d6" />
      <path d="M255 190c22-26 62-30 86-52 20-18 34-46 79-58v110H255Z" fill="#ded8c9" />

      {/* الشعاب */}
      <path d="M258 74c26-10 52-6 72 8" stroke="#a7f3d0" strokeWidth="7" fill="none" opacity=".55" strokeLinecap="round" />
      <path d="M300 116c22-8 44-4 60 8" stroke="#a7f3d0" strokeWidth="5" fill="none" opacity=".4" strokeLinecap="round" />

      {/* الطرق */}
      <g stroke="#fdfcf8" strokeWidth="3.4" fill="none" opacity=".85">
        <path d="M0 118h96l38-26h74" />
        <path d="M30 190V96l40-30" />
        <path d="M96 118l24 44" />
      </g>

      {/* مبانٍ */}
      <g fill="#cfc8b6">
        <rect x="18" y="132" width="14" height="12" rx="2" />
        <rect x="40" y="140" width="18" height="10" rx="2" />
        <rect x="66" y="128" width="12" height="14" rx="2" />
        <rect x="88" y="146" width="16" height="10" rx="2" />
        <rect x="112" y="132" width="14" height="11" rx="2" />
      </g>

      {/* دبابيس */}
      <g fill="#e11d48">
        <circle cx="150" cy="84" r="4.5" />
        <circle cx="196" cy="122" r="3.5" opacity=".7" />
        <circle cx="112" cy="152" r="3.5" opacity=".7" />
      </g>

      <g transform="translate(238 60)">
        <path d="M0 0a11 11 0 0 1 22 0c0 8-11 18-11 18S0 8 0 0Z" fill="#0d2b45" />
        <circle cx="11" cy="8" r="4" fill="#fff" />
      </g>

      <text x="352" y="96" fill="#e0f7ff" fontSize="13" fontWeight="600" textAnchor="middle" opacity=".9">
        Red Sea
      </text>
    </svg>
  );
}
