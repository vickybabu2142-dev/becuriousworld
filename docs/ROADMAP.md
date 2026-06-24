# Roadmap — BeCurious World

Feature roadmap organized by version. Items within each version are roughly
prioritized top-to-bottom.

---

## ✅ Version 0.1.0 — Foundation *(Done)*

- [x] Vite + React + TypeScript scaffold
- [x] 3-panel layout (sidebar / canvas / controls)
- [x] Battery, Bulb, Resistor SVG illustrations
- [x] Drag-and-drop from sidebar to canvas
- [x] Component movement on canvas
- [x] Wire drawing with magnetic snap-to-terminal
- [x] Circuit completion detection (BFS graph)
- [x] Physics engine — Ohm's Law
- [x] Bulb brightness animation (4 states)
- [x] Voltage slider (1–24V)
- [x] Resistance slider (1–1kΩ logarithmic)
- [x] Live metrics panel (I, V, P)
- [x] Show Electricity particle animation
- [x] Celebration on first circuit completion
- [x] Learning card (contextual explanation)
- [x] Hover tooltips on wires
- [x] Light / Dark theme toggle
- [x] Responsive layout (desktop + tablet)

---

## 🚧 Version 0.2.0 — Polish & Feel *(Next)*

### Sound Design
- [ ] Wire connection click sound (subtle, satisfying)
- [ ] Bulb turn-on glow sound (soft hum)
- [ ] Circuit complete celebration jingle
- [ ] Sound mute toggle in header

### Mobile & Touch
- [ ] Touch drag-and-drop for components
- [ ] Touch wire drawing (tap-to-start, tap-to-end)
- [ ] Larger touch targets on mobile (44px minimum)
- [ ] Bottom sheet controls panel on small screens

### Visual Polish
- [ ] Component drop animation (spring bounce)
- [ ] Wire draw feel improvement (tension curve)
- [ ] Bulb burnout state (excessive voltage warning)
- [ ] Resistor smoke effect at high current

### UX Improvements
- [ ] Undo / Redo (Ctrl+Z / Ctrl+Y)
- [ ] Delete wire by clicking it
- [ ] Delete component by drag-back to sidebar
- [ ] Canvas zoom (pinch on mobile, scroll wheel on desktop)

---

## 📋 Version 0.3.0 — Challenge System

### Mission Mode
- [ ] **Mission 1** — Make the bulb glow (complete a circuit)
- [ ] **Mission 2** — Make the bulb brighter (increase voltage)
- [ ] **Mission 3** — Keep voltage fixed, increase brightness (reduce resistance)
- [ ] **Mission 4** — Use resistance to dim the bulb
- [ ] Mission completion badge + celebration
- [ ] Mission hint system (progressive nudges, not direct answers)
- [ ] Mission progress tracker

---

## 📚 Version 0.4.0 — Learn Tab

### Theory View
- [ ] Learn tab becomes functional (currently placeholder)
- [ ] Interactive concept cards:
  - What is a circuit?
  - What is voltage?
  - What is resistance?
  - What is current?
- [ ] Each card links back to the playground to try it live
- [ ] Ohm's Law revealed progressively after user experiments

---

## 🔌 Version 1.0.0 — Full V1 Launch

### Advanced Circuit Features
- [ ] Multiple bulbs (series and parallel)
- [ ] Multiple batteries
- [ ] Switch component (opens/closes circuit)
- [ ] MCB / fuse component (trips on overload)
- [ ] Series vs parallel circuit visualizer

### Platform
- [ ] Cloudflare Workers deployment
- [ ] Share circuit via URL (serialized state in URL params)
- [ ] Screenshot / export circuit as image
- [ ] Embed mode for teachers (iframe-friendly)

---

## 🌍 Future — Version 2+

### New Subject Modules
- [ ] **Magnetism** — coils, magnetic fields, electromagnets
- [ ] **Optics** — lenses, reflection, refraction
- [ ] **Mechanics** — forces, levers, pulleys
- [ ] **Chemistry** — atoms, molecules, reactions

### Platform Features
- [ ] Teacher dashboard — assign circuits as exercises
- [ ] Student progress tracking (anonymous, no login required)
- [ ] Localization (Hindi, Spanish, French, Mandarin)
- [ ] Accessibility audit + screen reader support

---

## 💡 Backlog (Unscheduled Ideas)

- Live collaboration (two users building the same circuit)
- AI tutor — answers "why?" questions about the circuit
- Real-world component photos (photo mode vs diagram mode)
- Printable circuit diagrams
- Circuit puzzle mode (given a partially built circuit, complete it)
- Arduino/hardware export (export circuit as real component list)

---

*Last updated: 2026-06-24*
