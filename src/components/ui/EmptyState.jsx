function EmptyState({ message = 'No phones match your filters.', suggestion, onSuggestionClick }) {
  return (
    <div className="empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <p>{message}</p>
      {suggestion && (
        <button
          type="button"
          className="empty-state-suggestion"
          onClick={() => onSuggestionClick?.(suggestion)}
        >
          Did you mean <strong>{suggestion}</strong>?
        </button>
      )}
    </div>
  )
}

export default EmptyState