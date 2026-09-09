// Real-world-informed scoring for the three "which one is actually better"
// specs: chipset, camera system, and display. Plain string equality can't
// tell you that a Snapdragon 8 Elite Gen 5 outperforms a Tensor G6, or that
// a 200MP quad-camera with a periscope lens beats a single 48MP sensor — so
// each spec gets a small scoring model instead, seeded with figures from
// current Geekbench/AnTuTu results and each brand's known camera/display
// reputation. Scores are for *ranking phones against each other*, not
// absolute or precise benchmark numbers.

// ---------------------------------------------------------------------------
// Chipset
// ---------------------------------------------------------------------------

// Approximate Geekbench 6 (single/multi-core) standing as of late 2025 /
// early 2026 launches, condensed into a single 0-100 performance score,
// plus a one-line reason a person would actually care about.
const CHIPSET_INFO = {
  'Apple A19 Pro': {
    score: 97,
    note: 'Fastest single-core performance of any phone chip, with the best sustained performance-per-watt',
  },
  'Apple A19': {
    score: 90,
    note: "Standard flagship-tier speed — a step below the Pro chip's multi-core headroom",
  },
  'Snapdragon 8 Elite Gen 5 for Galaxy': {
    score: 96,
    note: "Qualcomm's fastest multi-core scores yet, trading some efficiency for raw throughput",
  },
  'Snapdragon 8 Elite for Galaxy': {
    score: 88,
    note: 'Previous-generation Snapdragon flagship — strong, but outpaced by the newer Gen 5',
  },
  'Snapdragon 8 Elite Gen 5 / Exynos 2600': {
    score: 91,
    note: 'Flagship-class Snapdragon/Exynos performance, on par with last-gen Apple silicon',
  },
  'Google Tensor G6': {
    score: 77,
    note: 'Built around on-device AI and camera processing rather than benchmark speed',
  },
}

export function getChipsetInfo(chipset) {
  return (
    CHIPSET_INFO[chipset] || {
      score: 80,
      note: 'No detailed benchmark data available for this chipset',
    }
  )
}

// ---------------------------------------------------------------------------
// Camera
// ---------------------------------------------------------------------------

// Camera quality is more than megapixels — number of focal lengths, zoom
// reach, and each brand's known image-processing reputation all matter.
// Google is generally regarded as the strongest computational photography
// (HDR, low light), Samsung's Ultra tier leads on zoom versatility, and
// Apple leads on color accuracy/video. This gives each a small, named bonus
// on top of a spec-derived base score.
const BRAND_CAMERA_BONUS = {
  Google: { amount: 6, reason: 'strong computational HDR and low-light processing' },
  Apple: { amount: 4, reason: 'accurate color science and class-leading video' },
  Samsung: { amount: 3, reason: 'high-resolution sensors and flexible zoom hardware' },
}

function parseCameraSpec(cameraStr) {
  const lensCount = cameraStr.split('+').length
  const mpValues = [...cameraStr.matchAll(/(\d+(?:\.\d+)?)MP/g)].map((m) => parseFloat(m[1]))
  const mainMP = mpValues.length ? Math.max(...mpValues) : 0
  const zoomValues = [...cameraStr.matchAll(/\((\d+)x\)/g)].map((m) => parseInt(m[1]))
  const maxZoom = zoomValues.length ? Math.max(...zoomValues) : 1
  return { lensCount, mainMP, maxZoom }
}

export function getCameraScore(phone) {
  const { lensCount, mainMP, maxZoom } = parseCameraSpec(phone.camera)
  const bonus = BRAND_CAMERA_BONUS[phone.brand] || { amount: 0, reason: '' }

  // Diminishing returns on raw resolution, meaningful jumps for extra
  // lenses (more focal lengths to shoot with) and real optical zoom reach.
  const score =
    Math.min(mainMP / 4, 30) + // resolution, capped
    lensCount * 10 + // versatility of focal lengths
    (maxZoom - 1) * 4 + // zoom reach beyond 1x
    bonus.amount

  return { score, lensCount, mainMP, maxZoom, bonus }
}

