const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
type UtmKey = (typeof UTM_KEYS)[number];
export type UtmParams = Partial<Record<UtmKey, string>>;

const SESSION_KEY = 'pawn_shop_utm';

// Call once on first page load to capture UTM params from the landing URL.
// Params are written to sessionStorage and never sent to Firestore or auditLogs.
export function captureUtm(): void {
  const params = new URLSearchParams(window.location.search);
  const captured: UtmParams = {};
  for (const key of UTM_KEYS) {
    const val = params.get(key);
    if (val) captured[key] = val;
  }
  if (Object.keys(captured).length === 0) return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(captured));
  } catch {
    // sessionStorage blocked (private browsing) — proceed without UTM capture
  }
}

export function getUtm(): UtmParams {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as UtmParams) : {};
  } catch {
    return {};
  }
}
