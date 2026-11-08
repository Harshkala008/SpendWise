export default function SpendWiseMark({ size = 32, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="SpendWise logo">
      <defs>
        <linearGradient id="spendwise-blue" x1="9" y1="48" x2="31" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#18B8D1" />
          <stop offset="1" stopColor="#55E5F4" />
        </linearGradient>
        <linearGradient id="spendwise-violet" x1="32" y1="7" x2="34" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD45A" />
          <stop offset="1" stopColor="#FF9D36" />
        </linearGradient>
        <linearGradient id="spendwise-coral" x1="38" y1="48" x2="58" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF6B62" />
          <stop offset="1" stopColor="#FFB052" />
        </linearGradient>
        <filter id="spendwise-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d="M31.8 7.5c-7.4 1.1-13.2 8.6-14.4 18.1-.3 2.4.9 4.7 3 6l11.5 7.1 11.5-7.1c2.1-1.3 3.3-3.6 3-6C45.2 16.1 39.2 8.6 31.8 7.5Z" fill="url(#spendwise-violet)" filter="url(#spendwise-glow)" />
      <path d="M17.5 22.4C10.8 21.3 4.8 26.4 4.1 34.1c-.8 8.9 5.2 17.4 14.2 19.8 2.5.7 5.2-.3 6.7-2.4l7.2-10.2-1.5-13.4c-.3-2.7-2.1-4.9-4.7-5.3l-8.5-.2Z" fill="url(#spendwise-blue)" filter="url(#spendwise-glow)" />
      <path d="M46.5 22.4c6.7-1.1 12.7 4 13.4 11.7.8 8.9-5.2 17.4-14.2 19.8-2.5.7-5.2-.3-6.7-2.4l-7.2-10.2 1.5-13.4c.3-2.7 2.1-4.9 4.7-5.3l8.5-.2Z" fill="url(#spendwise-coral)" filter="url(#spendwise-glow)" />
      <path d="M32 13v25M14 30l17 11M50 30 33 41" stroke="rgba(13,20,45,.28)" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="32" cy="41" r="3" fill="#F8FAFF" />
    </svg>
  )
}
