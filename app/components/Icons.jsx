/* Line-icon set for رحلتي — 24px grid, currentColor stroke */

function Svg({ size = 18, children, fill = 'none', ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const MapPin = (p) => (
  <Svg {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
);

export const Calendar = (p) => (
  <Svg {...p}>
    <rect x="3" y="4.5" width="18" height="16" rx="3" />
    <path d="M8 2.5v4M16 2.5v4M3 9.5h18" />
  </Svg>
);

export const Clock = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const Users = (p) => (
  <Svg {...p}>
    <path d="M16 19v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V19" />
    <circle cx="9" cy="7" r="3.2" />
    <path d="M22 19v-1.5a4 4 0 0 0-3-3.87M16.5 4.2a3.2 3.2 0 0 1 0 6" />
  </Svg>
);

export const User = (p) => (
  <Svg {...p}>
    <path d="M19 20v-1.5a5 5 0 0 0-5-5h-4a5 5 0 0 0-5 5V20" />
    <circle cx="12" cy="7" r="3.6" />
  </Svg>
);

export const Search = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.6-3.6" />
  </Svg>
);

export const Bell = (p) => (
  <Svg {...p}>
    <path d="M18 8.5a6 6 0 1 0-12 0c0 6-2 7.5-2 7.5h16s-2-1.5-2-7.5Z" />
    <path d="M13.7 20a2 2 0 0 1-3.4 0" />
  </Svg>
);

export const Globe = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18-2.5-2.6-2.5-15.4 0-18Z" />
  </Svg>
);

export const ChevronDown = (p) => (
  <Svg {...p}>
    <path d="m6 9.5 6 6 6-6" />
  </Svg>
);

export const ChevronLeft = (p) => (
  <Svg {...p}>
    <path d="m14 6-6 6 6 6" />
  </Svg>
);

export const Menu = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const Heart = (p) => (
  <Svg {...p}>
    <path d="M12 20s-7.5-4.6-7.5-9.8A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 3c0 5.2-7.5 9.8-7.5 9.8Z" />
  </Svg>
);

export const HeartFilled = ({ size = 18, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
    <path d="M12 20.4s-8-5-8-10.4A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8 3.4c0 5.4-8 10.4-8 10.4Z" />
  </svg>
);

export const Star = ({ size = 14, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
    <path d="m12 2.6 2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45L2.6 9.45l6.5-.95L12 2.6Z" />
  </svg>
);

export const Building = (p) => (
  <Svg {...p}>
    <path d="M4 20.5V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14.5M14 10h4a2 2 0 0 1 2 2v8.5M3 20.5h18" />
    <path d="M7.5 8h3M7.5 12h3M7.5 16h3M17 14h.01M17 17.5h.01" />
  </Svg>
);

export const Camera = (p) => (
  <Svg {...p}>
    <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.2a2 2 0 0 0 1.7-.95l.5-.8A2 2 0 0 1 10.6 3.3h2.8a2 2 0 0 1 1.7.95l.5.8A2 2 0 0 0 17.3 6h1.2A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5Z" />
    <circle cx="12" cy="13" r="3.4" />
  </Svg>
);

export const Car = (p) => (
  <Svg {...p}>
    <path d="M5 16.5h14M3.5 16.5v-3.2l1.9-4.6A2 2 0 0 1 7.25 7.5h9.5a2 2 0 0 1 1.85 1.2l1.9 4.6v3.2" />
    <path d="M3.5 13.3h17" />
    <circle cx="7.5" cy="18" r="1.6" />
    <circle cx="16.5" cy="18" r="1.6" />
  </Svg>
);

export const Bus = (p) => (
  <Svg {...p}>
    <rect x="4" y="4" width="16" height="12.5" rx="2.5" />
    <path d="M4 11h16M9 4v7M15 4v7M6.5 20v-3.5M17.5 20v-3.5" />
  </Svg>
);

export const Plane = (p) => (
  <Svg {...p}>
    <path d="M10.2 13.8 3 12l18-7.5-4.2 15.5-3.5-5.2-2.2 3.3v-4.3Z" />
  </Svg>
);

export const Ship = (p) => (
  <Svg {...p}>
    <path d="M3 15.5 4.5 10h15L21 15.5a5 5 0 0 1-4.5 3.5h-9A5 5 0 0 1 3 15.5Z" />
    <path d="M7.5 10V6.5h9V10M12 3.5V6.5" />
  </Svg>
);

export const Wifi = (p) => (
  <Svg {...p}>
    <path d="M2.5 9.5a14 14 0 0 1 19 0M6 13a9 9 0 0 1 12 0" />
    <circle cx="12" cy="17.5" r="1.2" fill="currentColor" stroke="none" />
  </Svg>
);

export const Parking = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    <path d="M10 17V7.5h2.7a2.9 2.9 0 0 1 0 5.8H10" />
  </Svg>
);

export const Utensils = (p) => (
  <Svg {...p}>
    <path d="M6 3v7a2.5 2.5 0 0 0 5 0V3M8.5 12.5V21M17 3c-1.6 1.2-2.4 3-2.4 5.2 0 1.6.7 2.6 2.4 3V21" />
  </Svg>
);

export const Waves = (p) => (
  <Svg {...p}>
    <path d="M2.5 8.5c1.6 0 2.4-1.2 4-1.2s2.4 1.2 4 1.2 2.4-1.2 4-1.2 2.4 1.2 4 1.2M2.5 13c1.6 0 2.4-1.2 4-1.2s2.4 1.2 4 1.2 2.4-1.2 4-1.2 2.4 1.2 4 1.2M2.5 17.5c1.6 0 2.4-1.2 4-1.2s2.4 1.2 4 1.2 2.4-1.2 4-1.2 2.4 1.2 4 1.2" />
  </Svg>
);

export const Baby = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 10h.01M15 10h.01M9.5 14.5a3.5 3.5 0 0 0 5 0" />
  </Svg>
);

export const Dumbbell = (p) => (
  <Svg {...p}>
    <path d="M6.5 8.5v7M3.5 10v4M17.5 8.5v7M20.5 10v4M6.5 12h11" />
  </Svg>
);

export const Bed = (p) => (
  <Svg {...p}>
    <path d="M3 18.5v-11M3 12.5h18v6M21 18.5v-4" />
    <path d="M7.5 9.5h3.5v3H7.5z" />
    <path d="M13.5 12.5V10a1.5 1.5 0 0 1 1.5-1.5h3A2.5 2.5 0 0 1 20.5 11v1.5" />
  </Svg>
);

export const Balcony = (p) => (
  <Svg {...p}>
    <path d="M4 13.5h16M6 13.5V21M18 13.5V21M10 13.5V21M14 13.5V21M4 17h16" />
    <path d="M8 10a4 4 0 0 1 8 0" />
  </Svg>
);

export const ShieldCheck = (p) => (
  <Svg {...p}>
    <path d="M12 21s7-3 7-9V5.8l-7-2.3-7 2.3V12c0 6 7 9 7 9Z" />
    <path d="m9.2 11.8 2 2 3.6-3.7" />
  </Svg>
);

export const Lock = (p) => (
  <Svg {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </Svg>
);

export const CreditCard = (p) => (
  <Svg {...p}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
    <path d="M2.5 10h19" />
  </Svg>
);

export const Wallet = (p) => (
  <Svg {...p}>
    <path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h11a2 2 0 0 1 2 2v1" />
    <rect x="3.5" y="7.5" width="17" height="11" rx="2.5" />
    <path d="M16.5 13h2" />
  </Svg>
);

export const Cash = (p) => (
  <Svg {...p}>
    <rect x="2.5" y="6.5" width="19" height="11" rx="2" />
    <circle cx="12" cy="12" r="2.4" />
    <path d="M6 10v4M18 10v4" />
  </Svg>
);

export const Phone = (p) => (
  <Svg {...p}>
    <path d="M6.2 3.5h2.4l1.6 4-2 1.3a10.5 10.5 0 0 0 5 5l1.3-2 4 1.6v2.4a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2Z" />
  </Svg>
);

export const Mail = (p) => (
  <Svg {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </Svg>
);

export const Download = (p) => (
  <Svg {...p}>
    <path d="M12 3.5v11M7.5 10.5 12 15l4.5-4.5M4 19.5h16" />
  </Svg>
);

export const Trash = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M9.5 7V4.5h5V7M6 7l.9 12.2a2 2 0 0 0 2 1.8h6.2a2 2 0 0 0 2-1.8L18 7" />
  </Svg>
);

export const CheckCircle = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.4 12.2 2.4 2.4 4.8-5" />
  </Svg>
);

export const Check = (p) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Svg>
);

