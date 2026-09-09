import { useEffect, useState } from "react";
import Badge from "../ui/Badge";
import { getPhoneImage } from "../../utils/phoneImages";
import {
  getStorageOptions,
  formatStorageOption,
  formatStorageOptions,
} from "../../utils/format";
import { useColorRotation } from "../../hooks/useColorRotation";

const SPECS = [
  { key: "display", label: "Display" },
  { key: "chipset", label: "Chipset" },
  {
    key: "storageOptions",
    label: "Storage (RAM / ROM)",
    format: formatStorageOptions,
  },
  { key: "battery", label: "Battery", suffix: " mAh" },
  { key: "camera", label: "Main Camera" },
  { key: "weight", label: "Weight", suffix: "g" },
  { key: "category", label: "Category" },
];

function PhoneDetail({ phone, onBack, onImageClick }) {
  const colors = phone.colors || [];
  const hasColors = colors.length > 0;
  const { activeIndex, goToColor, setIsPaused } = useColorRotation(
    colors.length,
    phone.id,
  );
  const [selectedStorageIndex, setSelectedStorageIndex] = useState(0);

  // PhoneDetail doesn't remount when the user jumps straight from one
  // phone's detail page to another's (e.g. via a nav search suggestion),
  // so without this the previous phone's storage selection would carry
  // over and could point past the new phone's option list.
  useEffect(() => {
    setSelectedStorageIndex(0);
  }, [phone.id]);

  const storageOptions = getStorageOptions(phone);
  const selectedStorage =
    storageOptions[selectedStorageIndex] || storageOptions[0];
  const selectedPrice = selectedStorage?.price ?? phone.price;

  const activeColor = colors[activeIndex];
  const heroSrc = activeColor
    ? getPhoneImage(activeColor.heroImage || activeColor.image)
    : null;

  return (
    <div className="detail-page">
      <button type="button" className="detail-back" onClick={onBack}>
        ← Back to catalog
      </button>

      <div className="detail-hero">
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {heroSrc ? (
            <div
              className="detail-thumb-wrap"
              onClick={() =>
                onImageClick?.({
                  phone,
                  colors,
                  initialIndex: activeIndex,
                  imageKey: "heroImage",
                })
              }
            >
              <img
                key={activeColor.heroImage || activeColor.image}
                src={heroSrc}
                alt={`${phone.name} in ${activeColor.name}`}
                className="detail-thumb detail-thumb-img"
              />
              <div className="media-hover-hint">View image</div>
            </div>
          ) : (
            <div className="detail-thumb"></div>
          )}

          {hasColors && colors.length > 1 && (
            <div className="color-dots">
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
        </div>

        <div className="detail-info">
          <span className="detail-brand">{phone.brand}</span>
          <h1 className="detail-name">{phone.name}</h1>
          {activeColor && (
            <span className="detail-color-name">{activeColor.name}</span>
          )}

          <div className="detail-meta">
            <span className="detail-price">${selectedPrice}</span>
            <Badge tone="rating">★ {phone.rating}</Badge>
          </div>

          {phone.description && (
            <p className="detail-description" id="phone-description">
              {phone.description}
            </p>
          )}

          {storageOptions.length > 1 && (
            <div className="variant-picker">
              <span className="variant-picker-label">Choose storage</span>
              <div
                className="variant-options"
                role="group"
                aria-label={`${phone.name} storage options`}
              >
                {storageOptions.map((option, index) => (
                  <button
                    key={`${option.ram}-${option.storage}`}
                    type="button"
                    className={`variant-chip ${index === selectedStorageIndex ? "active" : ""}`}
                    onClick={() => setSelectedStorageIndex(index)}
                    aria-pressed={index === selectedStorageIndex}
                  >
                    {formatStorageOption(option)}
                  </button>
                ))}
              </div>
              <span className="variant-price-note">
                {selectedStorage?.price
                  ? `$${selectedStorage.price} for selected configuration`
                  : "Price varies by configuration"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="detail-specs" id="phone-specs">
        {SPECS.map((spec) => (
          <div className="detail-spec" key={spec.key}>
            <span className="detail-spec-label">{spec.label}</span>
            <span className="detail-spec-value">
              {spec.format ? spec.format(phone) : phone[spec.key]}
              {spec.suffix || ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PhoneDetail;
