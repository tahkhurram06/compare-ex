import { useState, useMemo } from "react";
import CircuitBackground from "./components/background/CircuitBackground";
import Nav from "./components/layout/Nav";
import Footer from "./components/layout/Footer";
import Hero from "./components/home/Hero";
import FilterPills from "./components/home/FilterPills";
import CatalogControls from "./components/home/CatalogControls";
import PhoneGrid from "./components/catalog/PhoneGrid";
import PhoneDetail from "./components/catalog/PhoneDetail";
import CompareTable from "./components/compare/CompareTable";
import ComparePrompt from "./components/compare/ComparePrompt";
import CompareTray from "./components/compare/CompareTray";
import ImageLightbox from "./components/ui/ImageLightbox";
import phonesData from "./data/phones.json";
import { findClosestPhoneName } from "./utils/search";
import { useLocalStorageState } from "./hooks/useLocalStorageState";
import "./App.css";

const PRICE_BOUNDS = [
  Math.min(...phonesData.map((p) => p.price)),
  Math.max(...phonesData.map((p) => p.price)),
];

function App() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [lightboxData, setLightboxData] = useState(null);
  const [compareIds, setCompareIds] = useLocalStorageState(
    "comparex:compareIds",
    [],
  );
  const [savedIds, setSavedIds] = useLocalStorageState("comparex:savedIds", []);
  const [showCompareView, setShowCompareView] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState(PRICE_BOUNDS);

  const isHome = !showCompareView && !selectedPhone;

  const goHome = () => {
    setShowCompareView(false);
    setSelectedPhone(null);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (value.trim()) setSelectedPhone(null);
  };

  const toggleCompare = (phone) => {
    setCompareIds((ids) => {
      if (ids.includes(phone.id)) return ids.filter((id) => id !== phone.id);
      if (ids.length >= 3) return ids;
      return [...ids, phone.id];
    });
  };

  const removeFromCompare = (id) => {
    setCompareIds((ids) => ids.filter((existing) => existing !== id));
  };

  const toggleSaved = (phone) => {
    setSavedIds((ids) =>
      ids.includes(phone.id)
        ? ids.filter((id) => id !== phone.id)
        : [...ids, phone.id],
    );
  };

  const removeFromSaved = (id) => {
    setSavedIds((ids) => ids.filter((existing) => existing !== id));
  };

  // From the lightbox: land on that phone's detail page, then jump straight
  // to its description (falling back to the specs block for phones without
  // one) rather than leaving the person at the top of a tall hero section.
  const handleViewDescription = (phone) => {
    setLightboxData(null);
    setSelectedPhone(phone);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target =
          document.getElementById("phone-description") ||
          document.getElementById("phone-specs");
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  // Compare selections persist in localStorage but the underlying catalog
  // doesn't change, so silently drop any id that no longer resolves to a
  // phone rather than rendering a broken comparison.
  const comparePhones = useMemo(
    () =>
      compareIds
        .map((id) => phonesData.find((p) => p.id === id))
        .filter(Boolean),
    [compareIds],
  );

  // Same resilience as comparePhones above: drop any saved id that no
  // longer resolves to a catalog phone instead of rendering a broken row.
  const savedPhones = useMemo(
    () =>
      savedIds.map((id) => phonesData.find((p) => p.id === id)).filter(Boolean),
    [savedIds],
  );

  const filteredPhones = useMemo(() => {
    let result = phonesData;

    if (activeFilter !== "all") {
      result = result.filter((p) => p.brand === activeFilter);
    }

    result = result.filter((p) => p.price <= priceRange[1]);

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.chipset.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.storageOptions || []).some(({ ram, storage }) => {
            const capacity =
              storage >= 1024 ? `${storage / 1024}tb` : `${storage}gb`;
            const ramValue = `${ram}gb`.toLowerCase();
            // Match whole tokens ("8" -> "8gb" ram, "512" -> "512gb" storage,
            // "8/512" -> combined) rather than a loose substring check, so a
            // search for "12" doesn't also match inside "512gb".
            return (
              query === ramValue ||
              query === capacity ||
              `${ramValue}/${capacity}` === query
            );
          }),
      );
    }

    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating-desc") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [activeFilter, searchQuery, sortBy, priceRange]);

  const searchSuggestion = useMemo(() => {
    if (filteredPhones.length > 0 || !searchQuery.trim()) return null;
    const base =
      activeFilter === "all"
        ? phonesData
        : phonesData.filter((p) => p.brand === activeFilter);
    const match = findClosestPhoneName(searchQuery, base);
    return match?.name || null;
  }, [filteredPhones.length, searchQuery, activeFilter]);

  return (
    <>
      <CircuitBackground />

      <div className="page">
        <Nav
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          phones={phonesData}
          onSelectPhone={setSelectedPhone}
          compareCount={comparePhones.length}
          onCompareClick={() => setShowCompareView(true)}
          savedPhones={savedPhones}
          onRemoveSaved={removeFromSaved}
          isHome={isHome}
          isCompareView={showCompareView}
          onBrowseClick={goHome}
        />

        <main className="main-content">
          {showCompareView ? (
            <div className="detail-page">
              <button
                type="button"
                className="detail-back"
                onClick={() => setShowCompareView(false)}
              >
                ← Back to catalog
              </button>
              {comparePhones.length >= 2 ? (
                <CompareTable
                  phones={comparePhones}
                  onRemove={removeFromCompare}
                />
              ) : (
                <ComparePrompt onBrowse={() => setShowCompareView(false)} />
              )}
            </div>
          ) : selectedPhone ? (
            <PhoneDetail
              phone={selectedPhone}
              onBack={() => setSelectedPhone(null)}
              onImageClick={setLightboxData}
            />
          ) : (
            <>
              <Hero />

              <section className="section-block">
                <div className="section-label">
                  <h2>Browse Catalog</h2>
                  <span className="count">{filteredPhones.length} phones</span>
                </div>
                <FilterPills
                  active={activeFilter}
                  onChange={setActiveFilter}
                  phones={phonesData}
                />
                <CatalogControls
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  priceRange={priceRange}
                  priceBounds={PRICE_BOUNDS}
                  onPriceRangeChange={setPriceRange}
                />
                <PhoneGrid
                  phones={filteredPhones}
                  onSelect={setSelectedPhone}
                  onImageClick={setLightboxData}
                  searchQuery={searchQuery}
                  searchSuggestion={searchSuggestion}
                  onSuggestionClick={handleSearchChange}
                  compareIds={compareIds}
                  onToggleCompare={toggleCompare}
                  savedIds={savedIds}
                  onToggleSave={toggleSaved}
                />
              </section>
            </>
          )}
        </main>

        <Footer />
      </div>

      {isHome && (
        <CompareTray
          phones={comparePhones}
          onRemove={removeFromCompare}
          onCompare={() => setShowCompareView(true)}
        />
      )}

      <ImageLightbox
        phone={lightboxData?.phone}
        colors={lightboxData?.colors}
        initialIndex={lightboxData?.initialIndex}
        imageKey={lightboxData?.imageKey}
        onClose={() => setLightboxData(null)}
        onViewDescription={handleViewDescription}
      />
    </>
  );
}

export default App;
