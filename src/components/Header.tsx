// ======================================================
// Header Component
// ======================================================
interface HeaderProps {
  isDark: boolean
  onToggleTheme: () => void
  showParticles: boolean
  onToggleParticles: () => void
  onReset: () => void
  activeTab: 'play' | 'learn'
  onTabChange: (tab: 'play' | 'learn') => void
}

export function Header({
  isDark,
  onToggleTheme,
  showParticles,
  onToggleParticles,
  onReset,
  activeTab,
  onTabChange,
}: HeaderProps) {
  return (
    <header className="header" role="banner">
      {/* Logo */}
      <a className="header-logo" href="#" onClick={e => e.preventDefault()} aria-label="BeCurious World Home">
        <div className="header-logo-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.4z" fill="currentColor" />
          </svg>
        </div>
        <div className="header-logo-text">
          <h1>BeCurious World</h1>
          <span>Learn • Explore • Understand</span>
        </div>
      </a>

      {/* Tabs */}
      <nav className="header-tabs" role="tablist" aria-label="Main navigation">
        <button
          id="tab-play"
          className={`header-tab ${activeTab === 'play' ? 'active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'play'}
          aria-controls="panel-play"
          onClick={() => onTabChange('play')}
        >
          <svg className="tab-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" className="play-icon" />
          </svg>
          Play
        </button>
        <button
          id="tab-learn"
          className={`header-tab ${activeTab === 'learn' ? 'active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'learn'}
          aria-controls="panel-learn"
          onClick={() => onTabChange('learn')}
          title="Coming soon!"
        >
          <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          Learn
        </button>
      </nav>

      {/* Actions */}
      <div className="header-actions">
        <button
          id="btn-show-electricity"
          className={`btn btn-electricity ${showParticles ? 'active' : ''}`}
          onClick={onToggleParticles}
          aria-pressed={showParticles}
          title="Toggle current flow animation"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M13 2L4 14h7l-1 8 10-12h-7l1-8z" />
          </svg>
          <span className="btn-label-text">Show Electricity</span>
        </button>

        <button
          id="btn-reset"
          className="btn btn-reset"
          onClick={onReset}
          aria-label="Reset circuit"
          title="Clear the canvas"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span className="btn-label-text">Reset</span>
        </button>

        <button
          id="btn-theme-toggle"
          className="btn btn-theme"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
