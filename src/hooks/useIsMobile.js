import { useEffect, useState } from "react";

// Tracks whether the viewport is at or below `breakpoint`, kept in sync with
// resize/orientation changes via matchMedia (cheaper than a resize listener).
export function useIsMobile(breakpoint = 760) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= breakpoint,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = (e) => setIsMobile(e.matches);

    setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
}
