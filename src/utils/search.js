// Small Levenshtein-distance based helpers for typo-tolerant search.
// No dependencies — cheap enough to run against a catalog this size on
// every keystroke.

function levenshtein(a, b) {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  let curr = new Array(n + 1)

  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(
        curr[j - 1] + 1,     // insertion
        prev[j] + 1,         // deletion
        prev[j - 1] + cost   // substitution
      )
    }
    ;[prev, curr] = [curr, prev]
  }

  return prev[n]
}

// Finds the catalog phone whose name is the closest typo-distance match
// to the query, only returning a suggestion if it's plausibly a typo
// (short edit distance relative to word length) rather than an unrelated word.
export function findClosestPhoneName(query, phones) {
  const q = query.trim().toLowerCase()
  if (!q || q.length < 3) return null

  let best = null
  let bestDistance = Infinity

  for (const phone of phones) {
    const candidates = [
      phone.name.toLowerCase(),
      phone.brand.toLowerCase(),
      ...phone.name.toLowerCase().split(/\s+/),
    ]

    for (const candidate of candidates) {
      const distance = levenshtein(q, candidate)
      const threshold = Math.max(1, Math.floor(candidate.length * 0.34))
      if (distance <= threshold && distance < bestDistance && distance > 0) {
        bestDistance = distance
        best = phone
      }
    }
  }

  return best
}