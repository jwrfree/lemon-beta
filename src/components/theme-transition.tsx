"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

const TRANSITION_CLASS = "theme-transition";
const TRANSITION_DURATION = 350;
const PREFERS_REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function ThemeTransition() {
  const { resolvedTheme } = useTheme();
  const isInitialRender = useRef(true);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY);

    const updatePreference = (event: MediaQueryList | MediaQueryListEvent) => {
      prefersReducedMotion.current = event.matches;

      if (event.matches) {
        document.documentElement.classList.remove(TRANSITION_CLASS);
      }
    };

    updatePreference(mediaQuery);

    const handleChange = (event: MediaQueryListEvent) => updatePreference(event);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    if (!resolvedTheme || prefersReducedMotion.current) {
      return;
    }

    const root = document.documentElement;
    root.classList.add(TRANSITION_CLASS);

    const timeout = window.setTimeout(() => {
      root.classList.remove(TRANSITION_CLASS);
    }, TRANSITION_DURATION);

    return () => {
      window.clearTimeout(timeout);
      root.classList.remove(TRANSITION_CLASS);
    };
  }, [resolvedTheme]);

  return null;
}
