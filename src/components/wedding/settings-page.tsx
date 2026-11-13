import { PageHeader } from "../layout/page-header";
import { AppearancePreferences } from "../theme/appearance-preferences";
import { Card } from "../ui/card";
import { SettingsTeam } from "./settings-team";
import { WeddingDetailsForm } from "./wedding-details-form";
import type { WeddingDTO } from "../../types/wedding";

export function SettingsPage({ wedding }: { wedding?: WeddingDTO }) {
  return (
    <>
      <PageHeader title="Settings" />
      <main id="organiser-content" tabIndex={-1} className="organiser-content space-y-6">
        <p className="text-sm text-secondary-text">{wedding ? "Wedding details are saved to your wedding. Team is still prototype data and resets on reload." : "Wedding details and team changes are local demo data and reset on reload."} Appearance preferences are saved in this browser.</p>
        <nav aria-label="Settings sections" className="flex flex-wrap gap-x-6 gap-y-2">
          {[["wedding-details", "Wedding details"], ["team", "Team"], ["appearance", "Appearance"]].map(([id, label]) => <a key={id} href={`#settings-${id}`} className="inline-flex min-h-[44px] items-center font-semibold underline underline-offset-4">{label}</a>)}
        </nav>
        <section id="settings-wedding-details" aria-labelledby="settings-wedding-title" className="scroll-mt-6">
          <Card className="space-y-6"><h2 id="settings-wedding-title" className="text-2xl font-semibold">Wedding details</h2><WeddingDetailsForm wedding={wedding} /></Card>
        </section>
        <section id="settings-team" aria-labelledby="settings-team-title" className="scroll-mt-6"><Card><SettingsTeam /></Card></section>
        <section id="settings-appearance" aria-labelledby="settings-appearance-title" className="scroll-mt-6">
          <Card><h2 id="settings-appearance-title" className="text-2xl font-semibold">Appearance</h2><p className="mt-4 text-sm text-secondary-text">Eye comfort uses warmer colours and softer surfaces for evening use.</p><AppearancePreferences /></Card>
        </section>
      </main>
    </>
  );
}
