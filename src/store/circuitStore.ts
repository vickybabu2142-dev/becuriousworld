// ======================================================
// Circuit Store — Core state for the playground
// ======================================================

export type ComponentType = 'battery' | 'bulb' | 'resistor'
export type WireType = 'live' | 'neutral'

export interface Terminal {
  id: string         // e.g. "battery-0-pos"
  componentId: string
  label: 'pos' | 'neg' | 'left' | 'right' | 'a' | 'b'
  // Position relative to the component's x,y (offset)
  dx: number
  dy: number
}

export interface PlacedComponent {
  id: string
  type: ComponentType
  x: number
  y: number
  terminals: Terminal[]
}

export interface Wire {
  id: string
  fromTerminalId: string
  toTerminalId: string
  wireType: WireType
}

export interface CircuitState {
  components: PlacedComponent[]
  wires: Wire[]
  voltage: number        // 1–24 V
  resistance: number     // 1–1000 Ω
  isComplete: boolean
  hasResistorInLoop?: boolean
  current: number        // Amps (calculated)
  brightness: number     // 0–100 %
  voltageDrop: number    // Across bulb
  power: number          // Watts
  showParticles: boolean
  isDark: boolean
  activeTab: 'play' | 'learn'
  selectedWireType: WireType
  hasEverCompleted: boolean
}

export const BULB_INTERNAL_RESISTANCE = 10 // Ω (internal bulb resistance)
export const MAX_SAFE_VOLTAGE = 24
export const MIN_VOLTAGE = 1

// ======================================================
// Physics Engine
// ======================================================
export function calculateCircuit(
  state: Pick<CircuitState, 'voltage' | 'resistance' | 'isComplete'> & { hasResistor?: boolean }
) {
  if (!state.isComplete) {
    return { current: 0, brightness: 0, voltageDrop: 0, power: 0 }
  }
  const actualResistance = state.hasResistor !== false ? state.resistance : 0
  const totalR = actualResistance + BULB_INTERNAL_RESISTANCE
  const current = state.voltage / totalR
  const voltageDrop = current * BULB_INTERNAL_RESISTANCE
  const power = current * voltageDrop
  // Max brightness reference (when resistance is 0): 24V / 10Ω = 2.4A
  const maxCurrent = MAX_SAFE_VOLTAGE / BULB_INTERNAL_RESISTANCE
  const brightness = Math.min(100, Math.round((current / maxCurrent) * 100))
  return {
    current: Math.round(current * 1000) / 1000,
    brightness,
    voltageDrop: Math.round(voltageDrop * 100) / 100,
    power: Math.round(power * 100) / 100,
  }
}

// ======================================================
// Graph-based circuit completion and loop analysis
// ======================================================
export function analyzeCircuit(
  components: PlacedComponent[],
  wires: Wire[]
): { isComplete: boolean; hasResistor: boolean } {
  const battery = components.find(c => c.type === 'battery')
  const bulb = components.find(c => c.type === 'bulb')
  if (!battery || !bulb) return { isComplete: false, hasResistor: false }

  const posTerminal = battery.terminals.find(t => t.label === 'pos')
  const negTerminal = battery.terminals.find(t => t.label === 'neg')
  if (!posTerminal || !negTerminal) return { isComplete: false, hasResistor: false }

  // Map terminal ID to list of wires connected to it
  const wireMap = new Map<string, Wire[]>()
  wires.forEach(wire => {
    if (!wireMap.has(wire.fromTerminalId)) wireMap.set(wire.fromTerminalId, [])
    if (!wireMap.has(wire.toTerminalId)) wireMap.set(wire.toTerminalId, [])
    wireMap.get(wire.fromTerminalId)!.push(wire)
    wireMap.get(wire.toTerminalId)!.push(wire)
  })

  // We perform a terminal-level DFS to find if there is a path from the
  // Battery Positive terminal to the Battery Negative terminal that passes through the bulb.
  const visited = new Set<string>()
  let foundHasResistor = false

  function dfs(currTerminalId: string, hasPassedBulb: boolean, hasPassedResistor: boolean): boolean {
    if (currTerminalId === negTerminal.id) {
      if (hasPassedBulb) {
        foundHasResistor = hasPassedResistor
        return true
      }
      return false
    }

    visited.add(currTerminalId)

    // Find component this terminal belongs to
    const comp = components.find(c => c.terminals.some(t => t.id === currTerminalId))
    if (!comp) {
      visited.delete(currTerminalId)
      return false
    }

    // Traverse component internally from currTerminal to other terminals of same component
    // (We do not internally cross the battery so we don't cheat start/end of loop)
    if (comp.type !== 'battery') {
      const otherTerminals = comp.terminals.filter(t => t.id !== currTerminalId)
      for (const otherT of otherTerminals) {
        if (!visited.has(otherT.id)) {
          visited.add(otherT.id)
          const connectedWires = wireMap.get(otherT.id) || []
          for (const wire of connectedWires) {
            const nextTerminalId = wire.fromTerminalId === otherT.id ? wire.toTerminalId : wire.fromTerminalId
            if (!visited.has(nextTerminalId)) {
              const isBulb = comp.type === 'bulb'
              const isResistor = comp.type === 'resistor'
              if (dfs(nextTerminalId, hasPassedBulb || isBulb, hasPassedResistor || isResistor)) {
                return true
              }
            }
          }
          visited.delete(otherT.id)
        }
      }
    }

    visited.delete(currTerminalId)
    return false
  }

  // Start search by following wires from Battery POS
  const startWires = wireMap.get(posTerminal.id) || []
  for (const wire of startWires) {
    const nextTerminalId = wire.fromTerminalId === posTerminal.id ? wire.toTerminalId : wire.fromTerminalId
    if (dfs(nextTerminalId, false, false)) {
      return { isComplete: true, hasResistor: foundHasResistor }
    }
  }

  return { isComplete: false, hasResistor: false }
}
// ======================================================
// Terminal positions (relative to component SVG center)
// Sync'd perfectly with visual locations in SVGComponents.tsx
// ======================================================
export const COMPONENT_SPECS: Record<ComponentType, {
  width: number
  height: number
  terminals: Omit<Terminal, 'id' | 'componentId'>[]
}> = {
  battery: {
    width: 80,
    height: 120,
    terminals: [
      { label: 'pos', dx: 0, dy: -61 },
      { label: 'neg', dx: 0, dy: 59 },
    ],
  },
  bulb: {
    width: 80,
    height: 100,
    terminals: [
      { label: 'a', dx: -22, dy: 54 },
      { label: 'b', dx: 22, dy: 54 },
    ],
  },
  resistor: {
    width: 120,
    height: 40,
    terminals: [
      { label: 'left', dx: -63, dy: 0 },
      { label: 'right', dx: 63, dy: 0 },
    ],
  },
}

export function makeComponent(
  type: ComponentType,
  x: number,
  y: number,
  index: number
): PlacedComponent {
  const spec = COMPONENT_SPECS[type]
  const terminals: Terminal[] = spec.terminals.map(t => ({
    ...t,
    id: `${type}-${index}-${t.label}`,
    componentId: `${type}-${index}`,
  }))
  return {
    id: `${type}-${index}`,
    type,
    x,
    y,
    terminals,
  }
}

export const initialState: CircuitState = {
  components: [],
  wires: [],
  voltage: 12,
  resistance: 100,
  isComplete: false,
  current: 0,
  brightness: 0,
  voltageDrop: 0,
  power: 0,
  showParticles: false,
  isDark: true,
  activeTab: 'play',
  selectedWireType: 'live',
  hasEverCompleted: false,
}
