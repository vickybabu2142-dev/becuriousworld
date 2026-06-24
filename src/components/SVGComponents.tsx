// ======================================================
// SVG Battery Component
// ======================================================
interface BatterySVGProps {
  voltage: number
  isConnected?: boolean
  scale?: number
}

export function BatterySVG({ voltage, scale = 1 }: BatterySVGProps) {
  const id = `bat-${Math.round(voltage)}`
  return (
    <svg viewBox="-40 -68 80 136" width={80 * scale} height={136 * scale} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${id}-body`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1c1917" />
          <stop offset="30%" stopColor="#292524" />
          <stop offset="70%" stopColor="#3b3330" />
          <stop offset="100%" stopColor="#1c1917" />
        </linearGradient>
        <linearGradient id={`${id}-top`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id={`${id}-band`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="70%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="30%" stopColor="white" stopOpacity="0.12" />
          <stop offset="50%" stopColor="white" stopOpacity="0.22" />
          <stop offset="70%" stopColor="white" stopOpacity="0.08" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
 
      {/* Battery body */}
      <rect x="-28" y="-52" width="56" height="104" rx="9" fill={`url(#${id}-body)`} />

      {/* Top orange band */}
      <rect x="-28" y="-52" width="56" height="34" rx="9" fill={`url(#${id}-band)`} />
      <rect x="-28" y="-18" width="56" height="4" fill="#292524" opacity="0.4" />

      {/* Positive cap */}
      <rect x="-17" y="-62" width="34" height="14" rx="5" fill={`url(#${id}-top)`} />
      <rect x="-10" y="-66" width="20" height="6" rx="3" fill="#f59e0b" />

      {/* Negative base cap */}
      <rect x="-28" y="50" width="56" height="6" rx="3" fill="#44403c" />

      {/* Shine overlay */}
      <rect x="-28" y="-52" width="56" height="104" rx="9" fill={`url(#${id}-shine)`} />

      {/* Plus symbol */}
      <text x="0" y="-32" textAnchor="middle" fill="white" fontSize="20" fontWeight="900"
        fontFamily="system-ui" style={{ userSelect: 'none' }}>+</text>

      {/* Minus symbol */}
      <text x="0" y="38" textAnchor="middle" fill="#a8a29e" fontSize="22" fontWeight="900"
        fontFamily="system-ui" style={{ userSelect: 'none' }}>−</text>

      {/* Voltage label */}
      <text x="0" y="6" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="12"
        fontWeight="700" fontFamily="Inter, sans-serif" style={{ userSelect: 'none' }}>
        {voltage}V
      </text>

      {/* Terminal studs */}
      <circle cx="0" cy="-61" r="5" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1" />
      <circle cx="0" cy="59" r="5" fill="#57534e" stroke="#6b7280" strokeWidth="1" />
    </svg>
  )
}

// ======================================================
// SVG Bulb Component — Photorealistic Tungsten Filament
// ======================================================
interface BulbSVGProps {
  brightness: number  // 0–100
  scale?: number
}

export function BulbSVG({ brightness, scale = 1 }: BulbSVGProps) {
  const lit = brightness > 0
  const b = brightness / 100   // normalised 0–1

  // Dynamic color temperature simulation:
  // Hue shifts from 16 (dim reddish-orange) to 54 (bright golden-yellow)
  // Lightness shifts from 38% to 95% (nearly white hot)
  const hue = 16 + b * 38
  const filamentColor = !lit ? '#64748b'
    : `hsl(${hue.toFixed(1)}, 100%, ${(38 + b * 57).toFixed(1)}%)`

  const filamentGlowColor = !lit ? 'none' : `hsl(${hue.toFixed(1)}, 100%, 65%)`

  // Outer glow size - wider, more prominent bloom
  const glowR1 = 30 + b * 45
  const glowR2 = 30 + b * 45
  const glowOpacity1 = b * 0.55
  const glowOpacity2 = b * 0.85

  // Glass fill — clear when off, rich color temperature tint when lit
  const glassFillOpacity = lit ? 0.12 + b * 0.38 : 0.04
  const glassFillColor = lit ? `hsl(${hue.toFixed(1)}, 100%, 50%)` : '#cbd5e1'

  // Inner glow blob
  const innerGlowOpacity = b * 0.95
  const innerGlowColor = `hsl(${hue.toFixed(1)}, 100%, 60%)`

  const uid = `bulb-${brightness}`

  return (
    <svg
      viewBox="-44 -62 88 118"
      width={88 * scale}
      height={118 * scale}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Soft outer bloom */}
        <radialGradient id={`${uid}-bloom`} cx="50%" cy="42%" r="50%">
          <stop offset="0%" stopColor={glassFillColor} stopOpacity={glowOpacity2} />
          <stop offset="60%" stopColor={filamentGlowColor} stopOpacity={glowOpacity1 * 0.5} />
          <stop offset="100%" stopColor={filamentGlowColor} stopOpacity="0" />
        </radialGradient>

        {/* Glass body fill */}
        <radialGradient id={`${uid}-glass`} cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="white" stopOpacity={lit ? 0.6 : 0.3} />
          <stop offset="45%" stopColor={glassFillColor} stopOpacity={glassFillOpacity} />
          <stop offset="100%" stopColor={glassFillColor} stopOpacity={glassFillOpacity * 0.4} />
        </radialGradient>

        {/* Inner hot-spot glow */}
        <radialGradient id={`${uid}-hotspot`} cx="50%" cy="55%" r="45%">
          <stop offset="0%" stopColor="white" stopOpacity={innerGlowOpacity} />
          <stop offset="60%" stopColor={innerGlowColor} stopOpacity={innerGlowOpacity * 0.3} />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>

        {/* Filament glow filter */}
        <filter id={`${uid}-fglow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={lit ? 1.0 + b * 2.8 : 0} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Outer bloom blur */}
        <filter id={`${uid}-bloom-blur`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation={lit ? 8 + b * 15 : 0} />
        </filter>

        {/* Glass reflection */}
        <linearGradient id={`${uid}-refl`} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="40%" stopColor="white" stopOpacity="0.08" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        {/* Base gradient */}
        <linearGradient id={`${uid}-base`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="40%" stopColor="#6b7280" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>

        {/* Clip for glass */}
        <clipPath id={`${uid}-clip`}>
          <path d="M -25 10 A 32 32 0 1 1 25 10 C 23 20, 12 26, 12 32 L -12 32 C -12 26, -23 20, -25 10 Z" />
        </clipPath>
      </defs>

      {/* ── Outer bloom glow (blurred ellipse behind everything) ── */}
      {lit && (
        <ellipse
          cx="0" cy="-10"
          rx={glowR1} ry={glowR2 * 1.5}
          fill={`url(#${uid}-bloom)`}
          filter={`url(#${uid}-bloom-blur)`}
        />
      )}

      {/* ── Glass envelope ── */}
      {/* Dark rim/shadow */}
      <path
        d="M -25 10 A 32 32 0 1 1 25 10 C 23 20, 12 26, 12 32 L -12 32 C -12 26, -23 20, -25 10 Z"
        fill={lit ? 'none' : '#e2e8f0'}
        stroke={lit ? '#f59e0b' : '#cbd5e1'}
        strokeWidth="1.5"
      />

      {/* Glass fill (warm tint) */}
      <path
        d="M -25 10 A 32 32 0 1 1 25 10 C 23 20, 12 26, 12 32 L -12 32 C -12 26, -23 20, -25 10 Z"
        fill={`url(#${uid}-glass)`}
      />

      {/* Inner hot-spot glow blob (clipped to glass shape) */}
      {lit && (
        <ellipse
          cx="0" cy="-10"
          rx="22" ry="22"
          fill={`url(#${uid}-hotspot)`}
          clipPath={`url(#${uid}-clip)`}
        />
      )}

      {/* ── Realistic Tungsten Filament ── */}
      {/* The filament is a coiled W-shape / inverted V-shape with a center support hook,
          simulating a real tungsten incandescent bulb. */}
      <g
        filter={lit ? `url(#${uid}-fglow)` : undefined}
        style={{
          transition: 'opacity 0.4s ease',
          opacity: lit ? 1 : 0.35,
        }}
      >
        {/* Support leads (diverging outward, then straight up) */}
        <path d="M -4 26 L -4 14 C -4 10, -12 8, -12 2 L -12 -4" stroke={lit ? '#94a3b8' : '#cbd5e1'} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M 4 26 L 4 14 C 4 10, 12 8, 12 2 L 12 -4" stroke={lit ? '#94a3b8' : '#cbd5e1'} strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Center Molybdenum Support Wire */}
        <path d="M 0 14 L 0 -13 A 1.5 1.5 0 1 1 2 -14.5" stroke={lit ? '#64748b' : '#94a3b8'} strokeWidth="0.8" fill="none" strokeLinecap="round" />

        {/* Glass stem mount */}
        <rect x="-4" y="12" width="8" height="15" rx="2" fill={lit ? 'rgba(148,163,184,0.5)' : 'rgba(148,163,184,0.3)'} />

        {/* High-frequency Coiled Tungsten Filament path */}
        <path
          d="M -12 -4 
             L -11.2 -6.5 L -10.8 -4.5 L -10 -7.5 L -9.6 -5 L -8.8 -8 L -8.4 -5.5 L -7.6 -9 L -7.2 -6 L -6.4 -9.5 L -6 -6.5 L -5.2 -10.5 L -4.8 -7 L -4 -11.5 L -3.6 -8 L -2.8 -12.5 L -2.4 -9 L -1.6 -13.5 L -1.2 -10 L -0.4 -14.5 L 0 -11 
             L 0.4 -14.5 L 1.2 -10 L 1.6 -13.5 L 2.4 -9 L 2.8 -12.5 L 3.6 -8 L 4 -11.5 L 4.8 -7 L 5.2 -10.5 L 6 -6.5 L 6.4 -9.5 L 7.2 -6 L 7.6 -9 L 8.4 -5.5 L 8.8 -8 L 9.6 -5 L 10 -7.5 L 10.8 -4.5 L 11.2 -6.5 L 12 -4"
          stroke={filamentColor}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bright core highlight when lit */}
        {lit && b > 0.4 && (
          <path
            d="M -12 -4 
               L -11.2 -6.5 L -10.8 -4.5 L -10 -7.5 L -9.6 -5 L -8.8 -8 L -8.4 -5.5 L -7.6 -9 L -7.2 -6 L -6.4 -9.5 L -6 -6.5 L -5.2 -10.5 L -4.8 -7 L -4 -11.5 L -3.6 -8 L -2.8 -12.5 L -2.4 -9 L -1.6 -13.5 L -1.2 -10 L -0.4 -14.5 L 0 -11 
               L 0.4 -14.5 L 1.2 -10 L 1.6 -13.5 L 2.4 -9 L 2.8 -12.5 L 3.6 -8 L 4 -11.5 L 4.8 -7 L 5.2 -10.5 L 6 -6.5 L 6.4 -9.5 L 7.2 -6 L 7.6 -9 L 8.4 -5.5 L 8.8 -8 L 9.6 -5 L 10 -7.5 L 10.8 -4.5 L 11.2 -6.5 L 12 -4"
            stroke="white"
            strokeWidth="0.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={b * 0.7}
          />
        )}
      </g>

      {/* ── Glass reflection highlight (always visible) ── */}
      <path
        d="M -24 -20 A 28 28 0 0 1 -10 -34"
        stroke="white"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.22"
      />
      <path
        d="M -20 -10 A 24 24 0 0 1 -14 -22"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.15"
      />

      {/* Glass envelope outline (top layer, thin crisp stroke) */}
      <path
        d="M -25 10 A 32 32 0 1 1 25 10 C 23 20, 12 26, 12 32 L -12 32 C -12 26, -23 20, -25 10 Z"
        fill="none"
        stroke={lit ? `rgba(251,191,36,${0.3 + b * 0.4})` : '#cbd5e1'}
        strokeWidth="1"
      />

      {/* ── Neck transition ── */}
      <path
        d="M -12 32 C -12 35 -11 38 -10 40 L 10 40 C 11 38 12 35 12 32 Z"
        fill="#4b5563"
      />

      {/* ── Screw base (Edison E27 style) ── */}
      {/* Base body */}
      <rect x="-12" y="40" width="24" height="6" fill="#6b7280" />
      {/* Thread ridges */}
      {[0, 2, 4].map(i => (
        <rect key={i} x="-12" y={40 + i * 2} width="24" height="1.2" rx="0.5"
          fill="#374151" opacity="0.7" />
      ))}
      <rect x="-11" y="46" width="22" height="5" rx="1" fill="#4b5563" />
      <rect x="-9" y="51" width="18" height="4" rx="1" fill="#374151" />

      {/* Solder/contact point at very bottom */}
      <ellipse cx="0" cy="56" rx="7" ry="3" fill="#6b7280" />
      <ellipse cx="0" cy="55.5" rx="5" ry="2" fill="#9ca3af" />

      {/* ── Terminal leads ── */}
      <line x1="-10" y1="26" x2="-22" y2="54" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="26" x2="22" y2="54" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="-22" cy="54" r="4" fill="#6b7280" stroke="#9ca3af" strokeWidth="1.2" />
      <circle cx="22" cy="54" r="4" fill="#6b7280" stroke="#9ca3af" strokeWidth="1.2" />
    </svg>
  )
}

