const SORT_OPTIONS = [
  { id: 'default', label: 'Featured' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'rating-desc', label: 'Rating' },
]

function CatalogControls({ sortBy, onSortChange, priceRange, priceBounds, onPriceRangeChange }) {
  const [min, max] = priceBounds
  const [selectedMin, selectedMax] = priceRange

  return (
    <div className="catalog-controls">
      <div className="control-group">
        <label htmlFor="sort-select" className="control-label">Sort</label>
        <select
          id="sort-select"
          className="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="control-group price-filter">
        <label htmlFor="price-max" className="control-label">
          Price up to <span className="price-filter-value">${selectedMax}</span>
        </label>
        <input
          id="price-max"
          type="range"
          min={min}
          max={max}
          step={10}
          value={selectedMax}
          onChange={(e) => onPriceRangeChange([selectedMin, Number(e.target.value)])}
        />
      </div>
    </div>
  )
}

export default CatalogControls