import { useEffect, useRef, useState } from 'react'

const AUTO_ROTATE_MS = 2400

// Auto-cycles through a phone's color options, pausing briefly whenever the
// user manually picks a color (or hovers, if the caller wires that up).
// Shared by PhoneCard and PhoneDetail, which previously each reimplemented
// this identically.
export function useColorRotation(colorCount, resetKey) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    setActiveIndex(0)
  }, [resetKey])

  useEffect(() => {
    if (colorCount < 2 || isPaused) return

    timerRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % colorCount)
    }, AUTO_ROTATE_MS)

    return () => clearInterval(timerRef.current)
  }, [colorCount, isPaused])

  const goToColor = (index) => {
    setActiveIndex(index)
    // give the user a moment before auto-rotate picks back up
    setIsPaused(true)
    clearTimeout(timerRef.current)
    setTimeout(() => setIsPaused(false), AUTO_ROTATE_MS)
  }

  return { activeIndex, goToColor, setIsPaused }
}