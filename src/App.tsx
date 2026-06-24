import { useState, useCallback, useEffect, CSSProperties } from 'react'
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
 
let componentCounter = 0
 
export default function App() {
  const [state, setState] = useState<CircuitState>(initialState)
  const [successDismissed, setSuccessDismissed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [controlsOpen, setControlsOpen] = useState(false)

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
      const newComp = makeComponent(compType, x, y, componentCounter++)
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

  // ── Tap to add component callback ────────────────────────────
  const handleAddComponent = useCallback(
    (type: ComponentType) => {
      if (state.components.some(c => c.type === type)) return
      // Position spaced nicely around center (x: 350, 700, 1050; y: 400)
      let x = 700
      let y = 400
      if (type === 'battery') {
        x = 350
        y = 400
      } else if (type === 'bulb') {
        x = 700
        y = 400
      } else if (type === 'resistor') {
        x = 1050
        y = 400
      }
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
            <div className="success-overlay" onClick={() => setSuccessDismissed(true)}>
              <div className="success-ripple" />
            </div>
            <div className="success-sheet" role="alert" aria-live="assertive">
              <div className="success-sheet-glow-bar" />
              
              {/* Confetti sparks */}
              <div className="success-confetti-container">
                <div className="confetti" style={{ '--dx': '-160px', '--dy': '140px', '--color': '#fbbf24', '--delay': '0.1s' } as CSSProperties} />
                <div className="confetti" style={{ '--dx': '-90px', '--dy': '200px', '--color': '#f59e0b', '--delay': '0.2s' } as CSSProperties} />
                <div className="confetti" style={{ '--dx': '-30px', '--dy': '240px', '--color': '#3b82f6', '--delay': '0.05s' } as CSSProperties} />
                <div className="confetti" style={{ '--dx': '30px', '--dy': '220px', '--color': '#60a5fa', '--delay': '0.15s' } as CSSProperties} />
                <div className="confetti" style={{ '--dx': '100px', '--dy': '160px', '--color': '#22c55e', '--delay': '0s' } as CSSProperties} />
                <div className="confetti" style={{ '--dx': '-130px', '--dy': '180px', '--color': '#818cf8', '--delay': '0.25s' } as CSSProperties} />
                <div className="confetti" style={{ '--dx': '70px', '--dy': '190px', '--color': '#a855f7', '--delay': '0.08s' } as CSSProperties} />
                <div className="confetti" style={{ '--dx': '-50px', '--dy': '160px', '--color': '#ec4899', '--delay': '0.12s' } as CSSProperties} />
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
                <p>
                  Electricity is flowing through your circuit, heating up the bulb's filament until it glows!
                </p>
                <p className="success-sheet-detail">
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
    </div>
  )
}
