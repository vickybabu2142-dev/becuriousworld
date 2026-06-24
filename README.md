# 🌍 BeCurious World

> **Learn science and engineering through exploration, not memorization.**

An interactive web platform where children, students, and curious adults discover
science concepts by building real interactive systems — no textbook required.

![BeCurious World Screenshot](./file_00000000660872079f2f88f1fb313021.png)

---

## 🎯 Vision

The platform feels like a **toy first, a lesson second**. Users drag components,
connect wires, and watch a bulb glow — discovering Ohm's Law naturally through
experimentation rather than formulas.

> *"Learning through exploration, not memorization."*

---

## ✨ Features (Version 1)

| Feature | Description |
|---|---|
| 🔋 **Drag & Drop Circuit Builder** | Place battery, bulb, and resistor freely on a canvas |
| ⚡ **Wire Drawing** | Click terminals and drag to connect — magnetic snap-to-point |
| 💡 **Live Bulb Glow** | Brightness animates in real time based on Ohm's Law |
| 🎚️ **Voltage Slider** | 1V → 24V, instantly affects brightness |
| 🎚️ **Resistance Slider** | 1Ω → 1kΩ (logarithmic), dims/brightens the bulb |
| 📊 **Live Metrics** | Current (A), Voltage across bulb (V), Power (W) |
| 🌊 **Show Electricity** | Animated particle flow through wires |
| 🎉 **Celebration** | Confetti burst on first circuit completion |
| 💬 **Hover Tooltips** | Wire voltage/current info on hover |
| 🌙 **Dark / Light Mode** | Full theme toggle |
| 📱 **Responsive** | Works on desktop, tablet, and mobile |

---

## 🧠 What Users Learn

1. **A complete circuit is required** for electricity to flow
2. **Increasing voltage** increases current and bulb brightness
3. **Increasing resistance** reduces current and dims the bulb

All without ever seeing `V = I × R` until they're ready.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- npm v9+

### Install & Run

```bash
# Clone the repo
git clone <your-repo-url>
cd becurious-world

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🗂️ Project Structure

```
becurious-world/
├── public/
│   └── favicon.svg               # ⚡ Lightning bolt favicon
├── src/
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Root component + state orchestration
│   ├── store/
│   │   └── circuitStore.ts       # Physics engine, graph logic, state types
│   ├── components/
│   │   ├── Header.tsx            # Top bar: logo, tabs, actions
│   │   ├── Sidebar.tsx           # Draggable component palette
│   │   ├── CircuitCanvas.tsx     # SVG drag-drop canvas + wire drawing
│   │   ├── ControlsPanel.tsx     # Right panel: sliders + metrics
│   │   ├── SVGComponents.tsx     # Battery, Bulb, Resistor SVG illustrations
│   │   └── Footer.tsx            # Educational footer note
│   └── styles/
│       └── index.css             # Design system, CSS variables, animations
├── .agents/
│   ├── AGENTS.md                 # Project-scoped AI agent rules
│   └── skills/
│       └── becurious-world/
│           └── SKILL.md          # Custom AI skill for this project
├── docs/
│   ├── ARCHITECTURE.md           # Technical deep-dive
│   └── ROADMAP.md                # Feature roadmap
├── .gitignore
├── README.md                     # This file
├── CHANGELOG.md                  # Version history
├── CONTRIBUTING.md               # Contribution guide
├── ANTIGRAVITY_REFERENCE.md      # AI agent skills & commands reference
├── v1.md                         # Original product spec
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🎨 Design System

| Token | Value |
|---|---|
| **Font (Display)** | Nunito — playful, rounded, friendly |
| **Font (Body)** | Inter — clean, legible |
| **Brand Primary** | `#6366f1` Indigo |
| **Brand Secondary** | `#f59e0b` Amber |
| **Live Wire** | `#b45309` Brown (real-world electrical convention) |
| **Neutral Wire** | `#3b82f6` Blue (real-world electrical convention) |
| **Canvas BG (Light)** | `#f8fafc` with `#cbd5e1` dot grid |
| **Canvas BG (Dark)** | `#13161f` with `#2a2d3a` dot grid |

---

## 🔬 Physics Engine

Based on **Ohm's Law**: `I = V / R`

```
Total R  = Resistance (slider) + Bulb internal resistance (10Ω)
Current  = Voltage / Total R
V (bulb) = Current × Bulb R
Power    = Current × V (bulb)
Brightness = (Current / Max Current) × 100  [capped at 100%]
```

Circuit completion is detected via **BFS graph traversal** on a node graph
where components are nodes and wires are edges.

---

## 🛠️ Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Rendering | SVG (components + wires) |
| Styling | Vanilla CSS with custom properties |
| State | React `useState` / `useCallback` |
| Hosting | Cloudflare Workers (planned) |

---

## 📍 Roadmap

See [docs/ROADMAP.md](./docs/ROADMAP.md) for the full feature roadmap.

**Next up (V1 polish):**
- [ ] Sound effects (wire click, bulb glow, celebration)
- [ ] Touch / mobile drag support
- [ ] Challenge / mission system (4 missions)
- [ ] Burnout state when voltage is too high

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT © 2026 BeCurious World