export function cameraInsight(phones) {
  const scored = phones.map((p) => ({ phone: p, ...getCameraScore(p) }))
  scored.sort((a, b) => b.score - a.score)
  const [best, second] = scored
  const allTied = scored.every((s) => Math.abs(s.score - best.score) < 0.5)

  if (allTied) {
    return `All ${phones.length} phones offer comparably capable camera systems on paper.`
  }

  const reachParts = []
  if (best.maxZoom > 1) reachParts.push(`${best.maxZoom}x optical-class zoom`)
  if (best.lensCount >= 3) reachParts.push(`a ${best.lensCount}-lens system`)
  const hardware = reachParts.length ? ` thanks to ${reachParts.join(' and ')}` : ''
  const brandNote = best.bonus.reason ? `, and ${best.phone.brand} phones are known for ${best.bonus.reason}` : ''
  const margin = best.score - second.score
  const closeness = margin < 6 ? ` — though ${second.phone.name} isn't far behind` : ''

  return `${best.phone.name} has the most capable camera system here${hardware}${brandNote}.${closeness}`
}

// ---------------------------------------------------------------------------
// Display
// ---------------------------------------------------------------------------

// Panel-technology quality tiers, based on measured brightness/contrast
// reputation (LTPO Dynamic AMOLED > standard Dynamic AMOLED / Super Actua
// OLED > standard OLED), refresh rate, and screen size for shootouts.
const PANEL_TIER = [
  { match: /LTPO/i, score: 30, label: 'LTPO adaptive refresh panel' },
  { match: /Dynamic AMOLED 2X/i, score: 26, label: 'Dynamic AMOLED 2X panel' },
  { match: /Super Actua/i, score: 24, label: 'Super Actua OLED panel' },
  { match: /Actua/i, score: 20, label: 'Actua OLED panel' },
  { match: /OLED/i, score: 18, label: 'OLED panel' },
]

function parseDisplaySpec(displayStr) {
  const sizeMatch = displayStr.match(/([\d.]+)"/)
  const size = sizeMatch ? parseFloat(sizeMatch[1]) : 6.1
  const refreshMatch = displayStr.match(/(\d+)Hz/)
  const refresh = refreshMatch ? parseInt(refreshMatch[1]) : 60
  const tier = PANEL_TIER.find((t) => t.match.test(displayStr)) || {
    score: 15,
    label: 'OLED panel',
  }
  const isFoldable = /foldable/i.test(displayStr)
  return { size, refresh, tier, isFoldable }
}

export function getDisplayScore(phone) {
  const { size, refresh, tier, isFoldable } = parseDisplaySpec(phone.display)
  const score = tier.score + refresh / 12 + size * 1.5 + (isFoldable ? 6 : 0)
  return { score, size, refresh, tier, isFoldable }
}

export function displayInsight(phones) {
  const scored = phones.map((p) => ({ phone: p, ...getDisplayScore(p) }))
  scored.sort((a, b) => b.score - a.score)
  const [best, second] = scored
  const allTied = scored.every((s) => Math.abs(s.score - best.score) < 0.5)

  if (allTied) {
    return `All ${phones.length} phones use comparably sharp, high-refresh displays.`
  }

  const foldNote = best.isFoldable ? ' that unfolds into a larger tablet-style screen' : ''
  const margin = best.score - second.score
  const closeness = margin < 3 ? ` — a close call against ${second.phone.name}` : ''

  return `${best.phone.name} has the best display here — a ${best.size}" ${best.tier.label}${foldNote} at ${best.refresh}Hz.${closeness}`
}

export function chipsetInsight(phones) {
  const scored = phones.map((p) => ({ phone: p, ...getChipsetInfo(p.chipset) }))
  scored.sort((a, b) => b.score - a.score)
  const [best, second] = scored
  const allSameChip = phones.every((p) => p.chipset === phones[0].chipset)

  if (allSameChip) {
    return `All phones share the same chipset (${phones[0].chipset}).`
  }

  const margin = best.score - second.score
  const closeness = margin < 3 ? ` — very close to ${second.phone.name}'s chip` : ''

  return `${best.phone.name} has the strongest processor here (${best.phone.chipset}): ${best.note}.${closeness}`
}

// Winner index (for cell highlighting) shared by all three scored specs.
export function getScoredWinnerIndex(phones, scoreFn) {
  const scores = phones.map(scoreFn)
  const allTied = scores.every((s) => Math.abs(s - scores[0]) < 0.5)
  if (allTied) return -1
  let bestIdx = 0
  scores.forEach((s, i) => {
    if (s > scores[bestIdx]) bestIdx = i
  })
  return bestIdx
}