import { useState } from 'react'
import Badge from '../ui/Badge'
import { getPhoneImage } from '../../utils/phoneImages'
import { formatStorageOptions } from '../../utils/format'
import { useColorRotation } from '../../hooks/useColorRotation'

function PhoneCard({ phone, onSelect, onImageClick, isComparing, compareFull, onToggleCompare, cardRef }) {
  const colors = phone.colors || []
  const hasColors = colors.length > 0
  const { activeIndex, goToColor, setIsPaused } = useColorRotation(colors.length, phone.id)
  const [loadedImages, setLoadedImages] = useState(() => new Set())

  const markLoaded = (filename) => {
    setLoadedImages((prev) => {
      if (prev.has(filename)) return prev
      const next = new Set(prev)
      next.add(filename)
      return next
    })
  }

  const activeImageLoaded = hasColors && loadedImages.has(colors[activeIndex].image)

  return (
    <div
      ref={cardRef}
      className={`phone-card ${isComparing ? 'selected' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(phone)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect?.(phone)
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <button
        type="button"
        className="add-btn card-compare-btn"
        onClick={(e) => {
          e.stopPropagation()
          onToggleCompare?.(phone)
        }}
        disabled={compareFull && !isComparing}
        aria-label={isComparing ? `Remove ${phone.name} from comparison` : `Add ${phone.name} to comparison`}
        aria-pressed={isComparing}
        title={compareFull && !isComparing ? 'Compare up to 3 phones' : undefined}
      >
        {isComparing ? '✓' : '+'}
      </button>

      <div
        className={`card-media ${hasColors ? 'has-photo' : ''}`}
        onClick={(e) => {
          if (!hasColors) return
          e.stopPropagation()
          onImageClick?.({ phone, colors, initialIndex: activeIndex, imageKey: 'image' })
        }}
      >
        {hasColors ? (
          <>
            {!activeImageLoaded && <div className="media-skeleton" aria-hidden="true" />}
            {colors.map((color, i) => (
              <img
                key={color.image}
                src={getPhoneImage(color.image)}
                alt={`${phone.name} in ${color.name}`}
                className={`card-media-img ${i === activeIndex ? 'is-active' : ''}`}
                loading="lazy"
                onLoad={() => markLoaded(color.image)}
              />
            ))}
            <div className="media-hover-hint">View image</div>
          </>
        ) : (
          <div className="card-thumb"></div>
        )}
      </div>

      <div className="card-body">
        {hasColors && colors.length > 1 && (
          <div className="color-dots" onClick={(e) => e.stopPropagation()}>
            {colors.map((color, i) => (
              <button
                key={color.image}
                type="button"
                className={`color-dot ${i === activeIndex ? 'active' : ''}`}
                style={{ backgroundImage: `url(${getPhoneImage(color.image)})` }}
                onClick={() => goToColor(i)}
                aria-label={`View ${phone.name} in ${color.name}`}
                title={color.name}
              />
            ))}
          </div>
        )}

        <div className="card-name">{phone.name}</div>
        <div className="card-brand">{phone.brand}</div>

        <div className="spec-mini">
          <span>Display</span>
          <b>{phone.display.match(/^[\d.]+"/)?.[0] || phone.display.split(' ')[0]}</b>
        </div>
        <div className="spec-mini">
          <span>Storage</span>
          <b title={`${phone.name} RAM/storage options`}>{formatStorageOptions(phone)}</b>
        </div>

        <div className="card-price">
          <span className="price">${phone.price}</span>
          <Badge tone="rating">★ {phone.rating}</Badge>
        </div>
      </div>

      <button
        type="button"
        className="view-details-chip"
        onClick={(e) => {
          e.stopPropagation()
          onSelect?.(phone)
        }}
        aria-label={`View details for ${phone.name}`}
      >
        View details <span className="chip-arrow">→</span>
      </button>
    </div>
  )
}

export default PhoneCard