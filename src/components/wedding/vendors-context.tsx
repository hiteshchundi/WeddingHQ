"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { weddingFixture, type WeddingVendor } from "../../fixtures/wedding";

const VendorsContext = createContext<{
  vendors: WeddingVendor[];
  saveVendor: (vendor: WeddingVendor) => void;
} | null>(null);

// Shared only so new/edited vendors remain selectable in Expenses while moving
// through organiser routes. This is local prototype state, reset on reload.
export function WeddingVendorsProvider({ children }: { children: ReactNode }) {
  const [vendors, setVendors] = useState(weddingFixture.vendors);
  function saveVendor(vendor: WeddingVendor) {
    setVendors((current) => current.some((item) => item.id === vendor.id)
      ? current.map((item) => item.id === vendor.id ? vendor : item) : [...current, vendor]);
  }
  return <VendorsContext.Provider value={{ vendors, saveVendor }}>{children}</VendorsContext.Provider>;
}

export function useWeddingVendors() {
  const context = useContext(VendorsContext);
  if (!context) throw new Error("WeddingVendorsProvider is required.");
  return context;
}
