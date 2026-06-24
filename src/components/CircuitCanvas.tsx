import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import {
  PlacedComponent,
  Wire,
  WireType,
  Terminal,
  COMPONENT_SPECS,
} from '../store/circuitStore'
import { BatterySVG, BulbSVG, ResistorSVG } from './SVGComponents'

interface TooltipData {
  x: number
  y: number
  lines: { key: string; val: string }[]
}

interface WireDrawState {
  active: boolean
  fromTerminalId: string | null
  fromCompId: string | null
  fromPos: { x: number; y: number } | null
  currentPos: { x: number; y: number } | null
}

interface CircuitCanvasProps {
  components: PlacedComponent[]
  wires: Wire[]
  isComplete: boolean
  hasResistorInLoop?: boolean
  showParticles: boolean
  selectedWireType: WireType
  voltage: number
  resistance: number
  current: number
  brightness: number
  onDropComponent: (type: string, x: number, y: number) => void
  onMoveComponent: (id: string, x: number, y: number) => void
  onAddWire: (fromId: string, toId: string, wireType: WireType) => void
  onRemoveWire?: (wireId: string) => void
  onRemoveComponent?: (compId: string) => void
}

const SNAP_RADIUS = 32

function getTerminalAbsPos(comp: PlacedComponent, t: Terminal) {
  return { x: comp.x + t.dx, y: comp.y + t.dy }
}

function getWireColor(wt: WireType) {
  return wt === 'live' ? '#b45309' : '#3b82f6'
}

function getWireGlowColor(wt: WireType) {
  return wt === 'live' ? '#f97316' : '#60a5fa'
}

function getTerminalSpec(id: string | null) {
  if (!id) return { dx: 0, dy: 0, dir: 'H' as const };
  if (id.endsWith('-pos')) return { dx: 0, dy: -30, dir: 'V' as const };
  if (id.endsWith('-neg')) return { dx: 0, dy: 30, dir: 'V' as const };
  if (id.endsWith('-left')) return { dx: -30, dy: 0, dir: 'H' as const };
  if (id.endsWith('-right')) return { dx: 30, dy: 0, dir: 'H' as const };
  if (id.endsWith('-a')) return { dx: -30, dy: 0, dir: 'H' as const }; // Bulb left terminal exits LEFT
  if (id.endsWith('-b')) return { dx: 30, dy: 0, dir: 'H' as const };  // Bulb right terminal exits RIGHT
  return { dx: 0, dy: 0, dir: 'H' as const };
}

function shouldSwapEndpoints(fromId: string, toId: string) {
  if (toId.endsWith('-pos')) return true;
  if (fromId.endsWith('-neg')) return true;
  if (fromId.includes('bulb') && toId.includes('resistor')) return true;
  return false;
}

