"use client";

import { useEffect } from "react";
import { notifyPreferences } from "./preferences";

// Auto comfort follows browser-local evening hours, including while left open.
export function ThemeEffects() {
  useEffect(() => {
    const syncPeriod = () => {
      const hour = new Date().getHours();
      const period = hour >= 19 || hour < 7 ? "night" : "day";
      if (document.documentElement.dataset.comfortPeriod !== period) {
        document.documentElement.dataset.comfortPeriod = period;
        notifyPreferences();
      }
    };

    syncPeriod();
    const timer = window.setInterval(syncPeriod, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return null;
}
