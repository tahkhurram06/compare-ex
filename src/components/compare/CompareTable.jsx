import { getPhoneImage } from '../../utils/phoneImages'
import { getStorageOptions, formatStorageOptions } from '../../utils/format'
import {
  getChipsetInfo,
  getCameraScore,
  getDisplayScore,
  chipsetInsight,
  cameraInsight,
  displayInsight,
  getScoredWinnerIndex,
} from '../../utils/deviceScoring'
import { buildPickSummary } from '../../utils/compareSummary'

const ROWS = [
  { key: 'display', label: 'Display', scored: true, scoreFn: (p) => getDisplayScore(p).score },
  { key: 'chipset', label: 'Chipset', scored: true, scoreFn: (p) => getChipsetInfo(p.chipset).score },
  { key: 'storageOptions', label: 'Storage (RAM / ROM)' },
  { key: 'battery', label: 'Battery', numeric: true, unit: ' mAh', higherIsBetter: true },
  { key: 'camera', label: 'Main Camera', scored: true, scoreFn: (p) => getCameraScore(p).score },
  { key: 'weight', label: 'Weight', numeric: true, unit: 'g', higherIsBetter: false },
]

function getMaxMemory(phone, key) {
  return Math.max(...getStorageOptions(phone).map((option) => option[key]))
}

function getNumericWinner(phones, key, higherIsBetter) {
  const values = phones.map((p) => (typeof key === 'function' ? key(p) : p[key]))
  const allSame = values.every((v) => v === values[0])
  let bestIdx = 0
  values.forEach((v, i) => {
    if (higherIsBetter ? v > values[bestIdx] : v < values[bestIdx]) bestIdx = i
  })
  return { allSame, name: phones[bestIdx].name, value: values[bestIdx] }
}

function numericInsight(phones, key, label, unit, higherIsBetter, superlative) {
  const { allSame, name, value } = getNumericWinner(phones, key, higherIsBetter)
  if (allSame) {
    return `All ${phones.length} phones share the same ${label.toLowerCase()} (${value}${unit}).`
  }
  return `${name} has the ${superlative} ${label.toLowerCase()} among them at ${value}${unit}.`
}

function ramStorageInsight(phones) {
  const ram = getNumericWinner(phones, (phone) => getMaxMemory(phone, 'ram'), true)
  const storage = getNumericWinner(phones, (phone) => getMaxMemory(phone, 'storage'), true)

  if (ram.allSame && storage.allSame) {
    return `All phones offer up to ${ram.value}GB RAM and ${storage.value >= 1024 ? `${storage.value / 1024}TB` : `${storage.value}GB`} of storage.`
  }
  if (ram.allSame) {
    return `RAM tops out at ${ram.value}GB across all phones; ${storage.name} offers the most storage at ${storage.value >= 1024 ? `${storage.value / 1024}TB` : `${storage.value}GB`}.`
  }
  if (storage.allSame) {
    return `${ram.name} has the most RAM at ${ram.value}GB; maximum storage is the same across all phones (${storage.value >= 1024 ? `${storage.value / 1024}TB` : `${storage.value}GB`}).`
  }
  if (ram.name === storage.name) {
    return `${ram.name} leads with up to ${ram.value}GB RAM and ${storage.value >= 1024 ? `${storage.value / 1024}TB` : `${storage.value}GB`} storage.`
  }
  return `${ram.name} has the most RAM (${ram.value}GB), while ${storage.name} has the most storage (${storage.value >= 1024 ? `${storage.value / 1024}TB` : `${storage.value}GB`}).`
}

function buildInsights(phones) {
  return [
    { key: 'display', label: 'Display', text: displayInsight(phones) },
    { key: 'chipset', label: 'Chipset', text: chipsetInsight(phones) },
    { key: 'storageOptions', label: 'Storage (RAM / ROM)', text: ramStorageInsight(phones) },
    { key: 'battery', label: 'Battery', text: numericInsight(phones, 'battery', 'Battery', ' mAh', true, 'largest') },
    { key: 'camera', label: 'Main Camera', text: cameraInsight(phones) },
    { key: 'weight', label: 'Weight', text: numericInsight(phones, 'weight', 'Weight', 'g', false, 'lightest') },
  ]
}

function getWinnerIndex(phones, row) {
  if (row.scored) return getScoredWinnerIndex(phones, row.scoreFn)
  if (!row.numeric) return -1
  let bestIdx = 0
  let bestVal = phones[0][row.key]
  phones.forEach((p, i) => {
    const val = p[row.key]
    if (row.higherIsBetter ? val > bestVal : val < bestVal) {
      bestVal = val
      bestIdx = i
    }
  })
  const allSame = phones.every((p) => p[row.key] === phones[0][row.key])
  return allSame ? -1 : bestIdx
}

function CompareTable({ phones, onRemove }) {
  if (phones.length < 2) return null

  const insights = buildInsights(phones)
  const pickSummary = buildPickSummary(phones)

  return (
    <div className="compare-wrap">
      {pickSummary && (
        <div className="pick-summary">
          <span className="pick-summary-label">Quick take</span>
          <p>{pickSummary}</p>
        </div>
      )}

      <div className="compare-grid" style={{ gridTemplateColumns: `180px repeat(${phones.length}, 1fr)` }}>
        <div className="corner"></div>
        {phones.map((phone) => (
          <div className="phone-col-header" key={phone.id}>
            <button
              type="button"
              className="remove"
              onClick={() => onRemove(phone.id)}
              aria-label={`Remove ${phone.name} from comparison`}
            >
              ✕
            </button>
            <div
              className="phone-thumb"
              style={
                phone.colors?.[0]
                  ? { backgroundImage: `url(${getPhoneImage(phone.colors[0].image)})`, backgroundSize: '160%', backgroundPosition: 'center 35%' }
                  : undefined
              }
            ></div>
            <div className="phone-name">{phone.name}</div>
            <div className="phone-price">${phone.price}</div>
          </div>
        ))}

        {ROWS.map((row) => {
          const winnerIdx = getWinnerIndex(phones, row)
          return (
            <div className="compare-row-group" key={row.key} style={{ display: 'contents' }}>
              <div className="row-label">{row.label}</div>
              {phones.map((phone, i) => {
                const value =
                  row.key === 'storageOptions'
                    ? formatStorageOptions(phone)
                    : `${phone[row.key]}${row.unit || ''}`
                return (
                  <div key={phone.id} className={`cell ${i === winnerIdx ? 'win' : ''}`}>
                    {value}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      <div className="compare-insights">
        <span className="compare-insights-title">Key takeaways</span>
        <ul className="compare-insights-list">
          {insights.map((insight) => (
            <li key={insight.key}>
              <span className="insight-label">{insight.label}</span>
              {insight.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default CompareTable