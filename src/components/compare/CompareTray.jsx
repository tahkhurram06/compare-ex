import { getPhoneImage } from "../../utils/phoneImages";

const MAX_COMPARE = 3;

function CompareTray({ phones, onRemove, onCompare }) {
  if (phones.length === 0) return null;

  const emptySlots = MAX_COMPARE - phones.length;

  return (
    <div className="compare-tray">
      <div className="compare-tray-inner">
        <div className="compare-tray-thumbs">
          {phones.map((phone) => {
            const thumbImage = phone.colors?.[0]?.image;
            return (
              <div className="compare-tray-item" key={phone.id}>
                <div
                  className="compare-tray-thumb"
                  style={
                    thumbImage
                      ? { backgroundImage: `url(${getPhoneImage(thumbImage)})` }
                      : undefined
                  }
                  title={phone.name}
                />
                <button
                  type="button"
                  className="compare-tray-remove"
                  onClick={() => onRemove(phone.id)}
                  aria-label={`Remove ${phone.name} from comparison`}
                >
                  ✕
                </button>
              </div>
            );
          })}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div
              className="compare-tray-slot"
              key={`empty-${i}`}
              aria-hidden="true"
            />
          ))}
        </div>

        <span className="compare-tray-count">
          {phones.length} of {MAX_COMPARE} selected
        </span>

        <button
          type="button"
          className="compare-tray-cta"
          onClick={onCompare}
          disabled={phones.length < 2}
          title={
            phones.length < 2 ? "Add at least 2 phones to compare" : undefined
          }
        >
          Compare <span className="chip-arrow">→</span>
        </button>
      </div>
    </div>
  );
}

export default CompareTray;
