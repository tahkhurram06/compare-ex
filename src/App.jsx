import { useState, useMemo } from "react";
import CircuitBackground from "./components/background/CircuitBackground";
import Nav from "./components/layout/Nav";
import Footer from "./components/layout/Footer";
import Hero from "./components/home/Hero";
import FilterPills from "./components/home/FilterPills";
import CatalogControls from "./components/home/CatalogControls";
import PhoneGrid from "./components/catalog/PhoneGrid";
import PhoneDetail from "./components/catalog/PhoneDetail";
import CompareTable from "./components/catalog/CompareTable";
import CompareTray from "./components/catalog/CompareTray";
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
  const [compareIds, setCompareIds] = useLocalStorageState("comparex:compareIds", []);
  const [showCompareView, setShowCompareView] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState(PRICE_BOUNDS);

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

  // Compare selections persist in localStorage but the underlying catalog
  // doesn't change, so silently drop any id that no longer resolves to a
  // phone rather than rendering a broken comparison.
  const comparePhones = useMemo(
    () => compareIds.map((id) => phonesData.find((p) => p.id === id)).filter(Boolean),
    [compareIds]
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
            const capacity = storage >= 1024 ? `${storage / 1024}tb` : `${storage}gb`
            return `${ram}/${capacity}`.includes(query)
          })
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
    if (filteredPhones.length > 0 || !searchQuery.trim()) return null
    const base = activeFilter === "all" ? phonesData : phonesData.filter((p) => p.brand === activeFilter)
    const match = findClosestPhoneName(searchQuery, base)
    return match?.name || null
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
        />

        <main className="main-content">
          {showCompareView && comparePhones.length >= 2 ? (
            <div className="detail-page">
              <button
                type="button"
                className="detail-back"
                onClick={() => setShowCompareView(false)}
              >
                ← Back to catalog
              </button>
              <CompareTable phones={comparePhones} onRemove={removeFromCompare} />
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
                <FilterPills active={activeFilter} onChange={setActiveFilter} phones={phonesData} />
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
                />
              </section>
            </>
          )}
        </main>

        <Footer />
      </div>

      {!showCompareView && (
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
      />
    </>
  );
}

export default App;