interface FooterProps {
  isComplete: boolean
}

export function Footer({ isComplete }: FooterProps) {
  return (
    <footer className="footer" role="contentinfo">
      <span className="footer-icon" aria-hidden="true">ℹ️</span>
      {isComplete ? (
        <p className="footer-text">
          <span className="live">Live wire (brown)</span> carries electricity from the source.{' '}
          <span className="neutral">Neutral wire (blue)</span> provides the return path.
        </p>
      ) : (
        <p className="footer-text">
          Connect a <span className="live">battery</span>, <strong>resistor</strong>, and <strong>bulb</strong> with wires to complete your first circuit!
        </p>
      )}
    </footer>
  )
}
