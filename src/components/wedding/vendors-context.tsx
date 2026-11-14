"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { weddingFixture, type WeddingVendor } from "../../fixtures/wedding";
import type { VendorDTO } from "../../types/finance";
import { saveResource } from "../../lib/api-client";

export function vendorView(row: VendorDTO): WeddingVendor {
  return { ...row, contact: { person: row.contact.person ?? "", phone: row.contact.phone ?? "", email: row.contact.email ?? "" }, notes: row.notes ?? "" };
}

const VendorsContext = createContext<{
  vendors: WeddingVendor[];
  saveVendor: (vendor: WeddingVendor) => Promise<void>;
} | null>(null);

// Shared only so new/edited vendors remain selectable in Expenses while moving
// through organiser routes. This is local prototype state, reset on reload.
export function WeddingVendorsProvider({ children, weddingId, initialVendors }: { children: ReactNode; weddingId?: string; initialVendors?: VendorDTO[] }) {
  const [vendors, setVendors] = useState(() => initialVendors ? initialVendors.map(vendorView) : weddingId ? [] : weddingFixture.vendors);
  async function saveVendor(vendor: WeddingVendor) {
    if (weddingId) {
      const { name, category, contact, eventIds, estimatedCostMinor, actualCostMinor, currency, responsibleMembershipId, status, notes } = vendor;
      const existing = vendors.some((row) => row.id === vendor.id);
      vendor = vendorView(await saveResource<VendorDTO>(`/api/v1/weddings/${weddingId}/vendors${existing ? `/${vendor.id}` : ""}`, existing ? "PATCH" : "POST", { name, category, contact: { person: contact.person || null, phone: contact.phone || null, email: contact.email || null }, eventIds, estimatedCostMinor, actualCostMinor, currency, responsibleMembershipId, status, notes }));
    }
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
