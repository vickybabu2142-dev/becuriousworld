# Architecture — BeCurious World

Technical deep-dive into how the application is structured, how the physics
engine works, and how the key systems interact.

---

## 1. High-Level Architecture

```
┌───────────────────────────────────────────────────────────┐
│                        App.tsx                            │
│  (Single source of truth — CircuitState + all handlers)   │
└──────┬──────────────┬───────────────────┬─────────────────┘
       │              │                   │
   Sidebar      CircuitCanvas        ControlsPanel
  (palette)    (SVG workspace)       (sliders + metrics)
       │              │
  DragStart     DropComponent
                MoveComponent
                AddWire
```

**Key principle:** All state lives in `App.tsx`. Child components are
**purely presentational** — they receive props and fire callbacks. No child
manages its own circuit state.

---

## 2. State Shape (`CircuitState`)

```ts
interface CircuitState {
  components: PlacedComponent[]  // Battery, Bulb, Resistor on canvas
  wires: Wire[]                  // Connections between terminals
  voltage: number                // 1–24 V (battery slider)
  resistance: number             // 1–1000 Ω (resistor slider)
  isComplete: boolean            // DFS-detected closed loop
  current: number                // Amps (Ohm's Law output)
  brightness: number             // 0–100% (derived from current)
  voltageDrop: number            // Across bulb (V)
  power: number                  // Watts
  showParticles: boolean         // Particle animation toggle
  isDark: boolean                // Theme
  selectedWireType: WireType     // 'live' | 'neutral'
  showCelebration: boolean       // First-completion banner
  hasEverCompleted: boolean      // Prevent repeated celebrations
}
```

---

## 3. Physics Engine

Located in `src/store/circuitStore.ts` — `calculateCircuit()`.

### Ohm's Law implementation

```
Total R    = userResistance + BULB_INTERNAL_RESISTANCE (10Ω)
Current    = Voltage / Total R
V (bulb)   = Current × BULB_INTERNAL_RESISTANCE
Power      = Current × V (bulb)
Brightness = clamp(Current / maxCurrent × 100, 0, 100)
```

`maxCurrent` is calculated at `24V / (1Ω + 10Ω)` — the theoretical maximum,
used to normalize brightness to a 0–100% scale.

**Pure function** — no side effects, always deterministic:
```ts
calculateCircuit({ voltage, resistance, isComplete }) → { current, brightness, voltageDrop, power }
```

---

## 4. Circuit Completion Detection

Located in `circuitStore.ts` — `isCircuitComplete()` & `analyzeCircuit()`.

Uses **terminal-level DFS path-finding traversal** starting at the Battery Positive terminal:

```
Step 1: Build terminal-level adjacency map
        Each wire becomes an edge between terminal IDs.

Step 2: Traversal from Battery Positive
        - Cross component internally: from one terminal to another (except Battery).
        - Traverse wires: from terminal to terminal.
        - Check if Battery Negative is reached.
        - Keep track of visited terminals to prevent cycles.

Step 3: Bulb Requirement
        Verify that the path from Positive to Negative passes through the Bulb.

Step 4: Resistor Detection
        If a valid path exists, check if the Resistor is also traversed in that loop.
        If yes -> include resistor resistance in calculations.
        If no -> resistor is bypassed (actual resistance = 0).
```

This correctly handles:
- Open circuits (not all components connected)
- Bypassed resistors (correctly calculated as 0Ω total added resistance)
- Short/incorrect terminal loops (e.g., both wires connected to the same terminal)
- Correct closed loops passing through the bulb

---

## 5. SVG Canvas Architecture

`CircuitCanvas.tsx` uses a **single SVG root** with mouse event delegation:

```
<svg onMouseMove onMouseUp onMouseLeave onDrop>
  ├── <defs>         — gradient & filter definitions
  ├── Wires          — rendered first (behind components)
  │   ├── Shadow path (blurred, for depth)
  │   ├── Main path
  │   └── Particle path (animated dashes, when showParticles)
  ├── Live wire preview  — dashed line while drawing
  └── Components     — rendered on top
      ├── Selection highlight rect
      ├── Component SVG (Battery / Bulb / Resistor)
      └── Terminal circles (snap points)
```

### Mouse event model

| Event | Action |
|---|---|
| `onMouseDown` on component | Begin component drag |
| `onMouseDown` on terminal | Begin wire drawing |
| `onMouseMove` on SVG | Move component OR update live wire preview |
| `onMouseUp` on SVG | Drop component OR finalize wire |
| `onMouseLeave` on SVG | Cancel any active drag/wire |

### Coordinate system

All positions are in **SVG viewport coordinates** (pixels from top-left of SVG).
`clientToSVG()` converts browser client coordinates to SVG space using `getBoundingClientRect()`.

### Snap-to-terminal

```ts
const SNAP_RADIUS = 28   // pixels

findNearbyTerminal(pos):
  for each component (excluding source component):
    for each terminal:
      dist = hypot(terminal.abs.x - pos.x, terminal.abs.y - pos.y)
      if dist < SNAP_RADIUS: return this terminal
```

---

## 6. Wire Routing

Wires use **cubic Bézier curves** between two terminal points:

```ts
buildPath([A, B]):
  midX = (A.x + B.x) / 2
  return `M A.x A.y C midX A.y, midX B.y, B.x B.y`
```

This produces smooth S-curve routing regardless of terminal orientation.

---

## 7. Theme System

All visual tokens are **CSS custom properties** on `:root`:

```css
:root { --bg-app: #f1f5f9; --text-primary: #0f172a; ... }
[data-theme="dark"] { --bg-app: #0f1117; --text-primary: #f1f5f9; ... }
```

Theme is applied by setting `data-theme` on `document.documentElement` in a `useEffect`:

```ts
useEffect(() => {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
}, [isDark])
```

---

## 8. Component Terminal Spec

Each component type has a fixed terminal layout defined in `COMPONENT_SPECS` that matches the graphics in `SVGComponents.tsx` exactly:

```ts
battery:  terminals at (0, -61) top [pos] and (0, +59) bottom [neg]
bulb:     terminals at (-22, +54) [a] and (+22, +54) [b] — both at base leads
resistor: terminals at (-63, 0) left and (+63, 0) right
```

Coordinates are **relative to the component's center position** on the canvas.
Absolute positions are computed as `comp.x + terminal.dx, comp.y + terminal.dy`.

---

## 9. Rendering Pipeline

On every state change:

```
User action (drag/wire/slider)
  → Handler in App.tsx
  → setState with new components/wires/voltage/resistance
  → isCircuitComplete() called → updates isComplete
  → calculateCircuit() called → updates current/brightness/power
  → React re-renders affected components
  → SVG repaints (CSS transitions handle smooth animations)
```

Performance note: Only `App.tsx` holds state. All child components re-render
only when their specific props change (standard React behavior). The SVG canvas
is intentionally kept simple — no canvas API, no WebGL.
