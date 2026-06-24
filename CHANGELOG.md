# Changelog

All notable changes to **BeCurious World** are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Planned
- Sound effects (wire click, bulb on, celebration jingle)
- Touch & mobile drag-and-drop support
- Challenge / mission system (4 guided missions)
- Bulb burnout state at excessive voltage
- Learn tab — theory view with interactive explanations
- Multiple batteries / bulbs / resistors in V2

---

## [0.1.2] — 2026-06-24

### Fixed
- **Clean Orthogonal Wire Routing:** Redesigned the V-to-H and H-to-V wire routing logic to route paths directly through natural terminal exit boundaries. This separates Live and Neutral wires perfectly based on their starting terminals, completely preventing visual wire crossings and overlaps with the battery or other components.
- **Dynamic Loop-Based Current Direction:** Replaced static wire connection heuristics with a graph-based pathfinder that computes the exact terminal path from the battery positive terminal (+) to the negative terminal (-). This guarantees that animated current particles always flow physically from the positive terminal, through components, and back to the negative terminal (Live → Bulb → Neutral), completing the loop correctly.

### Enhanced
- **High-Dynamic-Range Bulb Glow:** Expanded the visual range of the light bulb glow. It now dynamically shifts color temperature from a warm, dim red-orange at low brightness to a brilliant golden-yellow and white-hot glow at maximum brightness. Configured a wider radial bloom, increased the blur radius from 7px to 23px, and added glowing white core highlights on the filament to make changes in voltage and resistance stand out clearly.

---

## [0.1.1] — 2026-06-24

### Fixed
- **Terminal Alignments:** Aligned interactive coordinate specs in `circuitStore.ts` with visual positions in `SVGComponents.tsx` to prevent offsets in wire endpoints.
- **Physics Engine Loop Checks:** Upgraded BFS circuit detection to a terminal-level DFS pathfinder. Corrected a physics bug where connecting both wires to a single terminal resulted in a complete circuit.
- **Resistor Bypass Logic:** Added bypass detection to check if the resistor is part of the active loop. If the resistor is bypassed, the physics engine now ignores its resistance, visually dims the resistor control with a "Bypassed" badge, and displays a contextual explanation in the controls panel.
- **Battery Ambient Glow:** Removed the ambient glowing highlight from the battery component when the circuit is active, restricting the active glow to the light bulb only.
- **Bulb Color & Glow:** Redesigned the bulb glow to use a highly visible, warm golden-yellow color scheme instead of red. Scaled down the outer bloom size to keep the glow tight and high-intensity, ensuring clear visibility in both light and dark themes.
- **Fluid Drag Recalculations:** Configured the drag-and-drop handler in `App.tsx` to recalculate physics in real time during moves. This prevents the circuit state (glowing bulb, particle flow, current metrics) from locking or freezing while dragging connected components around the canvas.
- **Component Click & Drag Bubbling:** Fixed a critical bug in `CircuitCanvas.tsx` where setting `pointer-events: none` on the component body wrapper prevented mouse clicks from registering. Changed it to `pointer-events: auto` so that click and drag events correctly bubble up to the parent drag handler, allowing placed components to be dragged fluidly at any time.

### Enhanced
- **Default Dark Theme:** Configured the application to load the dark theme by default on initial visits.
- **Live Simulation Flow:** Removed the manual Play/Pause buttons. The simulation runs immediately as soon as a complete path is established, making the bulb glow automatically.
- **Sticky Success Toast:** Consolidated success feedback into a single, top-aligned celebration toast. Replaced the auto-dismiss timer and pointer-events lock with a sticky, card-shaped dialog floating at the top of the canvas, complete with a fully interactive close button. Keeps the educational text from the learning card intact.
- **Stable Canvas Layout:** Positioned the celebration card absolutely to float over the workspace. This keeps the SVG canvas height static when a circuit is completed (preventing scaling glitches), removes the redundant fixed success banner, and adds a dismiss button for a cleaner layout.
- **Rounded Orthogonal Wire Routing:** Combined orthogonal routing (90-degree perpendicular segments) with smooth corner bowing (filleted arcs using quadratic Bezier curves with a 16px radius). Wires exit terminals in their natural direction (vertical for battery, horizontal for resistor/bulb) and transition seamlessly around corners with no overshoots or overlaps, creating a modern schematic layout.
- **Circular Bulb & Coiled Filament Design:** Redesigned the light bulb illustration to feature a circular globe envelope matching standard household bulbs. Upgraded the internal filament assembly to include a realistic glass mount, support leads, center molybdenum suspension hook, and a highly detailed coiled zig-zag tungsten filament path that glows white-hot proportionally with brightness.

---

## [0.1.0] — 2026-06-24

### Added
- Initial project scaffold with Vite + React + TypeScript
- 3-panel layout: sidebar, canvas, controls
- **Sidebar** — draggable Battery, Bulb, and Resistor component cards
- **Wire palette** — Live (brown) and Neutral (blue) wire type selector
- **SVG Circuit Canvas** — infinite drag-and-drop workspace with dot-grid background
- **Battery SVG** — with positive/negative terminals, voltage label, glow effect
- **Bulb SVG** — 4-state brightness animation (Off / Dim / Medium / Bright)
- **Resistor SVG** — classic band resistor with color-coded bands
- **Wire drawing** — click terminal → drag → magnetic snap to nearest terminal
- **Circuit completion detection** — BFS graph traversal over component nodes
- **Physics engine** — Ohm's Law: `I = V / R`, brightness, voltage drop, power
- **Voltage slider** — 1V → 24V, live feedback on bulb brightness
- **Resistance slider** — 1Ω → 1kΩ (logarithmic scale), live feedback
- **Brightness indicator** — read-only slider showing % brightness
- **Live metrics** — Current (A), Voltage across bulb (V), Power (W)
- **Show Electricity toggle** — animated particle flow along wires
- **Celebration overlay** — confetti + badge on first circuit completion
- **Learning card** — contextual explanation appears when circuit is complete
- **Hover tooltips** — voltage and current on wire hover
- **Light / Dark theme toggle** — full CSS variable-based theming
- **Header** — logo, Play/Learn tabs, Show Electricity button, Reset, theme toggle
- **Footer** — contextual educational note about live/neutral wires
- **Tip card** — contextual guidance in the controls panel
- **Responsive layout** — adapts to tablet and mobile screen sizes
- `.gitignore`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`
- `ANTIGRAVITY_REFERENCE.md` — AI agent skills and commands reference
- `.agents/AGENTS.md` — project-scoped AI coding rules
- `.agents/skills/becurious-world/SKILL.md` — custom project skill
- `docs/ARCHITECTURE.md` — technical deep-dive
- `docs/ROADMAP.md` — feature roadmap

---

[Unreleased]: https://github.com/your-org/becurious-world/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/your-org/becurious-world/releases/tag/v0.1.0
