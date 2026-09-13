import { useEffect, useRef, useState } from "react";

const SORT_OPTIONS = [
  { id: "default", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating-desc", label: "Rating" },
];

function CatalogControls({
  sortBy,
  onSortChange,
  priceRange,
  priceBounds,
  onPriceRangeChange,
}) {
  const [min, max] = priceBounds;
  const [selectedMin, selectedMax] = priceRange;
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  const activeSort =
    SORT_OPTIONS.find((opt) => opt.id === sortBy) || SORT_OPTIONS[0];

  useEffect(() => {
    const onClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const pickSort = (id) => {
    onSortChange(id);
    setIsSortOpen(false);
  };

  const handleTriggerKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsSortOpen(true);
    } else if (e.key === "Escape") {
      setIsSortOpen(false);
    }
  };

  return (
    <div className="catalog-controls">
      <div className="control-group">
        <span id="sort-label" className="control-label">
          Sort
        </span>
        <div className="sort-dropdown" ref={sortRef}>
          <button
            type="button"
            className={`sort-trigger ${isSortOpen ? "open" : ""}`}
            onClick={() => setIsSortOpen((o) => !o)}
            onKeyDown={handleTriggerKeyDown}
            aria-haspopup="listbox"
            aria-expanded={isSortOpen}
            aria-labelledby="sort-label"
          >
            <span>{activeSort.label}</span>
            <svg
              className="sort-trigger-arrow"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {isSortOpen && (
            <ul
              className="sort-options"
              role="listbox"
              aria-labelledby="sort-label"
            >
              {SORT_OPTIONS.map((opt) => (
                <li key={opt.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={opt.id === sortBy}
                    className={`sort-option ${opt.id === sortBy ? "active" : ""}`}
                    onClick={() => pickSort(opt.id)}
                  >
                    {opt.label}
                    {opt.id === sortBy && (
                      <span className="sort-option-check">✓</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="control-group price-filter">
        <label htmlFor="price-min" className="control-label">
          Price{" "}
          <span className="price-filter-value">
            ${selectedMin} – ${selectedMax}
          </span>
        </label>
        <div className="price-filter-inputs">
          <input
            id="price-min"
            type="range"
            min={min}
            max={max}
            step={10}
            value={selectedMin}
            onChange={(e) =>
              onPriceRangeChange([
                Math.min(Number(e.target.value), selectedMax),
                selectedMax,
              ])
            }
          />
          <input
            id="price-max"
            type="range"
            min={min}
            max={max}
            step={10}
            value={selectedMax}
            onChange={(e) =>
              onPriceRangeChange([
                selectedMin,
                Math.max(Number(e.target.value), selectedMin),
              ])
            }
          />
        </div>
      </div>
    </div>
  );
}

export default CatalogControls;
