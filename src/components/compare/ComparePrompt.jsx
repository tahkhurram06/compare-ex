function ComparePrompt({ onBrowse }) {
  return (
    <div className="compare-prompt">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="7" height="16" rx="1.5" />
        <rect x="14" y="4" width="7" height="16" rx="1.5" />
        <path d="M10 12h4" />
      </svg>
      <p>Please select two or three phones you want to compare.</p>
      <button type="button" className="compare-prompt-browse" onClick={onBrowse}>
        Browse phones
      </button>
    </div>
  )
}

export default ComparePrompt