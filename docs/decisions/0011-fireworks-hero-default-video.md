# Decision 0011 — E103 Fireworks Hero: Default Video ID Constant + Firestore Override

**Date:** 2026-06-09
**Epic:** E103 · Fireworks Hero Video
**Cycle:** 32
**Status:** Implemented & Closed

---

## Context

The E102 hero media system routes all YouTube video IDs through `config/shopInfo.heroData.{view}.youtubeId` in Firestore. This is correct for staff-configurable content — but it creates a dependency: the video never appears until an admin manually writes the `heroData.fireworks` document via the Firebase console.

For the Fireworks hero, there is a specific known video (`8rmpm3ZOn50`) that should always be present. Waiting for a Firestore write before the video appears is friction with no benefit.

---

## Decision

Bake `const DEFAULT_VIDEO_ID = '8rmpm3ZOn50'` into `FireworksHero.tsx` as a fallback, while preserving full Firestore override capability via `useHeroMedia('fireworks')`.

Resolution order:
1. `heroData.fireworks.mediaType === 'none'` → suppress video entirely (staff can turn it off)
2. `heroData.fireworks.mediaType === 'youtube'` with a valid ID → use that ID (staff override)
3. Firestore unconfigured or any other state → use `DEFAULT_VIDEO_ID`

---

## Rationale

1. **Immediate visibility.** Video appears on deploy with zero Firestore setup. No admin action required.
2. **Graceful override preserved.** The E102 `useHeroMedia` system is fully respected — staff can swap the video or suppress it via the Firebase console without a code deploy.
3. **Explicit suppression path.** `mediaType: 'none'` gives staff a clean escape hatch if the video should be removed for a season.
4. **Minimum scope.** One constant, one IIFE to resolve priority, zero new files.

---

## Alternatives Rejected

| Option | Rejection Reason |
|--------|----------------|
| Pure Firestore (no default) | Video never appears until admin writes the document. Two-step friction with no UX benefit since the video is a known, stable asset. |
| Hardcode unconditionally (ignore Firestore) | Breaks E102's staff-configurable architecture. Staff lose the ability to swap or suppress without a code deploy. |

---

## Compliance Notes

- `youtube-nocookie.com` embed domain — no third-party cookies, no autoplay.
- `YouTubeFacade` component shows a static thumbnail + play button; iframe not loaded until user interaction.
- No PII involved. No `auditLogs` required.

---

## Files Changed

- `src/components/fireworks/FireworksHero.tsx`

---

*The Pawn Shop · docs/decisions/0011-fireworks-hero-default-video.md · 2026-06-09*
