interface ControlsPanelProps {
  voltage: number
  resistance: number
  brightness: number
  current: number
  voltageDrop: number
  power: number
  isComplete: boolean
  hasResistorInLoop?: boolean
  hasResistorOnCanvas?: boolean
  onVoltageChange: (v: number) => void
  onResistanceChange: (r: number) => void
  className?: string
}

export function ControlsPanel({
  voltage,
  resistance,
  brightness,
  current,
  voltageDrop,
  power,
  isComplete,
  hasResistorInLoop = true,
  hasResistorOnCanvas = false,
  onVoltageChange,
  onResistanceChange,
  className = '',
}: ControlsPanelProps) {
  // Compute slider fill percentages
  const voltagePct = ((voltage - 1) / (24 - 1)) * 100
  const resistancePct = ((Math.log(resistance) - Math.log(1)) / (Math.log(1000) - Math.log(1))) * 100
  const brightnessPct = brightness

  return (
    <aside className={`controls-panel ${className}`} aria-label="Circuit controls and readings">
      <p className="controls-title">Controls</p>

      {/* Voltage Slider */}
      <div className="slider-control" id="voltage-control">
        <div className="slider-header">
          <label className="slider-label" htmlFor="voltage-slider">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="7" width="16" height="10" rx="2" />
              <line x1="22" y1="11" x2="22" y2="13" />
            </svg>
            Voltage
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>(Battery)</span>
          </label>
          <span className="slider-value" aria-live="polite">{voltage} V</span>
        </div>
        <input
          id="voltage-slider"
          type="range"
          className="voltage-slider"
          min={1}
          max={24}
          step={1}
          value={voltage}
          onChange={e => onVoltageChange(Number(e.target.value))}
          style={{ '--pct': `${voltagePct}%` } as React.CSSProperties}
          aria-label={`Voltage: ${voltage} volts`}
          aria-valuemin={1}
          aria-valuemax={24}
          aria-valuenow={voltage}
        />
        <div className="slider-limits">
          <span>1 V</span>
          <span>24 V</span>
        </div>
      </div>

      {/* Resistance Slider */}
      <div className={`slider-control ${isComplete && !hasResistorInLoop ? 'bypassed' : ''}`} id="resistance-control">
        <div className="slider-header">
          <label className="slider-label" htmlFor="resistance-slider">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="9" width="20" height="6" rx="2" />
              <line x1="6" y1="9" x2="6" y2="15" strokeWidth="4" />
              <line x1="10" y1="9" x2="10" y2="15" strokeWidth="4" />
              <line x1="14" y1="9" x2="14" y2="15" strokeWidth="4" />
            </svg>
            Resistance
            {isComplete && !hasResistorInLoop && (
              <span className="bypassed-badge" title="Resistor is not part of the active loop">Bypassed</span>
            )}
          </label>
          <span className="slider-value" aria-live="polite">
            {resistance >= 1000 ? `${(resistance / 1000).toFixed(1)} kΩ` : `${resistance} Ω`}
          </span>
        </div>
        <input
          id="resistance-slider"
          type="range"
          className="resistance-slider"
          min={0}
          max={100}
          step={1}
          value={resistancePct}
          onChange={e => {
            // Logarithmic mapping
            const pct = Number(e.target.value) / 100
            const logVal = Math.exp(pct * (Math.log(1000) - Math.log(1)) + Math.log(1))
            onResistanceChange(Math.round(logVal))
          }}
          style={{ '--pct': `${resistancePct}%` } as React.CSSProperties}
          aria-label={`Resistance: ${resistance} ohms`}
        />
        <div className="slider-limits">
          <span>1 Ω</span>
          <span>1 kΩ</span>
        </div>
      </div>

      {/* Brightness Indicator */}
      <div className="slider-control" id="brightness-control">
        <div className="slider-header">
          <div className="slider-label">
            <svg viewBox="0 0 24 24" fill="none" stroke={isComplete ? '#f59e0b' : 'currentColor'} strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="5" fill={isComplete ? '#fde68a' : 'none'} />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            Brightness
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>(Bulb)</span>
          </div>
          <span
            className="slider-value"
            style={{ color: isComplete ? '#f59e0b' : 'var(--text-muted)' }}
            aria-live="polite"
          >
            {brightness}%
          </span>
        </div>
        <div className="brightness-meter-container" role="img" aria-label={`Brightness: ${brightness}%`}>
          <div className="brightness-meter-fill" style={{ width: `${brightnessPct}%` }} />
        </div>
        <div className="slider-limits">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="metric-divider" />

      {/* Metrics */}
      <div className="metric-row" id="metric-current">
        <span className="metric-label">
          <span className="metric-badge current" aria-hidden="true">I</span>
          Current
        </span>
        <span className="metric-value" aria-label={`Current: ${current} amps`}>
          {isComplete ? `${current.toFixed(3)} A` : '—'}
        </span>
      </div>

      <div className="metric-row" id="metric-voltage-bulb">
        <span className="metric-label">
          <span className="metric-badge voltage" aria-hidden="true">V</span>
          Voltage
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(Across Bulb)</span>
        </span>
        <span className="metric-value" aria-label={`Voltage across bulb: ${voltageDrop} volts`}>
          {isComplete ? `${voltageDrop.toFixed(1)} V` : '—'}
        </span>
      </div>

      <div className="metric-row" id="metric-power">
        <span className="metric-label">
          <span className="metric-badge power" aria-hidden="true">P</span>
          Power (Bulb)
        </span>
        <span className="metric-value" aria-label={`Power: ${power} watts`}>
          {isComplete ? `${power.toFixed(2)} W` : '—'}
        </span>
      </div>

      <div className="metric-divider" />

      {/* Tip or Warning Card */}
      {isComplete && !hasResistorInLoop ? (
        <div className="warning-card" role="alert" aria-label="Circuit warning">
          <span className="warning-card-icon" aria-hidden="true">⚠️</span>
          <p className="warning-card-text">
            {!hasResistorOnCanvas
              ? 'Overload Warning: The bulb is connected directly to the battery with no resistor! High current may damage the bulb. Drag a resistor from the sidebar and place it in the loop.'
              : 'Warning: The circuit is complete, but current is bypassing the resistor! Connect the resistor in-line within the loop to safely limit the current.'}
          </p>
        </div>
      ) : (
        <div className="tip-card" role="complementary" aria-label="Learning tip">
          <span className="tip-card-icon" aria-hidden="true">💡</span>
          <p className="tip-card-text">
            {isComplete
              ? 'Try changing the voltage or resistance and observe how the bulb brightness and current change.'
              : !hasResistorOnCanvas
              ? 'Hint: Drag a resistor from the sidebar onto the canvas! It acts as a safety shield to control the flow of electricity.'
              : !hasResistorInLoop
              ? 'Hint: Connect the resistor into your circuit! Including it in the loop protects the bulb from receiving too much power.'
              : 'Hint: Connect the battery, resistor, and bulb in a loop with wires to complete your circuit!'}
          </p>
        </div>
      )}

      {/* Interaction Hint Card — adapts to touch vs. mouse */}
      <div className="hint-card" role="complementary" aria-label="Interaction hint">
        <span className="hint-card-icon" aria-hidden="true">
          <span className="hint-icon-mouse">🖱️</span>
          <span className="hint-icon-touch">👆</span>
        </span>
        <p className="hint-card-text">
          <strong className="hint-action-mouse">Hover over any wire</strong>
          <strong className="hint-action-touch">Tap any wire</strong>
          {' '}to see voltage and current at that point.
        </p>
      </div>
    </aside>
  )
}
