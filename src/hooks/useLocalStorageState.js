import { useEffect, useState } from 'react'

// Generic localStorage-backed useState. Falls back to the initial value
// silently if storage is unavailable (private browsing, quota, etc.) so a
// storage failure never breaks the app.
export function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage unavailable — fail silently, in-memory state still works
    }
  }, [key, value])

  return [value, setValue]
}