function buildRoundedPath(points: { x: number; y: number }[], radius: number) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const d1x = curr.x - prev.x;
    const d1y = curr.y - prev.y;
    const len1 = Math.hypot(d1x, d1y);

    const d2x = next.x - curr.x;
    const d2y = next.y - curr.y;
    const len2 = Math.hypot(d2x, d2y);

    // Capped corner radius is at most half of the adjacent segment lengths
    const r = Math.min(radius, len1 / 2, len2 / 2);

    if (r > 0) {
      // Start of curve segment
      const startX = curr.x - (d1x / len1) * r;
      const startY = curr.y - (d1y / len1) * r;

      // End of curve segment
      const endX = curr.x + (d2x / len2) * r;
      const endY = curr.y + (d2y / len2) * r;

      // Line to curve start, then quadratic Bezier curve around the corner
      path += ` L ${startX.toFixed(1)} ${startY.toFixed(1)} Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`;
    } else {
      path += ` L ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
    }
  }

  const last = points[points.length - 1];
  path += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;

  return path;
}

function buildPath(
  a: { x: number; y: number },
  b: { x: number; y: number },
  wireType: WireType,
  fromTerminalId: string | null,
  toTerminalId: string | null
) {
  const spec1 = getTerminalSpec(fromTerminalId)
  const spec2 = getTerminalSpec(toTerminalId)

  // Exit points after lead wires
  const p1 = { x: a.x + spec1.dx, y: a.y + spec1.dy }
  const p2 = { x: b.x + spec2.dx, y: b.y + spec2.dy }

  const points = [a]

  // Add initial exit lead point if it exists
  if (spec1.dx !== 0 || spec1.dy !== 0) {
    points.push(p1)
  }

  // Orthogonal routing logic without overlapping offsets
  if (spec1.dir === 'V' && spec2.dir === 'V') {
    const my = (p1.y + p2.y) / 2
    points.push({ x: p1.x, y: my })
    points.push({ x: p2.x, y: my })
  } else if (spec1.dir === 'H' && spec2.dir === 'H') {
    const mx = (p1.x + p2.x) / 2
    points.push({ x: mx, y: p1.y })
    points.push({ x: mx, y: p2.y })
  } else if (spec1.dir === 'V' && spec2.dir === 'H') {
    points.push({ x: p2.x, y: p1.y })
  } else {
    // spec1.dir === 'H' && spec2.dir === 'V'
    points.push({ x: p1.x, y: p2.y })
  }

  // Add final exit lead point if it exists
  if (spec2.dx !== 0 || spec2.dy !== 0) {
    points.push(p2)
  }

  points.push(b)

  // Generate rounded orthogonal path with 16px corner radius
  return buildRoundedPath(points, 16)
}

export function CircuitCanvas({
  components,
  wires,
  isComplete,
  hasResistorInLoop = false,
  showParticles,
  selectedWireType,
  voltage,
  resistance,
  current,
  brightness,
  onDropComponent,
  onMoveComponent,
  onAddWire,
  onRemoveWire,
  onRemoveComponent,
}: CircuitCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [hoveredWire, setHoveredWire] = useState<string | null>(null)
  const [hoveredComp, setHoveredComp] = useState<string | null>(null)
  const [hoveredTerminal, setHoveredTerminal] = useState<string | null>(null)

  const CANVAS_WIDTH = 1400
  const CANVAS_HEIGHT = 800


  // Calculate path-based terminal order to orient wires correctly along current flow
  const terminalPath = useMemo(() => {
    if (!isComplete) return null

    const battery = components.find(c => c.type === 'battery')
    if (!battery) return null
    const posTerminal = battery.terminals.find(t => t.label === 'pos')
    const negTerminal = battery.terminals.find(t => t.label === 'neg')
    if (!posTerminal || !negTerminal) return null

    const adj = new Map<string, string[]>()
    wires.forEach(w => {
      if (!adj.has(w.fromTerminalId)) adj.set(w.fromTerminalId, [])
      if (!adj.has(w.toTerminalId)) adj.set(w.toTerminalId, [])
      adj.get(w.fromTerminalId)!.push(w.toTerminalId)
      adj.get(w.toTerminalId)!.push(w.fromTerminalId)
    })

    components.forEach(comp => {
      if (comp.type === 'battery') return
      comp.terminals.forEach(t1 => {
        comp.terminals.forEach(t2 => {
          if (t1.id !== t2.id) {
            if (!adj.has(t1.id)) adj.set(t1.id, [])
            adj.get(t1.id)!.push(t2.id)
          }
        })
      })
    })

    const queue: string[][] = [[posTerminal.id]]
    const visited = new Set<string>([posTerminal.id])

    while (queue.length > 0) {
      const path = queue.shift()!
      const curr = path[path.length - 1]
      if (curr === negTerminal.id) {
        return path
      }
      const neighbors = adj.get(curr) || []
      for (const next of neighbors) {
        if (!visited.has(next)) {
          visited.add(next)
          queue.push([...path, next])
        }
      }
    }
    return null
  }, [components, wires, isComplete])

  // ── REF-based drag state (avoids ALL stale closure bugs) ──────────────
  // Using refs means we always read the latest value in event handlers
  // without needing to re-create them on every state change.
  const dragRef = useRef<{ id: string; offX: number; offY: number } | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null) // only for re-render

  const wireRef = useRef<WireDrawState>({
    active: false, fromTerminalId: null, fromCompId: null, fromPos: null, currentPos: null,
  })
  const [wirePreview, setWirePreview] = useState<{
    fromPos: { x: number; y: number }
    currentPos: { x: number; y: number }
    snappedTerminalId: string | null
  } | null>(null)

  // ── Delete Overlay State ─────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'component' | 'wire'; x: number; y: number } | null>(null)
  const lastTouchRef = useRef<{ id: string; time: number } | null>(null)

  // ── Zoom State ──────────────────────────────────────────────────────
  const [zoom, setZoom] = useState(1.0)

  // ── Zoom-to-fit utility ──────────────────────────────────────────────
  const handleZoomToFit = useCallback(() => {
    const parent = svgRef.current?.parentElement
    if (!parent) return
    const r = parent.getBoundingClientRect()

    // Calculate bounding box of placed components
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity

    if (components.length === 0) {
      // Default bounding region centered in 1400x800 canvas
      minX = 300
      maxX = 1100
      minY = 200
      maxY = 600
    } else {
      components.forEach(comp => {
        const spec = COMPONENT_SPECS[comp.type]
        const left = comp.x - spec.width / 2
        const right = comp.x + spec.width / 2
        const top = comp.y - spec.height / 2
        const bottom = comp.y + spec.height / 2
        if (left < minX) minX = left
        if (right > maxX) maxX = right
        if (top < minY) minY = top
        if (bottom > maxY) maxY = bottom
      })
      // Add safe padding around components (e.g. 80px)
      const padding = 80
      minX -= padding
      maxX += padding
      minY -= padding
      maxY += padding
    }

    const contentWidth = maxX - minX
    const contentHeight = maxY - minY

    // Calculate optimal zoom factor to fit content within parent bounds
    const zoomX = r.width / contentWidth
    const zoomY = r.height / contentHeight
    const newZoom = Math.min(zoomX, zoomY, 1.2) // cap at 1.2 max zoom
    const finalZoom = Math.max(0.4, Number(newZoom.toFixed(2))) // floor at 0.4

    setZoom(finalZoom)

    // Programmatically scroll the parent container to center content
    setTimeout(() => {
      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2
      parent.scrollLeft = centerX * finalZoom - r.width / 2
      parent.scrollTop = centerY * finalZoom - r.height / 2
    }, 50)
  }, [components])

  // Run zoom-to-fit initially and on resize only on mobile/tablet (<= 768px)
  useEffect(() => {
    const isMobile = window.innerWidth <= 768
    if (isMobile) {
      handleZoomToFit()
    } else {
      setZoom(1.0)
    }
    
    // Give it a tiny delay to ensure client container layout has settled
    const timer = setTimeout(() => {
      if (window.innerWidth <= 768) {
        handleZoomToFit()
      }
    }, 100)

    const handleResize = () => {
      if (window.innerWidth <= 768) {
        handleZoomToFit()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [handleZoomToFit])

  // ── SVG coordinate conversion ─────────────────────────────────────────
  const clientToSVG = useCallback((cx: number, cy: number) => {
    if (!svgRef.current) return { x: 0, y: 0 }
    const pt = svgRef.current.createSVGPoint()
    pt.x = cx
    pt.y = cy
    const ctm = svgRef.current.getScreenCTM()
    if (ctm) {
      const svgP = pt.matrixTransform(ctm.inverse())
      return { x: svgP.x, y: svgP.y }
    }
    // Fallback if CTM is not ready
    const r = svgRef.current.getBoundingClientRect()
    const currentZoom = r.width / CANVAS_WIDTH
    return {
      x: (cx - r.left) / currentZoom,
      y: (cy - r.top) / currentZoom
    }
  }, [])

  // ── Terminal lookup helpers ───────────────────────────────────────────
  const terminalPos = useCallback((id: string) => {
    for (const comp of components) {
      const t = comp.terminals.find(t => t.id === id)
      if (t) return getTerminalAbsPos(comp, t)
    }
    return null
  }, [components])

  const isTerminalConnected = useCallback((id: string) =>
    wires.some(w => w.fromTerminalId === id || w.toTerminalId === id),
  [wires])

  const findNearbyTerminal = useCallback((pos: { x: number; y: number }, excludeCompId: string | null) => {
    let closest: Terminal | null = null
    let minDist = SNAP_RADIUS
    for (const comp of components) {
      if (comp.id === excludeCompId) continue
      for (const t of comp.terminals) {
        const abs = getTerminalAbsPos(comp, t)
        const dist = Math.hypot(abs.x - pos.x, abs.y - pos.y)
        if (dist < minDist) { minDist = dist; closest = t }
      }
    }
    return closest
  }, [components])

  // ── Component Drag Mouse / Touch Handlers ───────────────────────────
  const handleCompMouseDown = useCallback((e: React.MouseEvent, comp: PlacedComponent) => {
    if (e.button !== 0) return
    if (wireRef.current.active) return
    e.stopPropagation()
    e.preventDefault()
    setDeleteTarget(null)
    const pos = clientToSVG(e.clientX, e.clientY)
    dragRef.current = { id: comp.id, offX: pos.x - comp.x, offY: pos.y - comp.y }
    setDraggingId(comp.id)
  }, [clientToSVG])

  const handleCompTouchStart = useCallback((e: React.TouchEvent, comp: PlacedComponent) => {
    if (wireRef.current.active) return
    e.stopPropagation()
    const now = Date.now()
    const lastTouch = lastTouchRef.current
    const touch = e.touches[0]
    const pos = clientToSVG(touch.clientX, touch.clientY)

    if (lastTouch && lastTouch.id === comp.id && (now - lastTouch.time) < 300) {
      setDeleteTarget({ id: comp.id, type: 'component', x: pos.x, y: pos.y })
      lastTouchRef.current = null
      return
    }
    lastTouchRef.current = { id: comp.id, time: now }

    setDeleteTarget(null)
    dragRef.current = { id: comp.id, offX: pos.x - comp.x, offY: pos.y - comp.y }
    setDraggingId(comp.id)
  }, [clientToSVG])

  // ── Terminal Mouse / Touch Handlers ───────────────────────────────────
  const handleTerminalMouseDown = useCallback((
    e: React.MouseEvent,
    terminal: Terminal,
    comp: PlacedComponent,
  ) => {
    if (e.button !== 0) return
    e.stopPropagation()
    e.preventDefault()
    setDeleteTarget(null)
    const abs = getTerminalAbsPos(comp, terminal)
    wireRef.current = {
      active: true,
      fromTerminalId: terminal.id,
      fromCompId: comp.id,
      fromPos: abs,
      currentPos: abs,
    }
    setWirePreview({ fromPos: abs, currentPos: abs, snappedTerminalId: null })
  }, [])

  const handleTerminalTouchStart = useCallback((
    e: React.TouchEvent,
    terminal: Terminal,
    comp: PlacedComponent,
  ) => {
    e.stopPropagation()
    setDeleteTarget(null)
    const touch = e.touches[0]
    const abs = getTerminalAbsPos(comp, terminal)
    wireRef.current = {
      active: true,
      fromTerminalId: terminal.id,
      fromCompId: comp.id,
      fromPos: abs,
      currentPos: abs,
    }
    setWirePreview({ fromPos: abs, currentPos: abs, snappedTerminalId: null })
  }, [])

  // ── Window-level events (mouse & touch) ──────────────────────────────
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const pos = clientToSVG(e.clientX, e.clientY)

      // 1. Component drag
      if (dragRef.current) {
        const nx = pos.x - dragRef.current.offX
        const ny = pos.y - dragRef.current.offY
        onMoveComponent(dragRef.current.id, nx, ny)
        return
      }

      // 2. Wire drawing
      if (wireRef.current.active && wireRef.current.fromPos) {
        const nearby = findNearbyTerminal(pos, wireRef.current.fromCompId)
        wireRef.current.currentPos = pos
        setHoveredTerminal(nearby ? nearby.id : null)
        setWirePreview({
          fromPos: wireRef.current.fromPos,
          currentPos: pos,
          snappedTerminalId: nearby ? nearby.id : null,
        })
        return
      }
    }

    const onMouseUp = (e: MouseEvent) => {
      // Finish component drag
      if (dragRef.current) {
        dragRef.current = null
        setDraggingId(null)
        setHoveredComp(null)
        return
      }

      // Finish wire draw
      if (wireRef.current.active && wireRef.current.fromTerminalId) {
        const pos = clientToSVG(e.clientX, e.clientY)
        const nearby = findNearbyTerminal(pos, wireRef.current.fromCompId)
        if (nearby && nearby.id !== wireRef.current.fromTerminalId) {
          onAddWire(wireRef.current.fromTerminalId, nearby.id, selectedWireType)
        }
        wireRef.current = { active: false, fromTerminalId: null, fromCompId: null, fromPos: null, currentPos: null }
        setWirePreview(null)
        setHoveredTerminal(null)
        return
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return
      const touch = e.touches[0]
      const pos = clientToSVG(touch.clientX, touch.clientY)

      // 1. Component drag
      if (dragRef.current) {
        if (e.cancelable) e.preventDefault()
        const nx = pos.x - dragRef.current.offX
        const ny = pos.y - dragRef.current.offY
        onMoveComponent(dragRef.current.id, nx, ny)
        return
      }

      // 2. Wire drawing
      if (wireRef.current.active && wireRef.current.fromPos) {
        if (e.cancelable) e.preventDefault()
        const nearby = findNearbyTerminal(pos, wireRef.current.fromCompId)
        wireRef.current.currentPos = pos
        setHoveredTerminal(nearby ? nearby.id : null)
        setWirePreview({
          fromPos: wireRef.current.fromPos,
          currentPos: pos,
          snappedTerminalId: nearby ? nearby.id : null,
        })
        return
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      // Finish component drag
      if (dragRef.current) {
        dragRef.current = null
        setDraggingId(null)
        setHoveredComp(null)
        return
      }

      // Finish wire draw
      if (wireRef.current.active && wireRef.current.fromTerminalId) {
        const touch = e.changedTouches[0]
        const pos = clientToSVG(touch.clientX, touch.clientY)
        const nearby = findNearbyTerminal(pos, wireRef.current.fromCompId)
        if (nearby && nearby.id !== wireRef.current.fromTerminalId) {
          onAddWire(wireRef.current.fromTerminalId, nearby.id, selectedWireType)
        }
        wireRef.current = { active: false, fromTerminalId: null, fromCompId: null, fromPos: null, currentPos: null }
        setWirePreview(null)
        setHoveredTerminal(null)
        return
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [clientToSVG, onMoveComponent, onAddWire, findNearbyTerminal, selectedWireType])

  // ── Sidebar drop ─────────────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent<SVGSVGElement>) => {
    e.preventDefault()
    setDeleteTarget(null)
    const type = e.dataTransfer.getData('componentType')
    if (!type) return
    const pos = clientToSVG(e.clientX, e.clientY)
    onDropComponent(type, pos.x, pos.y)
  }, [clientToSVG, onDropComponent])

  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault()
    const zoomFactor = 1.05
    const nextZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor
    const cappedZoom = Math.min(2.0, Math.max(0.4, nextZoom))
    setZoom(Number(cappedZoom.toFixed(2)))
  }, [zoom])

  const circuitReady =
    components.some(c => c.type === 'battery') &&
    components.some(c => c.type === 'bulb') &&
    wires.length >= 2

  const showInstructions = components.length === 0
  const isDrawingWire = wirePreview !== null

  return (
    <div className="canvas-wrapper">
      {/* ── Instruction Banner ── */}
      {showInstructions && (
        <div className="canvas-instruction" aria-live="polite">
          <span style={{ color: 'var(--brand-green)' }}>⚡</span>
          Drag or tap components from the left panel to begin
        </div>
      )}
      {!showInstructions && !isComplete && (
        <div className="canvas-instruction" aria-live="polite">
          <span>🔗</span>
          Drag terminals to draw wires. Drag background to pan.
        </div>
      )}

      {/* ── Zoom Controls ── */}
      <div className="canvas-zoom-controls" aria-label="Zoom controls">
        <button className="zoom-btn zoom-fit-btn" onClick={handleZoomToFit} aria-label="Zoom to fit">Fit</button>
        <div className="zoom-divider" />
        <button className="zoom-btn" onClick={() => setZoom(z => Math.max(0.4, Number((z - 0.1).toFixed(2))))} aria-label="Zoom out">−</button>
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        <button className="zoom-btn" onClick={() => setZoom(z => Math.min(2.0, Number((z + 0.1).toFixed(2))))} aria-label="Zoom in">+</button>
      </div>

      {/* ── SVG Canvas ── */}
      <svg
        ref={svgRef}
        className="circuit-canvas"
        width={CANVAS_WIDTH * zoom}
        height={CANVAS_HEIGHT * zoom}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        style={{ cursor: draggingId ? 'grabbing' : isDrawingWire ? 'crosshair' : 'default' }}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onMouseDown={e => e.preventDefault()}
        onWheel={handleWheel}
        aria-label="Circuit board canvas"
        role="application"
      >
        <defs>
          <filter id="wire-glow-live" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="wire-glow-neutral" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <pattern id="canvas-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="14" cy="14" r="1.5" fill="var(--bg-canvas-dot)" />
          </pattern>
        </defs>

        {/* Board content group (native coordinates 0 to 1400 / 0 to 800) */}
        <g>
          {/* Background grid listener */}
          <rect
            className="canvas-background"
            x="0"
            y="0"
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            fill="url(#canvas-grid)"
            style={{ pointerEvents: 'all' }}
            onClick={() => setDeleteTarget(null)}
          />

          {/* ── Wires ── */}
          {wires.map(wire => {
            // Determine path direction (from positive battery terminal to negative battery terminal)
            // so particle flow direction always follows current flow.
            let swap = false
            if (terminalPath) {
              const idxFrom = terminalPath.indexOf(wire.fromTerminalId)
              const idxTo = terminalPath.indexOf(wire.toTerminalId)
              if (idxFrom !== -1 && idxTo !== -1) {
                swap = idxFrom > idxTo
              } else {
                swap = shouldSwapEndpoints(wire.fromTerminalId, wire.toTerminalId)
              }
            } else {
              swap = shouldSwapEndpoints(wire.fromTerminalId, wire.toTerminalId)
            }
            const actualFromId = swap ? wire.toTerminalId : wire.fromTerminalId
            const actualToId = swap ? wire.fromTerminalId : wire.toTerminalId

            const from = terminalPos(actualFromId)
            const to   = terminalPos(actualToId)
            if (!from || !to) return null
            const color = getWireColor(wire.wireType)
            const glowColor = getWireGlowColor(wire.wireType)
            const path = buildPath(from, to, wire.wireType, actualFromId, actualToId)
            const active = isComplete
            const isHov = hoveredWire === wire.id

            return (
              <g key={wire.id} style={{ cursor: 'pointer' }}>
                {/* Invisible fat hit area */}
                <path d={path} stroke="transparent" strokeWidth="18" fill="none"
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    const pos = clientToSVG(e.clientX, e.clientY)
                    setDeleteTarget({ id: wire.id, type: 'wire', x: pos.x, y: pos.y })
                    setTooltip(null)
                  }}
                  onTouchStart={(e) => {
                    const now = Date.now()
                    const lastTouch = lastTouchRef.current
                    const touch = e.touches[0]
                    const pos = clientToSVG(touch.clientX, touch.clientY)
                    if (lastTouch && lastTouch.id === wire.id && (now - lastTouch.time) < 300) {
                      e.stopPropagation()
                      setDeleteTarget({ id: wire.id, type: 'wire', x: pos.x, y: pos.y })
                      lastTouchRef.current = null
                      return
                    }
                    lastTouchRef.current = { id: wire.id, time: now }
                  }}
                  onMouseEnter={e => {
                    setHoveredWire(wire.id)
                    const lines = [
                      { key: 'Wire', val: wire.wireType === 'live' ? 'Live (Brown)' : 'Neutral (Blue)' }
                    ]
                    if (isComplete) {
                      lines.push({ key: 'Voltage', val: `${voltage} V` })
                      lines.push({ key: 'Current', val: `${current.toFixed(3)} A` })
                    }
                    lines.push({ key: 'Tip', val: 'Double-click/tap to delete' })
                    setTooltip({
                      x: e.clientX, y: e.clientY,
                      lines
                    })
                  }}
                  onMouseLeave={() => { setHoveredWire(null); setTooltip(null) }}
                />
                {/* Glow halo */}
                {active && (
                  <path d={path} stroke={glowColor} strokeWidth="7" fill="none"
                    opacity={0.28} strokeLinecap="round" strokeLinejoin="round"
                    filter={`url(#wire-glow-${wire.wireType === 'live' ? 'live' : 'neutral'})`}
                  />
                )}
                {/* Main wire */}
                <path d={path} stroke={color}
                  strokeWidth={isHov ? 4.5 : active ? 4 : 3}
                  fill="none" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transition: 'stroke-width 0.12s ease', pointerEvents: 'none' }}
                />
                {/* Particles */}
                {showParticles && active && (
                  <path d={path} stroke="rgba(255,255,255,0.8)" strokeWidth="2"
                    fill="none" strokeLinecap="round" strokeLinejoin="round" className="particle-wire"
                    style={{ pointerEvents: 'none' }}
                  />
                )}
              </g>
            )
          })}

          {/* ── Live wire preview ── */}
          {wirePreview && wirePreview.fromPos && (() => {
            const snapPos = wirePreview.snappedTerminalId
              ? terminalPos(wirePreview.snappedTerminalId)
              : null
            const toPos = snapPos || wirePreview.currentPos
            const color = getWireColor(selectedWireType)
            const path  = buildPath(wirePreview.fromPos, toPos, selectedWireType, wireRef.current.fromTerminalId, wirePreview.snappedTerminalId)
            return (
              <g style={{ pointerEvents: 'none' }}>
                <path d={path} stroke={color} strokeWidth="6"
                  fill="none" opacity={0.1} strokeLinecap="round" strokeLinejoin="round" />
                <path d={path} stroke={color} strokeWidth="2.5"
                  fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 6" opacity={0.9} />
                {snapPos && (
                  <circle cx={snapPos.x} cy={snapPos.y} r={14}
                    fill="rgba(99,102,241,0.12)"
                    stroke="rgba(99,102,241,0.55)"
                    strokeWidth="2" strokeDasharray="5 3"
                  />
                )}
              </g>
            )
          })()}

          {/* ── Components ── */}
          {components.map(comp => {
            const spec = COMPONENT_SPECS[comp.type]
            const isDragging = draggingId === comp.id
            const isHovered  = hoveredComp === comp.id && !draggingId && !isDrawingWire

            return (
              <g
                key={comp.id}
                transform={`translate(${comp.x}, ${comp.y})`}
                style={{
                  cursor: isDragging ? 'grabbing' : 'grab',
                  filter: isDragging
                    ? 'drop-shadow(0 10px 24px rgba(0,0,0,0.28))'
                    : isHovered
                    ? 'drop-shadow(0 4px 10px rgba(99,102,241,0.25))'
                    : 'drop-shadow(0 2px 5px rgba(0,0,0,0.08))',
                  transition: isDragging ? 'none' : 'filter 0.2s ease',
                }}
                onMouseDown={e => handleCompMouseDown(e, comp)}
                onTouchStart={e => handleCompTouchStart(e, comp)}
                onDoubleClick={e => {
                  e.stopPropagation()
                  const pos = clientToSVG(e.clientX, e.clientY)
                  setDeleteTarget({ id: comp.id, type: 'component', x: pos.x, y: pos.y })
                }}
                onMouseEnter={() => { if (!draggingId && !isDrawingWire) setHoveredComp(comp.id) }}
                onMouseLeave={() => setHoveredComp(null)}
              >
                {/* Ground shadow */}
                <ellipse
                  cx={2} cy={spec.height / 2 + 4}
                  rx={spec.width / 2 - 6} ry={5}
                  fill="rgba(0,0,0,0.1)"
                  style={{ filter: 'blur(3px)', pointerEvents: 'none' }}
                />

                {/* Hover ring */}
                {isHovered && (
                  <rect
                    x={-spec.width / 2 - 10} y={-spec.height / 2 - 10}
                    width={spec.width + 20} height={spec.height + 20}
                    rx={14} fill="none"
                    stroke="rgba(99,102,241,0.4)"
                    strokeWidth="1.5" strokeDasharray="6 4"
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                {/* Component SVG body */}
                <g transform="scale(1.0)" style={{ pointerEvents: 'auto' }} draggable="false">
                  {comp.type === 'battery' && (
                    <g transform="translate(-40,-68)">
                      <BatterySVG voltage={voltage} />
                    </g>
                  )}
                  {comp.type === 'bulb' && (
                    <g transform="translate(-44,-62)">
                      <BulbSVG brightness={brightness} />
                    </g>
                  )}
                  {comp.type === 'resistor' && (
                    <g transform="translate(-68,-22)">
                      <ResistorSVG resistance={resistance} />
                    </g>
                  )}
                </g>

                {/* Terminals */}
                {comp.terminals.map(terminal => {
                  const connected = isTerminalConnected(terminal.id)
                  const isHovT    = hoveredTerminal === terminal.id
                  const isFrom    = wireRef.current.fromTerminalId === terminal.id

                  let fill = '#94a3b8'
                  if (connected) fill = '#22c55e'
                  if (isHovT)    fill = '#818cf8'
                  if (isFrom)    fill = '#f59e0b'

                  return (
                    <g key={terminal.id}>
                      {/* Snap zone */}
                      {isDrawingWire && !isFrom && (
                        <circle cx={terminal.dx} cy={terminal.dy} r={SNAP_RADIUS}
                          fill={isHovT ? 'rgba(99,102,241,0.1)' : 'transparent'}
                          stroke={isHovT ? 'rgba(99,102,241,0.45)' : 'rgba(148,163,184,0.2)'}
                          strokeWidth="1.5" strokeDasharray="4 3"
                          style={{ cursor: 'crosshair' }}
                          onMouseEnter={() => setHoveredTerminal(terminal.id)}
                          onMouseLeave={() => setHoveredTerminal(null)}
                        />
                      )}

                      {/* Terminal dot */}
                      <circle
                        cx={terminal.dx} cy={terminal.dy}
                        r={isHovT || isFrom ? 8 : connected ? 6 : 5.5}
                        fill={fill}
                        stroke="white" strokeWidth="2"
                        style={{
                          cursor: 'crosshair',
                          transition: 'r 0.1s ease, fill 0.12s ease',
                          filter: isFrom
                            ? 'drop-shadow(0 0 5px rgba(245,158,11,0.9))'
                            : isHovT
                            ? 'drop-shadow(0 0 5px rgba(129,140,248,0.8))'
                            : 'none',
                        }}
                        onMouseDown={e => handleTerminalMouseDown(e, terminal, comp)}
                        onTouchStart={e => handleTerminalTouchStart(e, terminal, comp)}
                        onMouseEnter={() => setHoveredTerminal(terminal.id)}
                        onMouseLeave={() => setHoveredTerminal(null)}
                      />

                      {/* Terminal label */}
                      <text
                        x={terminal.dx}
                        y={terminal.dy}
                        dx={terminal.label === 'left' ? -14 : terminal.label === 'right' ? 14 : 0}
                        dy={terminal.label === 'pos' ? -12 : terminal.label === 'neg' ? 16 : 0}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize="10" fontWeight="700"
                        fill="var(--text-muted)"
                        fontFamily="Inter, sans-serif"
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {terminal.label === 'pos' ? '+'
                          : terminal.label === 'neg' ? '−'
                          : terminal.label === 'a' ? 'A'
                          : terminal.label === 'b' ? 'B'
                          : terminal.label.toUpperCase()}
                      </text>
                    </g>
                  )
                })}
              </g>
            )
          })}
          {/* ── Floating Delete Overlay ── */}
          {deleteTarget && (
            <g
              transform={`translate(${deleteTarget.x}, ${deleteTarget.y})`}
              style={{ cursor: 'pointer', pointerEvents: 'all' }}
              onClick={(e) => {
                e.stopPropagation()
                if (deleteTarget.type === 'component') {
                  onRemoveComponent?.(deleteTarget.id)
                } else {
                  onRemoveWire?.(deleteTarget.id)
                }
                setDeleteTarget(null)
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <circle cx="0" cy="0" r="18" fill="var(--bg-surface)" stroke="#ef4444" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 4px 12px rgba(239, 68, 68, 0.35))' }} />
              <g transform="translate(-9, -9)" className="delete-icon-svg" style={{ pointerEvents: 'none' }}>
                <path d="M6 5V3A1.5 1.5 0 0 1 7.5 1.5h3A1.5 1.5 0 0 1 12 3v2" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="2.5" y1="5" x2="15.5" y2="5" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M4.2 5l1 10.5A1.5 1.5 0 0 0 6.7 17h4.6a1.5 1.5 0 0 0 1.5-1.5l1-10.5" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="7.2" y1="8" x2="7.2" y2="13.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="10.8" y1="8" x2="10.8" y2="13.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            </g>
          )}
        </g>
      </svg>

      {/* ── Tooltip ── */}
      {tooltip && (
        <div className="tooltip"
          style={{ left: tooltip.x + 14, top: tooltip.y - 8 }}
          role="tooltip" aria-hidden="true"
        >
          {tooltip.lines.map(l => (
            <div key={l.key} className="tooltip-line">
              <span className="tooltip-key">{l.key}</span>
              <span className="tooltip-val">{l.val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
