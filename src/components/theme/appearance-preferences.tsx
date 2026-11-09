"use client";

import { useId, useSyncExternalStore } from "react";
import { appearanceSnapshot, serverAppearanceSnapshot, setPreference, subscribePreferences } from "./preferences";

// One set of controls for the shell dialog and Settings; same store and keys.
export function AppearancePreferences() {
  const id = useId();
  const snapshot = useSyncExternalStore(subscribePreferences, appearanceSnapshot, serverAppearanceSnapshot);
  const [theme, comfort, period] = snapshot.split("|");
  const comfortActive = comfort === "on" || (comfort === "auto" && period === "night");

  return (
    <div className="max-w-sm">
      <fieldset className="mt-6">
        <legend className="mb-2 text-sm font-semibold">Theme</legend>
        <div className="appearance-options">
          {(["light", "dark", "system"] as const).map((mode) => (
            <label key={mode}>
              <input type="radio" name={`${id}-theme`} value={mode} checked={theme === mode} onChange={() => setPreference("theme", mode)} />
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-6">
        <legend className="mb-2 text-sm font-semibold">Eye comfort</legend>
        <div className="appearance-options">
          {(["off", "on", "auto"] as const).map((mode) => (
            <label key={mode}>
              <input type="radio" name={`${id}-comfort`} value={mode} checked={comfort === mode} onChange={() => setPreference("eyeComfort", mode)} />
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </label>
          ))}
        </div>
      </fieldset>
      <p className="mt-4 text-sm text-secondary-text" aria-live="polite">Eye comfort is {comfortActive ? "on" : "off"}</p>
    </div>
  );
}
