# Contributing to BeCurious World

Thank you for your interest in contributing! This guide will get you up and running quickly.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Philosophy](#project-philosophy)
- [Coding Standards](#coding-standards)
- [Component Guidelines](#component-guidelines)
- [Submitting Changes](#submitting-changes)

---

## Code of Conduct

Be kind, patient, and constructive. This project is built for children learning
science — keep that spirit in everything you write.

---

## Getting Started

```bash
# 1. Fork and clone
git clone https://github.com/your-org/becurious-world.git
cd becurious-world

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev

# 4. Open http://localhost:5173
```

---

## Development Workflow

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # TypeScript check + production build
npm run preview   # Preview production build locally
```

### Branch naming

```
feat/sound-effects
fix/wire-snap-on-mobile
docs/update-architecture
```

---

## Project Philosophy

Before writing any code, internalize these principles from our product vision:

> **"Learning through exploration, not memorization."**

1. **Simplicity first** — every new feature must pass: *"Would an 8-year-old find this confusing?"*
2. **Playground feel** — it should feel like a toy, not engineering software
3. **Progressive disclosure** — hide complexity until the user shows curiosity
4. **Instant feedback** — every interaction should have immediate, satisfying visual response
5. **No formulas by default** — physics values appear in tooltips, never as primary UI

---

## Coding Standards

### TypeScript
- Strict mode is **on** — no `any` types
- Export all types from `src/store/circuitStore.ts`
- Prefer `interface` over `type` for component props
- Always annotate return types on functions

### React
- Functional components only — no class components
- Use `useCallback` for all event handlers passed as props
- Keep components under ~200 lines; split if larger
- One component per file

### CSS
- All styles go in `src/styles/index.css`
- Use **CSS custom properties** from `:root` — never hardcode colors
- Class names use kebab-case (`.component-card`, `.slider-control`)
- All animations defined in `@keyframes` blocks at the bottom of the file
- Dark mode handled exclusively via `[data-theme="dark"]` selector

### File structure
```
src/components/
  MyComponent.tsx       # Component + any sub-components used only here
src/store/
  circuitStore.ts       # All shared state types and pure logic functions
src/styles/
  index.css             # Single CSS file — no CSS modules
```

---

## Component Guidelines

### SVG Components (`SVGComponents.tsx`)
- Use `viewBox` with explicit coordinates — never rely on implicit sizing
- All visual states (on/off/hover) handled via props, not internal state
- Avoid inline `style` — use SVG attributes (`fill`, `stroke`, `opacity`)

### Canvas Component (`CircuitCanvas.tsx`)
- All pointer events handled at the SVG root level (mouse delegation pattern)
- Terminal hit areas must be ≥ 10px radius for touch accessibility
- Wire paths use cubic Bézier curves (`C` command) for smooth routing

### Physics (`circuitStore.ts`)
- `calculateCircuit()` must remain a **pure function** — no side effects
- `isCircuitComplete()` must be deterministic given the same inputs
- Add unit tests for any changes to the physics engine

---

## Submitting Changes

1. **Open an issue first** for non-trivial features — let's align before you build
2. Keep PRs focused — one feature or fix per PR
3. Update `CHANGELOG.md` under `[Unreleased]`
4. Ensure `npm run build` passes before opening a PR
5. Add a short screen recording for any visual changes

### PR title format
```
feat: add sound effects for wire connection
fix: magnetic snap not working on touch devices
docs: add mobile testing guide
```

---

## Questions?

Open a GitHub Discussion or mention it in your PR. We're happy to help!
