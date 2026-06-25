import React, { useState, useCallback, useEffect, useRef, CSSProperties } from 'react'
import {
  CircuitState,
  PlacedComponent,
  Wire,
  ComponentType,
  WireType,
  initialState,
  makeComponent,
  analyzeCircuit,
  calculateCircuit,
} from './store/circuitStore'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { CircuitCanvas } from './components/CircuitCanvas'
import { ControlsPanel } from './components/ControlsPanel'
import { Footer } from './components/Footer'
 
// ── Touch drag ref type ──────────────────────────────────────────────────
interface TouchDragState {
  type: ComponentType | null
  ghostEl: HTMLDivElement | null
}
 
export default function App() {
  const [state, setState] = useState<CircuitState>(initialState)
  const [successDismissed, setSuccessDismissed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [controlsOpen, setControlsOpen] = useState(false)
  const componentCounterRef = useRef(0)
  // Touch drag from sidebar to canvas
  const touchDragRef = useRef<TouchDragState>({ type: null, ghostEl: null })

  // Reset dismissed state when circuit goes from complete to incomplete
  useEffect(() => {
    if (!state.isComplete) {
      setSuccessDismissed(false)
    }
  }, [state.isComplete])

  // Close mobile panels when active tab changes
  useEffect(() => {
    setSidebarOpen(false)
    setControlsOpen(false)
  }, [state.activeTab])
 
  // ── Apply theme to document ──────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.isDark ? 'dark' : 'light')
  }, [state.isDark])
 
  // ── Recalculate physics whenever relevant state changes ──────
  const recalculate = useCallback(
    (
      components: PlacedComponent[],
      wires: Wire[],
      voltage: number,
      resistance: number
    ) => {
      const { isComplete: complete, hasResistor } = analyzeCircuit(components, wires)
      const physics = calculateCircuit({
        voltage,
        resistance,
        isComplete: complete,
        hasResistor,
      })
      return { isComplete: complete, hasResistorInLoop: hasResistor, ...physics }
    },
    []
  )
 
  // ── Drop component onto canvas ───────────────────────────────
  const handleDropComponent = useCallback(
    (type: string, x: number, y: number) => {
      const compType = type as ComponentType
      // Only one of each in V1
      if (state.components.some(c => c.type === compType)) return
      const newComp = makeComponent(compType, x, y, componentCounterRef.current++)
      const newComponents = [...state.components, newComp]
      const calc = recalculate(newComponents, state.wires, state.voltage, state.resistance)
      setState(prev => ({
        ...prev,
        components: newComponents,
        ...calc,
      }))
    },
    [state, recalculate]
  )

  // ── Tap to add component callback ────────────────────────────────
  const handleAddComponent = useCallback(
    (type: ComponentType) => {
      if (state.components.some(c => c.type === type)) return
      // Space components evenly across the canvas width in the SVG coordinate space.
      // Canvas is 1400×800. Place at horizontal thirds and vertical center.
      // These positions look good after auto zoom-to-fit on any screen size.
      const defaultPositions: Record<ComponentType, { x: number; y: number }> = {
        battery: { x: 300, y: 400 },
        bulb: { x: 700, y: 400 },
        resistor: { x: 1100, y: 400 },
      }
      const { x, y } = defaultPositions[type]
      handleDropComponent(type, x, y)
    },
    [state.components, handleDropComponent]
  )
 
  // ── Move component ───────────────────────────────────────────
  const handleMoveComponent = useCallback(
    (id: string, x: number, y: number) => {
      setState(prev => {
        const newComponents = prev.components.map(c =>
          c.id === id ? { ...c, x, y } : c
        )
        const calc = recalculate(newComponents, prev.wires, prev.voltage, prev.resistance)
        return {
          ...prev,
          components: newComponents,
          ...calc,
        }
      })
    },
    [recalculate]
  )
 
  // ── Add wire ─────────────────────────────────────────────────
  const handleAddWire = useCallback(
    (fromId: string, toId: string, wireType: WireType) => {
      // Prevent duplicate wires
      const exists = state.wires.some(
        w =>
          (w.fromTerminalId === fromId && w.toTerminalId === toId) ||
          (w.fromTerminalId === toId && w.toTerminalId === fromId)
      )
      if (exists) return
 
      const newWire: Wire = {
        id: `wire-${Date.now()}`,
        fromTerminalId: fromId,
        toTerminalId: toId,
        wireType,
      }
      const newWires = [...state.wires, newWire]
      const calc = recalculate(state.components, newWires, state.voltage, state.resistance)
 
      const justCompleted = calc.isComplete && !state.isComplete && !state.hasEverCompleted
 
      setState(prev => ({
        ...prev,
        wires: newWires,
        ...calc,
        hasEverCompleted: prev.hasEverCompleted || justCompleted,
      }))
    },
    [state, recalculate]
  )
 
  // ── Voltage change ───────────────────────────────────────────
  const handleVoltageChange = useCallback(
    (voltage: number) => {
      const calc = recalculate(state.components, state.wires, voltage, state.resistance)
      setState(prev => ({ ...prev, voltage, ...calc }))
    },
    [state, recalculate]
  )
 
  // ── Resistance change ────────────────────────────────────────
  const handleResistanceChange = useCallback(
    (resistance: number) => {
      const calc = recalculate(state.components, state.wires, state.voltage, resistance)
      setState(prev => ({ ...prev, resistance, ...calc }))
    },
    [state, recalculate]
  )

  // ── Reset ────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    componentCounterRef.current = 0
    setState({ ...initialState, isDark: state.isDark })
  }, [state.isDark])

  // ── Remove wire ──────────────────────────────────────────────
  const handleRemoveWire = useCallback((wireId: string) => {
    setState(prev => {
      const newWires = prev.wires.filter(w => w.id !== wireId)
      const calc = recalculate(prev.components, newWires, prev.voltage, prev.resistance)
      return {
        ...prev,
        wires: newWires,
        ...calc,
      }
    })
  }, [recalculate])

  // ── Remove component ──────────────────────────────────────────
  const handleRemoveComponent = useCallback((compId: string) => {
    setState(prev => {
      const newComponents = prev.components.filter(c => c.id !== compId)
      const targetComp = prev.components.find(c => c.id === compId)
      const terminalIds = targetComp ? targetComp.terminals.map(t => t.id) : []
      const newWires = prev.wires.filter(
        w => !terminalIds.includes(w.fromTerminalId) && !terminalIds.includes(w.toTerminalId)
      )
      const calc = recalculate(newComponents, newWires, prev.voltage, prev.resistance)
      return {
        ...prev,
        components: newComponents,
        wires: newWires,
        ...calc,
      }
    })
  }, [recalculate])

  // ── Drag start from sidebar ───────────────────────────────────
  const handleSidebarDragStart = useCallback(
    (type: ComponentType, e: React.DragEvent) => {
      e.dataTransfer.setData('componentType', type)
    },
    []
  )

  // ── Touch drag from sidebar ───────────────────────────────────────────
  const handleSidebarTouchDragStart = useCallback(
    (type: ComponentType, e: React.TouchEvent) => {
      // Don't start drag if component already placed
      if (state.components.some(c => c.type === type)) return
      e.stopPropagation()

      const touch = e.touches[0]

      // Emoji icon for the ghost
      const icon = type === 'battery' ? '🔋' : type === 'bulb' ? '💡' : '⚡'

      // Create floating ghost that follows the finger
      const ghost = document.createElement('div')
      ghost.className = 'touch-drag-ghost'
      ghost.textContent = icon
      ghost.style.cssText = [
        'position:fixed',
        `left:${touch.clientX - 36}px`,
        `top:${touch.clientY - 36}px`,
        'width:72px', 'height:72px',
        'background:var(--bg-surface)',
        'border:2.5px solid var(--brand-primary)',
        'border-radius:16px',
        'display:flex', 'align-items:center', 'justify-content:center',
        'font-size:32px',
        'pointer-events:none',
        'z-index:9999',
        'box-shadow:0 12px 32px rgba(0,0,0,0.35)',
        'transform:scale(1.05)',
        'transition:border-color 120ms ease',
      ].join(';')
      document.body.appendChild(ghost)
      touchDragRef.current = { type, ghostEl: ghost }

      // Close sidebar drawer when drag starts so canvas is visible
      setSidebarOpen(false)

      const onMove = (me: TouchEvent) => {
        me.preventDefault()
        const t = me.touches[0]
        ghost.style.left = `${t.clientX - 36}px`
        ghost.style.top  = `${t.clientY - 36}px`

        // Green border when hovering over the canvas SVG
        const svgEl = document.querySelector('.circuit-canvas')
        if (svgEl) {
          const rect = svgEl.getBoundingClientRect()
          const over = t.clientX >= rect.left && t.clientX <= rect.right &&
                       t.clientY >= rect.top  && t.clientY <= rect.bottom
          ghost.style.borderColor = over
            ? 'var(--brand-green)'
            : 'var(--brand-primary)'
        }
      }

      const onEnd = (te: TouchEvent) => {
        window.removeEventListener('touchmove', onMove)
        window.removeEventListener('touchend', onEnd)

        const { type: dragType, ghostEl } = touchDragRef.current
        if (ghostEl) ghostEl.remove()
        touchDragRef.current = { type: null, ghostEl: null }

        if (!dragType) return
        const t = te.changedTouches[0]

        // Find the SVG canvas and check if we dropped over it
        const svgEl = document.querySelector('.circuit-canvas') as SVGSVGElement | null
        if (!svgEl) return

        const rect = svgEl.getBoundingClientRect()
        if (
          t.clientX < rect.left || t.clientX > rect.right ||
          t.clientY < rect.top  || t.clientY > rect.bottom
        ) return  // dropped outside canvas — cancel

        // Convert client → SVG coordinate space using the screen CTM
        // This correctly accounts for zoom, scroll and any CSS transforms.
        const pt = svgEl.createSVGPoint()
        pt.x = t.clientX
        pt.y = t.clientY
        const ctm = svgEl.getScreenCTM()
        if (ctm) {
          const svgPt = pt.matrixTransform(ctm.inverse())
          handleDropComponent(dragType, svgPt.x, svgPt.y)
        } else {
          // Fallback: manual calculation using zoom ratio
          const zoom = rect.width / 1400
          handleDropComponent(dragType,
            (t.clientX - rect.left) / zoom,
            (t.clientY - rect.top)  / zoom
          )
        }
      }

      window.addEventListener('touchmove', onMove, { passive: false })
      window.addEventListener('touchend', onEnd, { once: true })
    },
    [state.components, handleDropComponent]
  )

  const placedComponents = {
    battery: state.components.some(c => c.type === 'battery'),
    bulb: state.components.some(c => c.type === 'bulb'),
    resistor: state.components.some(c => c.type === 'resistor'),
  }

  return (
    <div id="app" data-theme={state.isDark ? 'dark' : 'light'}>
      {/* Header */}
      <Header
        isDark={state.isDark}
        onToggleTheme={() => setState(prev => ({ ...prev, isDark: !prev.isDark }))}
        showParticles={state.showParticles}
        onToggleParticles={() => setState(prev => ({ ...prev, showParticles: !prev.showParticles }))}
        onReset={handleReset}
        activeTab={state.activeTab}
        onTabChange={tab => setState(prev => ({ ...prev, activeTab: tab }))}
      />

      {/* Body */}
      <div className="app-body" id="panel-play" role="tabpanel" aria-labelledby="tab-play">
        {/* Left Sidebar */}
        <Sidebar
          onDragStart={handleSidebarDragStart}
          onAddComponent={handleAddComponent}
          onTouchDragStart={handleSidebarTouchDragStart}
          selectedWireType={state.selectedWireType}
          onSelectWireType={wt => setState(prev => ({ ...prev, selectedWireType: wt }))}
          placedComponents={placedComponents}
          isComplete={state.isComplete}
          hasResistorInLoop={state.hasResistorInLoop}
          className={sidebarOpen ? 'mobile-open' : ''}
        />

        {/* Center Canvas */}
        <CircuitCanvas
          components={state.components}
          wires={state.wires}
          isComplete={state.isComplete}
          hasResistorInLoop={state.hasResistorInLoop}
          showParticles={state.showParticles}
          selectedWireType={state.selectedWireType}
          voltage={state.voltage}
          resistance={state.resistance}
          current={state.current}
          brightness={state.brightness}
          onDropComponent={handleDropComponent}
          onMoveComponent={handleMoveComponent}
          onAddWire={handleAddWire}
          onRemoveWire={handleRemoveWire}
          onRemoveComponent={handleRemoveComponent}
          sidebarOpen={sidebarOpen}
          controlsOpen={controlsOpen}
        />
 
        {/* Right Controls */}
        <ControlsPanel
          voltage={state.voltage}
          resistance={state.resistance}
          brightness={state.brightness}
          current={state.current}
          voltageDrop={state.voltageDrop}
          power={state.power}
          isComplete={state.isComplete}
          hasResistorInLoop={state.hasResistorInLoop}
          hasResistorOnCanvas={state.components.some(c => c.type === 'resistor')}
          onVoltageChange={handleVoltageChange}
          onResistanceChange={handleResistanceChange}
          className={controlsOpen ? 'mobile-open' : ''}
        />

        {/* Backdrop for mobile drawers */}
        {(sidebarOpen || controlsOpen) && (
          <div
            className="mobile-panels-backdrop"
            onClick={() => {
              setSidebarOpen(false)
              setControlsOpen(false)
            }}
          />
        )}

        {/* Floating Mobile Toggles */}
        <div className="mobile-toggle-bar">
          <button
            className={`mobile-toggle-btn ${sidebarOpen ? 'active' : ''}`}
            onClick={() => {
              setSidebarOpen(prev => !prev)
              setControlsOpen(false)
            }}
            aria-expanded={sidebarOpen}
            aria-label="Toggle component palette"
          >
            📦 Components
          </button>
          <button
            className={`mobile-toggle-btn ${controlsOpen ? 'active' : ''}`}
            onClick={() => {
              setControlsOpen(prev => !prev)
              setSidebarOpen(false)
            }}
            aria-expanded={controlsOpen}
            aria-label="Toggle controls and readings"
          >
            ⚙️ Controls
          </button>
        </div>

        {/* Workspace Success Sheet */}
        {state.isComplete && !successDismissed && (
          <>
            <div className="success-ripple" />
            <div className="success-sheet" role="alert" aria-live="assertive">
              
              {/* Confetti sparks — bursting in 360 degrees */}
              <div className="success-confetti-container">
                <div className="confetti" style={{ '--dx': '-140px', '--dy': '-120px', '--color': '#fbbf24', '--delay': '0.1s' } as CSSProperties} />
                <div className="confetti" style={{ '--dx': '-80px', '--dy': '140px', '--color': '#f59e0b', '--delay': '0.2s' } as CSSProperties} />
                <div className="confetti" style={{ '--dx': '-20px', '--dy': '-160px', '--color': '#3b82f6', '--delay': '0.05s' } as CSSProperties} />
                <div className="confetti" style={{ '--dx': '40px', '--dy': '150px', '--color': '#60a5fa', '--delay': '0.15s' } as CSSProperties} />
                <div className="confetti" style={{ '--dx': '120px', '--dy': '-100px', '--color': '#22c55e', '--delay': '0s' } as CSSProperties} />
                <div className="confetti" style={{ '--dx': '-100px', '--dy': '-80px', '--color': '#818cf8', '--delay': '0.25s' } as CSSProperties} />
                <div className="confetti" style={{ '--dx': '90px', '--dy': '120px', '--color': '#a855f7', '--delay': '0.08s' } as CSSProperties} />
                <div className="confetti" style={{ '--dx': '-40px', '--dy': '110px', '--color': '#ec4899', '--delay': '0.12s' } as CSSProperties} />
              </div>

              <div className="success-sheet-header">
                <div className="success-sheet-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div className="success-sheet-congrats">Congratulations!</div>
                  <h3 className="success-sheet-title">Circuit Connected Successfully</h3>
                </div>
                <button
                  className="success-sheet-close"
                  onClick={() => setSuccessDismissed(true)}
                  aria-label="Dismiss success message"
                >
                  &times;
                </button>
              </div>
              <div className="success-sheet-content">
                <p style={{ margin: '0 0 8px 0', fontSize: '13px', lineHeight: '1.4' }}>
                  Electricity is flowing through your circuit from positive (+) through the bulb to negative (-), heating up the bulb's filament until it glows!
                </p>
                <p className="success-sheet-detail" style={{ margin: 0, fontSize: '12px', lineHeight: '1.4', opacity: 0.9 }}>
                  Adjust the <strong>voltage</strong> (battery power) or <strong>resistance</strong> (dimmer) on the control panel to see the bulb glow brighter or dimmer!
                </p>
              </div>

              {/* Show Electricity Toggle */}
              <div className="success-sheet-option-row">
                <div className="option-row-label">
                  <span style={{ fontSize: '15px' }} aria-hidden="true">⚡</span>
                  <span>Show electricity particle flow animation</span>
                </div>
                <label className="switch-control" htmlFor="success-particle-toggle">
                  <input
                    id="success-particle-toggle"
                    type="checkbox"
                    checked={state.showParticles}
                    onChange={() => setState(prev => ({ ...prev, showParticles: !prev.showParticles }))}
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              <div className="success-sheet-footer">
                <button className="btn btn-got-it" onClick={() => setSuccessDismissed(true)}>
                  Got It!
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <Footer isComplete={state.isComplete} />

      {/* Orientation Warning Overlay (only active in portrait mode on mobile/tab via CSS) */}
      <div className="orientation-warning" aria-live="polite">
        <div className="orientation-warning-card">
          <div className="device-rotate-icon">
            <svg viewBox="0 0 100 100" width="80" height="80" aria-hidden="true">
              {/* Phone body */}
              <rect
                className="rotate-phone"
                x="35"
                y="20"
                width="30"
                height="60"
                rx="5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              {/* Screen notch / speaker */}
              <line className="rotate-phone-detail" x1="45" y1="24" x2="55" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              {/* Screen home button */}
              <circle className="rotate-phone-detail" cx="50" cy="74" r="2" fill="currentColor" />
              
              {/* Rotation arrow */}
              <path
                className="rotate-arrow"
                d="M 25 35 A 30 30 0 0 1 75 35"
                fill="none"
                stroke="var(--brand-green)"
                strokeWidth="3"
                strokeDasharray="4 4"
              />
              <polygon points="75,35 80,27 70,30" fill="var(--brand-green)" />
            </svg>
          </div>
          <h2>Rotate Your Device</h2>
          <p>Please turn your tablet or phone sideways to landscape mode for the best circuit building experience.</p>
        </div>
      </div>
    </div>
  )
}
