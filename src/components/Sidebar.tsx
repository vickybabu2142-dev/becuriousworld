import React from 'react'
import { ComponentType, WireType } from '../store/circuitStore'
import { BatteryPreview, BulbPreview, ResistorPreview } from './SVGComponents'

interface SidebarProps {
  onDragStart: (type: ComponentType, e: React.DragEvent) => void
  onAddComponent?: (type: ComponentType) => void
  onTouchDragStart?: (type: ComponentType, e: React.TouchEvent) => void
  selectedWireType: WireType
  onSelectWireType: (type: WireType) => void
  placedComponents: { battery: boolean; bulb: boolean; resistor: boolean }
  isComplete?: boolean
  hasResistorInLoop?: boolean
  className?: string
}

export function Sidebar({
  onDragStart,
  onAddComponent,
  onTouchDragStart,
  selectedWireType,
  onSelectWireType,
  placedComponents,
  isComplete = false,
  hasResistorInLoop = true,
  className = '',
}: SidebarProps) {
  // Warn when circuit is complete but resistor is not in the loop
  const resistorWarning = isComplete && !hasResistorInLoop

  // Helper: build shared touch/click/drag props for a component card
  const cardProps = (type: ComponentType, placed: boolean) => ({
    draggable: !placed,
    onDragStart: (e: React.DragEvent) => !placed && onDragStart(type, e),
    // Tap to add (works on all devices)
    onClick: () => !placed && onAddComponent && onAddComponent(type),
    // Touch drag to specific canvas position (mobile / tablet)
    onTouchStart: (e: React.TouchEvent) => !placed && onTouchDragStart && onTouchDragStart(type, e),
    style: { opacity: placed && !(type === 'resistor' && resistorWarning) ? 0.45 : 1 } as React.CSSProperties,
    'aria-disabled': placed,
  })

  return (
    <aside className={`sidebar ${className}`} aria-label="Component palette">
      <p className="sidebar-section-title">Components</p>

      {/* ── Battery Card ── */}
      <div
        className="component-card"
        {...cardProps('battery', placedComponents.battery)}
        title={placedComponents.battery ? 'Battery already placed' : 'Tap or drag to add battery'}
        role="button"
        aria-label="Battery — tap or drag to canvas"
      >
        <div className="component-card-header">
          <span className="component-card-name">Battery</span>
          {placedComponents.battery && (
            <span style={{ fontSize: 10, color: 'var(--brand-green)', fontWeight: 700 }}>✓ Placed</span>
          )}
        </div>
        <div className="component-card-body">
          <div className="component-preview-wrapper">
            <BatteryPreview />
          </div>
        </div>
      </div>

      {/* ── Wire Section ── */}
      <div className="wire-section">
        <p className="wire-section-title">Wire</p>
        <div
          className={`wire-option ${selectedWireType === 'live' ? 'selected' : ''}`}
          onClick={() => onSelectWireType('live')}
          role="button"
          aria-pressed={selectedWireType === 'live'}
          aria-label="Select live wire (brown)"
          id="wire-live-option"
        >
          <div className="wire-swatch live" aria-hidden="true" />
          <span className="wire-option-label">Live (L)</span>
        </div>
        <div
          className={`wire-option ${selectedWireType === 'neutral' ? 'selected' : ''}`}
          onClick={() => onSelectWireType('neutral')}
          role="button"
          aria-pressed={selectedWireType === 'neutral'}
          aria-label="Select neutral wire (blue)"
          id="wire-neutral-option"
          style={{ marginTop: 4 }}
        >
          <div className="wire-swatch neutral" aria-hidden="true" />
          <span className="wire-option-label">Neutral (N)</span>
        </div>
      </div>

      {/* ── Bulb Card ── */}
      <div
        className="component-card"
        {...cardProps('bulb', placedComponents.bulb)}
        title={placedComponents.bulb ? 'Bulb already placed' : 'Tap or drag to add bulb'}
        role="button"
        aria-label="Bulb — tap or drag to canvas"
      >
        <div className="component-card-header">
          <span className="component-card-name">Bulb</span>
          {placedComponents.bulb && (
            <span style={{ fontSize: 10, color: 'var(--brand-green)', fontWeight: 700 }}>✓ Placed</span>
          )}
        </div>
        <div className="component-card-body">
          <div className="component-preview-wrapper">
            <BulbPreview />
          </div>
        </div>
      </div>

      {/* ── Resistor Card ── */}
      <div
        className={`component-card${resistorWarning ? ' resistor-warning' : ''}`}
        {...cardProps('resistor', placedComponents.resistor && !resistorWarning)}
        title={
          resistorWarning && !placedComponents.resistor
            ? '⚠️ Add resistor to protect the bulb!'
            : resistorWarning && placedComponents.resistor
            ? '⚠️ Connect resistor in the circuit loop!'
            : placedComponents.resistor
            ? 'Resistor already placed'
            : 'Tap or drag to add resistor'
        }
        role="button"
        aria-label="Resistor — tap or drag to canvas"
        aria-live={resistorWarning ? 'assertive' : undefined}
      >
        <div className="component-card-header">
          <span className="component-card-name">Resistor</span>
          {resistorWarning ? (
            <span className="resistor-warning-badge" aria-label="Warning: resistor missing from loop">
              ⚠ {placedComponents.resistor ? 'Bypassed' : 'Missing'}
            </span>
          ) : placedComponents.resistor ? (
            <span style={{ fontSize: 10, color: 'var(--brand-green)', fontWeight: 700 }}>✓ Placed</span>
          ) : null}
        </div>
        <div className="component-card-body">
          <div className="component-preview-wrapper">
            <ResistorPreview />
          </div>
        </div>
        {resistorWarning && (
          <p className="resistor-warning-tip">
            {placedComponents.resistor
              ? 'Wire it into the loop to protect the bulb!'
              : 'Drag to canvas & wire in-loop!'}
          </p>
        )}
      </div>

      {/* Drop zone hint */}
      <div className="sidebar-dropzone" aria-hidden="true">
        <div className="sidebar-dropzone-icon">✋</div>
        <p className="sidebar-dropzone-text">
          Tap or drag components<br />onto the canvas
        </p>
      </div>
    </aside>
  )
}
