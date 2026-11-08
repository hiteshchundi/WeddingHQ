"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useId, useRef, useSyncExternalStore } from "react";
import { IconButton } from "../ui/icon-button";
import {
  appearanceSnapshot,
  serverAppearanceSnapshot,
  setPreference,
  subscribePreferences,
} from "./preferences";

export function AppearanceControl() {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const snapshot = useSyncExternalStore(
    subscribePreferences,
    appearanceSnapshot,
    serverAppearanceSnapshot,
  );
  const [theme, comfort, period] = snapshot.split("|");
  const comfortActive = comfort === "on" || (comfort === "auto" && period === "night");

  return (
    <>
      <IconButton
        aria-label="Appearance"
        title="Appearance"
        aria-haspopup="dialog"
        aria-controls={`${id}-dialog`}
        onClick={() => dialog.current?.showModal()}
      >
        <SlidersHorizontal size={20} />
      </IconButton>
      <dialog
        ref={dialog}
        id={`${id}-dialog`}
        aria-labelledby={`${id}-title`}
        className="shell-dialog appearance-dialog"
        onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}
      >
        <div>
          <header className="flex items-center justify-between gap-4">
            <h2 id={`${id}-title`} className="text-2xl font-semibold">Appearance</h2>
            <IconButton aria-label="Close appearance" onClick={() => dialog.current?.close()}>
              <X size={20} />
            </IconButton>
          </header>
          <fieldset className="mt-6">
            <legend className="mb-2 text-sm font-semibold">Theme</legend>
            <div className="appearance-options">
              {(["light", "dark", "system"] as const).map((mode) => (
                <label key={mode}>
                  <input
                    type="radio"
                    name={`${id}-theme`}
                    value={mode}
                    checked={theme === mode}
                    onChange={() => setPreference("theme", mode)}
                  />
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
                  <input
                    type="radio"
                    name={`${id}-comfort`}
                    value={mode}
                    checked={comfort === mode}
                    onChange={() => setPreference("eyeComfort", mode)}
                  />
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </label>
              ))}
            </div>
          </fieldset>
          <p className="mt-4 text-sm text-secondary-text" aria-live="polite">
            Eye comfort is {comfortActive ? "on" : "off"}
          </p>
        </div>
      </dialog>
    </>
  );
}
