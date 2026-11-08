const preferenceEvent = "wedding-hq:preferences";

// Runs before paint. Only validated browser preferences reach root attributes.
export const preferenceBootstrap = `(() => {
  const root = document.documentElement;
  const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const theme = read("wedding-hq.theme");
  const comfort = read("wedding-hq.eyeComfort");
  if (["light", "dark", "system"].includes(theme)) root.dataset.theme = theme;
  if (["off", "on", "auto"].includes(comfort)) root.dataset.eyeComfort = comfort;
  root.dataset.sidebarCollapsed = String(read("wedding-hq.sidebarCollapsed") === "true");
  const hour = new Date().getHours();
  root.dataset.comfortPeriod = hour >= 19 || hour < 7 ? "night" : "day";
})();`;

export function subscribePreferences(onChange: () => void) {
  window.addEventListener(preferenceEvent, onChange);
  return () => window.removeEventListener(preferenceEvent, onChange);
}

export function notifyPreferences() {
  window.dispatchEvent(new Event(preferenceEvent));
}

export function appearanceSnapshot() {
  const { theme, eyeComfort, comfortPeriod } = document.documentElement.dataset;
  return `${theme || "system"}|${eyeComfort || "off"}|${comfortPeriod || "day"}`;
}

export function serverAppearanceSnapshot() {
  return "system|off|day";
}

export function sidebarSnapshot() {
  return document.documentElement.dataset.sidebarCollapsed === "true";
}

export function serverSidebarSnapshot() {
  return false;
}

export function setPreference(
  name: "theme" | "eyeComfort" | "sidebarCollapsed",
  value: string,
) {
  document.documentElement.dataset[name] = value;
  try {
    localStorage.setItem(`wedding-hq.${name}`, value);
  } catch {
    // Controls still work when browser storage is unavailable.
  }
  notifyPreferences();
}
