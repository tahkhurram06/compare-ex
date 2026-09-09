import { useState } from "react";
import Badge from "../ui/Badge";
import { getPhoneImage } from "../../utils/phoneImages";
import { formatStorageOptions } from "../../utils/format";
import { useColorRotation } from "../../hooks/useColorRotation";

function PhoneCard({
  phone,
  onSelect,
  onImageClick,
  isComparing,
  compareFull,
  onToggleCompare,
  isSaved,
  onToggleSave,
  cardRef,
  compact = false,
}) {
  const colors = phone.colors || [];
  const hasColors = colors.length > 0;
  const { activeIndex, goToColor, setIsPaused } = useColorRotation(
    colors.length,
    phone.id,
  );
  const [loadedImages, setLoadedImages] = useState(() => new Set());

  const markLoaded = (filename) => {
    setLoadedImages((prev) => {
      if (prev.has(filename)) return prev;
      const next = new Set(prev);
      next.add(filename);
      return next;
    });
  };

  const activeImageLoaded =
    hasColors && loadedImages.has(colors[activeIndex].image);

  return (
    <div
      ref={cardRef}
      className={`phone-card ${isComparing ? "selected" : ""} ${compact ? "compact" : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(phone)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect?.(phone);
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <button
        type="button"
        className="add-btn card-compare-btn"
        onClick={(e) => {
          e.stopPropagation();
          onToggleCompare?.(phone);
        }}
        disabled={compareFull && !isComparing}
        aria-label={
          isComparing
            ? `Remove ${phone.name} from comparison`
            : `Add ${phone.name} to comparison`
        }
        aria-pressed={isComparing}
        title={
          compareFull && !isComparing ? "Compare up to 3 phones" : undefined
        }
      >
        {isComparing ? "✓" : "+"}
      </button>

      <button
        type="button"
        className={`save-btn card-save-btn ${isSaved ? "active" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave?.(phone);
        }}
        aria-label={
          isSaved ? `Remove ${phone.name} from saved` : `Save ${phone.name}`
        }
        aria-pressed={isSaved}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={isSaved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 21s-6.9-4.35-9.3-8.2C.9 9.9 1.5 6.2 4.6 4.7c2.3-1.1 4.9-.3 6.1 1.5L12 7.8l1.3-1.6c1.2-1.8 3.8-2.6 6.1-1.5 3.1 1.5 3.7 5.2 1.9 8.1C18.9 16.65 12 21 12 21z" />
        </svg>
      </button>

      <div
        className={`card-media ${hasColors ? "has-photo" : ""}`}
        onClick={(e) => {
          if (!hasColors) return;
          e.stopPropagation();
          onImageClick?.({
            phone,
            colors,
            initialIndex: activeIndex,
            imageKey: "image",
          });
        }}
      >
        {hasColors ? (
          <>
            {!activeImageLoaded && (
              <div className="media-skeleton" aria-hidden="true" />
            )}
            {colors.map((color, i) => (
              <img
                key={color.image}
                src={getPhoneImage(color.image)}
                alt={`${phone.name} in ${color.name}`}
                className={`card-media-img ${i === activeIndex ? "is-active" : ""}`}
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
                className={`color-dot ${i === activeIndex ? "active" : ""}`}
                style={{
                  backgroundImage: `url(${getPhoneImage(color.image)})`,
                }}
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
          <b>
            {phone.display.match(/^[\d.]+"/)?.[0] ||
              phone.display.split(" ")[0]}
          </b>
        </div>
        <div className="spec-mini">
          <span>Storage</span>
          <b title={`${phone.name} RAM/storage options`}>
            {formatStorageOptions(phone)}
          </b>
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
          e.stopPropagation();
          onSelect?.(phone);
        }}
        aria-label={`View details for ${phone.name}`}
      >
        View details <span className="chip-arrow">→</span>
      </button>
    </div>
  );
}

export default PhoneCard;
