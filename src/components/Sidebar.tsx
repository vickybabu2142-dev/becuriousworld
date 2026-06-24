import { ComponentType, WireType } from '../store/circuitStore'
import { BatteryPreview, BulbPreview, ResistorPreview } from './SVGComponents'

interface SidebarProps {
  onDragStart: (type: ComponentType, e: React.DragEvent) => void
  selectedWireType: WireType
  onSelectWireType: (type: WireType) => void
  placedComponents: { battery: boolean; bulb: boolean; resistor: boolean }
}

export function Sidebar({
  onDragStart,
  selectedWireType,
  onSelectWireType,
  placedComponents,
}: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="Component palette">
      <p className="sidebar-section-title">Components</p>

      {/* Battery Card */}
      <div
        className={`component-card ${placedComponents.battery ? 'opacity-50' : ''}`}
        draggable={!placedComponents.battery}
        onDragStart={(e) => !placedComponents.battery && onDragStart('battery', e)}
        title={placedComponents.battery ? 'Battery already placed' : 'Drag to add battery'}
        role="button"
        aria-label="Battery component — drag to canvas"
        style={{ opacity: placedComponents.battery ? 0.45 : 1 }}
      >
        <div className="component-card-header">
          <span className="component-card-name">Battery</span>
          {placedComponents.battery && (
            <span style={{ fontSize: 10, color: 'var(--brand-green)', fontWeight: 700 }}>✓ Placed</span>
          )}
        </div>
        <div className="component-card-body">
          <BatteryPreview />
        </div>
      </div>

      {/* Wire Section */}
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

      {/* Bulb Card */}
      <div
        className="component-card"
        draggable={!placedComponents.bulb}
        onDragStart={(e) => !placedComponents.bulb && onDragStart('bulb', e)}
        title={placedComponents.bulb ? 'Bulb already placed' : 'Drag to add bulb'}
        role="button"
        aria-label="Bulb component — drag to canvas"
        style={{ opacity: placedComponents.bulb ? 0.45 : 1 }}
      >
        <div className="component-card-header">
          <span className="component-card-name">Bulb</span>
          {placedComponents.bulb && (
            <span style={{ fontSize: 10, color: 'var(--brand-green)', fontWeight: 700 }}>✓ Placed</span>
          )}
        </div>
        <div className="component-card-body">
          <BulbPreview />
        </div>
      </div>

      {/* Resistor Card */}
      <div
        className="component-card"
        draggable={!placedComponents.resistor}
        onDragStart={(e) => !placedComponents.resistor && onDragStart('resistor', e)}
        title={placedComponents.resistor ? 'Resistor already placed' : 'Drag to add resistor'}
        role="button"
        aria-label="Resistor component — drag to canvas"
        style={{ opacity: placedComponents.resistor ? 0.45 : 1 }}
      >
        <div className="component-card-header">
          <span className="component-card-name">Resistor</span>
          {placedComponents.resistor && (
            <span style={{ fontSize: 10, color: 'var(--brand-green)', fontWeight: 700 }}>✓ Placed</span>
          )}
        </div>
        <div className="component-card-body">
          <ResistorPreview />
        </div>
      </div>

      {/* Drop zone hint */}
      <div className="sidebar-dropzone" aria-hidden="true">
        <div className="sidebar-dropzone-icon">✋</div>
        <p className="sidebar-dropzone-text">
          Drag components here<br />to build your circuit
        </p>
      </div>
    </aside>
  )
}