// ======================================================
// SVG Resistor Component
// ======================================================
interface ResistorSVGProps {
  resistance: number
  scale?: number
}

export function ResistorSVG({ resistance: _resistance, scale = 1 }: ResistorSVGProps) {
  return (
    <svg viewBox="-68 -22 136 44" width={136 * scale} height={44 * scale} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="res-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="50%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="res-shine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="50%" stopColor="white" stopOpacity="0.1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Lead wires */}
      <line x1="-68" y1="0" x2="-33" y2="0" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="33" y1="0" x2="68" y2="0" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />

      {/* Body shadow */}
      <rect x="-31" y="-11" width="62" height="24" rx="6" fill="#92400e" opacity="0.15" transform="translate(1,2)" />

      {/* Body */}
      <rect x="-31" y="-12" width="62" height="24" rx="6" fill="url(#res-body-grad)" />

      {/* Color bands — 100Ω: Brown(1) Red(0) Brown(×10) Gold(±5%) */}
      <rect x="-22" y="-12" width="7" height="24" fill="#7c2d12" rx="1" />
      <rect x="-11" y="-12" width="7" height="24" fill="#dc2626" rx="1" />
      <rect x="0"   y="-12" width="7" height="24" fill="#7c2d12" rx="1" />
      <rect x="17"  y="-12" width="6" height="24" fill="#ca8a04" rx="1" />

      {/* Shine overlay */}
      <rect x="-31" y="-12" width="62" height="24" rx="6" fill="url(#res-shine)" />

      {/* Terminal dots */}
      <circle cx="-63" cy="0" r="4.5" fill="#6b7280" stroke="#94a3b8" strokeWidth="1" />
      <circle cx="63"  cy="0" r="4.5" fill="#6b7280" stroke="#94a3b8" strokeWidth="1" />
    </svg>
  )
}

// ======================================================
// Sidebar preview versions (smaller scale)
// ======================================================
export function BatteryPreview() {
  return <BatterySVG voltage={9} scale={0.52} />
}

export function BulbPreview() {
  return <BulbSVG brightness={0} scale={0.58} />
}

export function ResistorPreview() {
  return <ResistorSVG resistance={100} scale={0.62} />
}