export const XCircle = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 9 6 6M15 9l-6 6" />
  </Svg>
);

export const Info = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Svg>
);

export const ExternalLink = (p) => (
  <Svg {...p}>
    <path d="M14 4.5h5.5V10M19 5l-7.5 7.5" />
    <path d="M18 14v4.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4.5" />
  </Svg>
);

export const Edit = (p) => (
  <Svg {...p}>
    <path d="M15.5 4.8 19.2 8.5 9 18.7l-4.4.9.9-4.4 10-10.4Z" />
  </Svg>
);

export const LogOut = (p) => (
  <Svg {...p}>
    <path d="M14.5 20H6.5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8M16 8.5 19.5 12 16 15.5M9.5 12h10" />
  </Svg>
);

export const Ticket = (p) => (
  <Svg {...p}>
    <path d="M3.5 9V7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6Z" />
    <path d="M12 8v8" strokeDasharray="2 2.5" />
  </Svg>
);

export const Tag = (p) => (
  <Svg {...p}>
    <path d="M20 12.6 12.6 20a2 2 0 0 1-2.8 0L4 14.2V4h10.2l5.8 5.8a2 2 0 0 1 0 2.8Z" />
    <circle cx="8.5" cy="8.5" r="1.3" />
  </Svg>
);

export const FileText = (p) => (
  <Svg {...p}>
    <path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L14 3.5Z" />
    <path d="M13.5 3.5v5h5M8.5 13h7M8.5 16.5h5" />
  </Svg>
);

