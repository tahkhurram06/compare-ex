import { getChipsetInfo, getCameraScore, getDisplayScore } from './deviceScoring'

// Produces a single "pick X if you care about Y, pick Z if you care about W"
// sentence for a head-to-head (2-phone) comparison, built from the same
// scoring functions that already drive the compare-table winner highlights.
export function buildPickSummary(phones) {
  if (phones.length !== 2) return null
  const [a, b] = phones

  const categories = [
    {
      label: 'camera quality',
      diff: getCameraScore(a).score - getCameraScore(b).score,
    },
    {
      label: 'raw performance',
      diff: getChipsetInfo(a.chipset).score - getChipsetInfo(b.chipset).score,
    },
    {
      label: 'display quality',
      diff: getDisplayScore(a).score - getDisplayScore(b).score,
    },
    {
      label: 'battery life',
      diff: a.battery - b.battery,
    },
    {
      label: 'a lower price',
      diff: b.price - a.price, // lower price is "better" so flip the sign
    },
  ]

  // Keep only categories with a meaningful gap, then take the strongest
  // point in each phone's favor.
  const aWins = categories.filter((c) => c.diff > 0).sort((x, y) => y.diff - x.diff)
  const bWins = categories.filter((c) => c.diff < 0).sort((x, y) => x.diff - y.diff)

  if (aWins.length === 0 && bWins.length === 0) {
    return `${a.name} and ${b.name} are closely matched across the board — it likely comes down to brand and ecosystem preference.`
  }

  const parts = []
  if (aWins.length > 0) parts.push(`Pick the ${a.name} if ${aWins[0].label} matters most to you`)
  if (bWins.length > 0) parts.push(`pick the ${b.name} if you value ${bWins[0].label} more`)

  return parts.join(', ') + '.'
}