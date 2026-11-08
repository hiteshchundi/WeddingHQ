"use client";

import { useEffect } from "react";

// Future controls only need to set root data-theme and data-eye-comfort.
// Auto comfort uses local evening hours (19:00–07:00), without persistence.
export function ThemeEffects() {
  useEffect(() => {
    const syncPeriod = () => {
      const hour = new Date().getHours();
      document.documentElement.dataset.comfortPeriod =
        hour >= 19 || hour < 7 ? "night" : "day";
    };

    syncPeriod();
    const timer = window.setInterval(syncPeriod, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return null;
}
