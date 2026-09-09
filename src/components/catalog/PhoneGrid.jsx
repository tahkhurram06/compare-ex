import { useEffect, useRef } from 'react'
import PhoneCard from './PhoneCard'
import EmptyState from '../ui/EmptyState'

// Approximates the grid's current column count from CSS breakpoints so
// arrow-up/down can jump a full row instead of just one card.
function getColumnCount() {
  const w = window.innerWidth
  if (w <= 480) return 1
  if (w <= 760) return 2
  if (w <= 1024) return 3
  return 4
}

function PhoneGrid({
  phones,
  onSelect,
  onImageClick,
  searchQuery,
  searchSuggestion,
  onSuggestionClick,
  compareIds,
  onToggleCompare,
}) {
  const cardRefs = useRef([])

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, phones.length)
  }, [phones.length])

  const handleKeyDown = (e, index) => {
    const arrowKeys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown']
    if (!arrowKeys.includes(e.key)) return

    const cols = getColumnCount()
    let nextIndex = index

    if (e.key === 'ArrowRight') nextIndex = index + 1
    if (e.key === 'ArrowLeft') nextIndex = index - 1
    if (e.key === 'ArrowDown') nextIndex = index + cols
    if (e.key === 'ArrowUp') nextIndex = index - cols

    if (nextIndex >= 0 && nextIndex < phones.length) {
      e.preventDefault()
      cardRefs.current[nextIndex]?.focus()
    }
  }

  if (phones.length === 0) {
    return (
      <EmptyState
        message={
          searchQuery
            ? `No phones match "${searchQuery}".`
            : 'No phones match your filters.'
        }
        suggestion={searchSuggestion}
        onSuggestionClick={onSuggestionClick}
      />
    )
  }

  return (
    <div className="browse-grid">
      {phones.map((phone, index) => (
        <div key={phone.id} onKeyDown={(e) => handleKeyDown(e, index)}>
          <PhoneCard
            phone={phone}
            onSelect={onSelect}
            onImageClick={onImageClick}
            isComparing={compareIds?.includes(phone.id)}
            compareFull={compareIds?.length >= 3}
            onToggleCompare={onToggleCompare}
            cardRef={(el) => (cardRefs.current[index] = el)}
          />
        </div>
      ))}
    </div>
  )
}

export default PhoneGrid