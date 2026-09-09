import { useEffect, useState } from 'react'
import { getPhoneImage } from '../../utils/phoneImages'

function ImageLightbox({ phone, colors, initialIndex = 0, imageKey = 'image', onClose }) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)

  useEffect(() => {
    setActiveIndex(initialIndex)
  }, [initialIndex, phone])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  if (!phone || !colors || colors.length === 0) return null

  const activeColor = colors[activeIndex]
  const src = getPhoneImage(activeColor[imageKey] || activeColor.image)
  const alt = `${phone.name} in ${activeColor.name}`

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button
        type="button"
        className="lightbox-close"
        onClick={onClose}
        aria-label="Close image"
      >
        ✕
      </button>

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img key={activeColor[imageKey] || activeColor.image} src={src} alt={alt} className="lightbox-img" />

        {colors.length > 1 && (
          <div className="lightbox-color-dots color-dots">
            {colors.map((color, i) => (
              <button
                key={color.image}
                type="button"
                className={`color-dot ${i === activeIndex ? 'active' : ''}`}
                style={{ backgroundImage: `url(${getPhoneImage(color.image)})` }}
                onClick={() => setActiveIndex(i)}
                aria-label={`View ${phone.name} in ${color.name}`}
                title={color.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageLightbox