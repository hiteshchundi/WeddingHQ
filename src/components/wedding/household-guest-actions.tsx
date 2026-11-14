"use client";
import { useState } from "react";
import { saveResource } from "../../lib/api-client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
export function HouseholdGuestActions({ weddingId, householdId, email, onRefresh }: { weddingId: string; householdId: string; email: string; onRefresh: () => Promise<void> }) {
  const [pending, setPending] = useState(false), [message, setMessage] = useState(""), [error, setError] = useState(""), [link, setLink] = useState("");
  async function generate(sendEmail: boolean) {
    setPending(true); setLink(""); setError(""); setMessage("");
    try {
      const result = await saveResource<{ emailSent: boolean; guestUrl?: string }>(`/api/v1/weddings/${weddingId}/households/${householdId}/guest-link/regenerate`, "POST", { sendEmail, showLink: !sendEmail });
      setLink(result.guestUrl ?? ""); setMessage(sendEmail ? "Invitation email sent. The previous link and guest sessions are no longer valid." : "New private link created. The previous link and guest sessions are no longer valid.");
      await onRefresh();
    } catch (error) { setError(error instanceof Error ? error.message : "The invitation could not be prepared."); }
    finally { setPending(false); }
  }
  return <section aria-label="Guest access" className="space-y-3">
    <div className="flex flex-wrap gap-3"><Button disabled={pending || !email} onClick={() => generate(true)}>Send invitation</Button>
      {process.env.NODE_ENV !== "production" ? <Button variant="secondary" disabled={pending} onClick={() => generate(false)}>Generate / regenerate private link</Button> : null}
      <Button variant="secondary" disabled={pending} onClick={async () => { setPending(true); setLink(""); setError(""); try { await saveResource(`/api/v1/weddings/${weddingId}/households/${householdId}/guest-link/revoke`, "POST", {}); setMessage("Guest access revoked. Existing guest sessions are invalid."); await onRefresh(); } catch (error) { setError(error instanceof Error ? error.message : "Guest access could not be revoked."); } finally { setPending(false); } }}>Revoke guest link</Button>
    </div>
    <p className="text-sm text-secondary-text">Every send or regeneration replaces the previous private link. The development email sender can deliver only to the Resend account owner.</p>
    {pending ? <p role="status">Updating guest access…</p> : null}{message ? <p role="status">{message}</p> : null}{error ? <p role="alert">{error}</p> : null}
    {link ? <div className="space-y-3"><Input id="fresh-guest-link" label="New private link — shown only now" readOnly value={link} /><p className="text-sm">Keep this link private. It disappears when you close this household.</p><div className="flex gap-3"><Button variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(link); setMessage("Private link copied."); } catch { setError("Select the new link to copy it manually."); } }}>Copy private link</Button><Button variant="tertiary" onClick={() => setLink("")}>Hide link</Button></div></div> : null}
  </section>;
}
