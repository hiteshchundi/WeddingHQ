"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useId, useRef } from "react";
import { IconButton } from "../ui/icon-button";
import { AppearancePreferences } from "./appearance-preferences";

export function AppearanceControl() {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();

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
          <AppearancePreferences />
        </div>
      </dialog>
    </>
  );
}
