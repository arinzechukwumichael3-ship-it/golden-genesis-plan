/** Unique id prop prevents SVG gradient conflicts when rendered multiple times. */
export function LogoMark({ size = 36, uid = "a" }: { size?: number; uid?: string }) {
  const bg   = `lm-bg-${uid}`;
  const gold = `lm-gold-${uid}`;
  const grn  = `lm-grn-${uid}`;

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E3A8A"/>
          <stop offset="1" stopColor="#0D1B3E"/>
        </linearGradient>
        <linearGradient id={gold} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FCD34D"/>
          <stop offset="1" stopColor="#F59E0B"/>
        </linearGradient>
        <linearGradient id={grn} x1="0" y1="1" x2="0" y2="0">
          <stop stopColor="#16DB93"/>
          <stop offset="1" stopColor="#34EEA9"/>
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="40" height="40" rx="10" fill={`url(#${bg})`}/>

      {/* Bar chart — 5 bars, bottom-aligned, growing left→right */}
      <rect x="4"  y="27" width="4.5" height="9"  rx="1.5" fill={`url(#${grn})`} opacity="0.28"/>
      <rect x="9.5"  y="23" width="4.5" height="13" rx="1.5" fill={`url(#${grn})`} opacity="0.44"/>
      <rect x="15" y="19" width="4.5" height="17" rx="1.5" fill={`url(#${grn})`} opacity="0.62"/>
      <rect x="20.5" y="15" width="4.5" height="21" rx="1.5" fill={`url(#${grn})`} opacity="0.80"/>
      <rect x="26" y="11" width="4.5" height="25" rx="1.5" fill={`url(#${grn})`}/>

      {/* Upward-right arrow */}
      <path d="M22 11L30 4" stroke={`url(#${grn})`} strokeWidth="2" strokeLinecap="round"/>
      <path d="M26 3.5L30.5 3.5L30.5 8" stroke={`url(#${grn})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Y — gold, top-left */}
      <path
        d="M3.5 5L9 14.5M14.5 5L9 14.5L9 22"
        stroke={`url(#${gold})`}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* E — green, right side */}
      <path
        d="M18.5 18L18.5 30M18.5 18L25.5 18M18.5 24L24.5 24M18.5 30L25.5 30"
        stroke={`url(#${grn})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
