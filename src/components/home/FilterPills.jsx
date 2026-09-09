function FilterPills({ active, onChange, phones }) {
  const brands = [...new Set(phones.map((p) => p.brand))].sort()
  const filters = [{ id: 'all', label: 'All' }, ...brands.map((b) => ({ id: b, label: b }))]

  return (
    <div className="filter-pills">
      {filters.map((f) => (
        <button
          key={f.id}
          type="button"
          className={`pill ${active === f.id ? 'active' : ''}`}
          onClick={() => onChange(f.id)}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

export default FilterPills