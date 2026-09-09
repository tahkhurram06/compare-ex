import { useEffect, useRef } from "react";
import PhoneCard from "./PhoneCard";
import EmptyState from "../ui/EmptyState";
import { useIsMobile } from "../../hooks/useIsMobile";

// Approximates the grid's current column count from CSS breakpoints so
// arrow-up/down can jump a full row instead of just one card.
function getColumnCount() {
  const w = window.innerWidth;
  if (w <= 480) return 1;
  if (w <= 760) return 2;
  if (w <= 1024) return 3;
  return 4;
}

// Buckets phones into per-brand rails for the mobile layout, preserving
// each brand's first-seen order so it still reflects the active sort.
// When the catalog is already filtered to one brand (e.g. the "Samsung"
// pill), this naturally collapses to a single rail for that brand.
function groupByBrand(phones) {
  const order = [];
  const groups = new Map();

  for (const phone of phones) {
    if (!groups.has(phone.brand)) {
      groups.set(phone.brand, []);
      order.push(phone.brand);
    }
    groups.get(phone.brand).push(phone);
  }

  return order.map((brand) => ({ brand, phones: groups.get(brand) }));
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
  savedIds,
  onToggleSave,
}) {
  const cardRefs = useRef([]);
  const isMobile = useIsMobile(760);

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, phones.length);
  }, [phones.length]);

  const handleKeyDown = (e, index) => {
    const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];
    if (!arrowKeys.includes(e.key)) return;

    const cols = getColumnCount();
    let nextIndex = index;

    if (e.key === "ArrowRight") nextIndex = index + 1;
    if (e.key === "ArrowLeft") nextIndex = index - 1;
    if (e.key === "ArrowDown") nextIndex = index + cols;
    if (e.key === "ArrowUp") nextIndex = index - cols;

    if (nextIndex >= 0 && nextIndex < phones.length) {
      e.preventDefault();
      cardRefs.current[nextIndex]?.focus();
    }
  };

  if (phones.length === 0) {
    return (
      <EmptyState
        message={
          searchQuery
            ? `No phones match "${searchQuery}".`
            : "No phones match your filters."
        }
        suggestion={searchSuggestion}
        onSuggestionClick={onSuggestionClick}
      />
    );
  }

  if (isMobile) {
    const brandGroups = groupByBrand(phones);

    return (
      <div className="brand-sliders">
        {brandGroups.map(({ brand, phones: brandPhones }) => (
          <div className="brand-slider" key={brand}>
            <div className="brand-slider-header">
              <h3>{brand}</h3>
              <span className="brand-slider-count">
                {brandPhones.length}{" "}
                {brandPhones.length === 1 ? "phone" : "phones"}
              </span>
            </div>
            <div className="brand-slider-track">
              {brandPhones.map((phone) => (
                <div className="brand-slider-item" key={phone.id}>
                  <PhoneCard
                    phone={phone}
                    onSelect={onSelect}
                    onImageClick={onImageClick}
                    isComparing={compareIds?.includes(phone.id)}
                    compareFull={compareIds?.length >= 3}
                    onToggleCompare={onToggleCompare}
                    isSaved={savedIds?.includes(phone.id)}
                    onToggleSave={onToggleSave}
                    compact
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
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
            isSaved={savedIds?.includes(phone.id)}
            onToggleSave={onToggleSave}
            cardRef={(el) => (cardRefs.current[index] = el)}
          />
        </div>
      ))}
    </div>
  );
}

export default PhoneGrid;
