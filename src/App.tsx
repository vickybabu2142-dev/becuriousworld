import { useState, useCallback, useEffect } from 'react'
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
        points: [],
      }
      const newWires = [...state.wires, newWire]
      const calc = recalculate(state.components, newWires, state.voltage, state.resistance)
 
      const justCompleted = calc.isComplete && !state.isComplete && !state.hasEverCompleted
 
      setState(prev => ({
        ...prev,
        wires: newWires,
        ...calc,
        showCelebration: justCompleted,
        hasEverCompleted: prev.hasEverCompleted || justCompleted,
      }))
 
      if (justCompleted) {
        setTimeout(() => {
          setState(prev => ({ ...prev, showCelebration: false }))
        }, 2500)
      }
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
          selectedWireType={state.selectedWireType}
          onSelectWireType={wt => setState(prev => ({ ...prev, selectedWireType: wt }))}
          placedComponents={placedComponents}
        />

        {/* Center Canvas */}
        <CircuitCanvas
          components={state.components}
          wires={state.wires}
          isComplete={state.isComplete}
          showParticles={state.showParticles}
          selectedWireType={state.selectedWireType}
          voltage={state.voltage}
          resistance={state.resistance}
          current={state.current}
          brightness={state.brightness}
          onDropComponent={handleDropComponent}
          onMoveComponent={handleMoveComponent}
          onAddWire={handleAddWire}
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
          onVoltageChange={handleVoltageChange}
          onResistanceChange={handleResistanceChange}
        />
      </div>

      {/* Footer */}
      <Footer isComplete={state.isComplete} />
    </div>
  )
}
