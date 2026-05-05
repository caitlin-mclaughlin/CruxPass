// src/hooks/useViewportVars.ts
import { useEffect } from "react";

/**
 * Measure fixed nav elements and safe-area insets and expose them as CSS vars:
 * --top-nav-height, --bottom-nav-height
 *
 * Assumes your nav elements have attributes: data-top-nav and data-bottom-nav (if present).
 */
export default function useViewportVars() {
  useEffect(() => {
    const root = document.documentElement;

    // defaults so layout doesn't jump on first paint
    const setVars = (top = 0, bottom = 0) => {
      root.style.setProperty("--top-nav-height", `${Math.round(top)}px`);
      root.style.setProperty("--bottom-nav-height", `${Math.round(bottom)}px`);
    };

    // safe-area defaults (fallback)
    root.style.setProperty("--safe-top", `env(safe-area-inset-top, 0px)`);
    root.style.setProperty("--safe-bottom", `env(safe-area-inset-bottom, 0px)`);

    const measure = () => {
      // find fixed header/footer by data attributes (already in your Navigation)
      const topEl = document.querySelector<HTMLElement>("[data-top-nav]");
      const bottomEl = document.querySelector<HTMLElement>("[data-bottom-nav]");

      // compute heights including computed margins (if any)
      const topRect = topEl?.getBoundingClientRect();
      const bottomRect = bottomEl?.getBoundingClientRect();

      const topHeight = topRect ? topRect.height : 0;
      const bottomHeight = bottomRect ? bottomRect.height : 0;

      // include safe area insets if you want (they're CSS env vars)
      // but we already expose safe-area variables; the main padding will combine both.

      setVars(topHeight, bottomHeight);
    };

    // run once + on resize & orientationchange
    measure();
    const ro = new ResizeObserver(measure);
    // observe the whole document body in case nav heights change
    ro.observe(document.body);

    window.addEventListener("orientationchange", measure);
    window.addEventListener("resize", measure);

    // If DOM changes may affect nav (e.g. login toggles), observe mutations for nav area
    const mo = new MutationObserver(() => measure());
    mo.observe(document.body, { subtree: true, childList: true, attributes: true });

    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("orientationchange", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);
}