export const Compass = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5.2-5.2 2 2-5.2 5.2-2Z" />
  </Svg>
);

export const Sparkle = (p) => (
  <Svg {...p}>
    <path d="M12 3.5 13.6 9l5.4 1.6-5.4 1.6L12 17.5l-1.6-5.3L5 10.6 10.4 9 12 3.5Z" />
  </Svg>
);

export const Instagram = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="3.8" />
    <path d="M16.8 7.2h.01" />
  </Svg>
);

export const Facebook = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
    <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.8-.1-1.7-.15-2.5-.15-2.5 0-4.2 1.5-4.2 4.3v2.15H7.3V13h2.3v8h3.9Z" />
  </svg>
);

export const Twitter = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
    <path d="M21 5.9c-.7.3-1.4.5-2.2.6.8-.5 1.4-1.3 1.7-2.2-.8.5-1.6.8-2.5 1a3.6 3.6 0 0 0-6.2 3.3A10.2 10.2 0 0 1 4.3 4.8a3.6 3.6 0 0 0 1.1 4.8c-.6 0-1.2-.2-1.7-.5a3.6 3.6 0 0 0 2.9 3.6c-.6.2-1.2.2-1.8.1a3.6 3.6 0 0 0 3.4 2.5A10.2 10.2 0 0 1 3 17.5a14.4 14.4 0 0 0 7.8 2.3c5.4 0 8.5-4.5 8.3-9 .8-.6 1.4-1.3 1.9-2.1Z" />
  </svg>
);

export const TikTok = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
    <path d="M16.4 3h-2.9v11.4a2.4 2.4 0 1 1-2.4-2.4c.25 0 .5.05.7.1V9.1a5.3 5.3 0 1 0 4.6 5.3V8.5a5.5 5.5 0 0 0 3.6 1.3V6.9a3.6 3.6 0 0 1-3.6-3.6Z" />
  </svg>
);

export const Hash = (p) => (
  <Svg {...p}>
    <path d="M9 3.5 7.5 20.5M16.5 3.5 15 20.5M3.5 8.5h17M2.5 15.5h17" />
  </Svg>
);

export const Sun = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
  </Svg>
);

export const Moon = (p) => (
  <Svg {...p}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
  </Svg>
);
