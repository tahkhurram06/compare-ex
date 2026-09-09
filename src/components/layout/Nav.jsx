import { useEffect, useMemo, useRef, useState } from "react";
import { getPhoneImage } from "../../utils/phoneImages";

const MAX_SUGGESTIONS = 6;

function getSuggestions(query, phones) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return phones
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.chipset.toLowerCase().includes(q),
    )
    .slice(0, MAX_SUGGESTIONS);
}

function Nav({
  searchQuery,
  onSearchChange,
  phones,
  onSelectPhone,
  compareCount = 0,
  onCompareClick,
  savedPhones = [],
  onRemoveSaved,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const wrapRef = useRef(null);
  const savedRef = useRef(null);

  const suggestions = useMemo(
    () => getSuggestions(searchQuery, phones),
    [searchQuery, phones],
  );

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchQuery]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsOpen(false);
      }
      if (savedRef.current && !savedRef.current.contains(e.target)) {
        setIsSavedOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const pickSuggestion = (phone) => {
    onSearchChange(phone.name);
    onSelectPhone?.(phone);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(
        (i) => (i - 1 + suggestions.length) % suggestions.length,
      );
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0) {
        e.preventDefault();
        pickSuggestion(suggestions[highlightedIndex]);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const showDropdown = isOpen && searchQuery.trim().length > 0;

  return (
    <header className="nav">
      <div className="nav-logo">
        <span className="nav-dot"></span>
        COMPAREX
      </div>

      <div className="nav-search" ref={wrapRef}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Search phones..."
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="search-suggestions"
        />
        {searchQuery && (
          <button
            type="button"
            className="nav-search-clear"
            onClick={() => {
              onSearchChange("");
              setIsOpen(false);
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}

        {showDropdown && (
          <div
            className="search-dropdown"
            id="search-suggestions"
            role="listbox"
          >
            {suggestions.length > 0 ? (
              suggestions.map((phone, i) => (
                <button
                  type="button"
                  key={phone.id}
                  className={`search-suggestion ${i === highlightedIndex ? "highlighted" : ""}`}
                  role="option"
                  aria-selected={i === highlightedIndex}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  onClick={() => pickSuggestion(phone)}
                >
                  <span className="suggestion-thumb">
                    {(() => {
                      const src = phone.colors?.[0]
                        ? getPhoneImage(phone.colors[0].image)
                        : null;
                      return src ? (
                        <img src={src} alt="" loading="lazy" />
                      ) : null;
                    })()}
                  </span>
                  <span className="suggestion-text">
                    <span className="suggestion-name">{phone.name}</span>
                    <span className="suggestion-brand">{phone.brand}</span>
                  </span>
                  <span className="suggestion-price">${phone.price}</span>
                </button>
              ))
            ) : (
              <div className="search-dropdown-empty">
                No matches for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="nav-links">
        <a href="#browse" className="active">
          Browse
        </a>
        <a
          href="#compare"
          className={`nav-compare-link ${compareCount >= 2 ? "ready" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            onCompareClick?.();
          }}
        >
          Compare
          <span className="nav-compare-count">{compareCount}</span>
        </a>
        <div className="saved-dropdown-wrap" ref={savedRef}>
          <button
            type="button"
            className={`nav-compare-link saved-link ${savedPhones.length > 0 ? "ready" : ""}`}
            onClick={() => setIsSavedOpen((o) => !o)}
            aria-expanded={isSavedOpen}
            aria-controls="saved-dropdown"
          >
            Saved
            {savedPhones.length > 0 && (
              <span className="nav-compare-count">{savedPhones.length}</span>
            )}
          </button>

          {isSavedOpen && (
            <div className="saved-dropdown" id="saved-dropdown" role="listbox">
              {savedPhones.length > 0 ? (
                savedPhones.map((phone) => {
                  const src = phone.colors?.[0]
                    ? getPhoneImage(phone.colors[0].image)
                    : null;
                  return (
                    <div className="saved-item" key={phone.id}>
                      <button
                        type="button"
                        className="search-suggestion saved-item-btn"
                        onClick={() => {
                          onSelectPhone?.(phone);
                          setIsSavedOpen(false);
                        }}
                      >
                        <span className="suggestion-thumb">
                          {src ? <img src={src} alt="" loading="lazy" /> : null}
                        </span>
                        <span className="suggestion-text">
                          <span className="suggestion-name">{phone.name}</span>
                          <span className="suggestion-brand">
                            {phone.brand}
                          </span>
                        </span>
                        <span className="suggestion-price">${phone.price}</span>
                      </button>
                      <button
                        type="button"
                        className="saved-item-remove"
                        onClick={() => onRemoveSaved?.(phone.id)}
                        aria-label={`Remove ${phone.name} from saved`}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="saved-dropdown-empty">
                  <p>No saved phones yet.</p>
                  <button
                    type="button"
                    className="saved-dropdown-browse"
                    onClick={() => setIsSavedOpen(false)}
                  >
                    Browse phones
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Nav;
