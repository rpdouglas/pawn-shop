# Plan: E26 · Versioning Strategy (CalVer + SHA)

**Status:** Awaiting Approval
**Strategy:** C — Recommended (Inject + Footer + Dashboard)
**Spec:** `docs/projects/E26_Versioning_Strategy.md`

---

## Context

Deployments currently produce no traceable version string. Staff cannot distinguish builds without digging into Git history. This plan injects a CalVer + Git SHA string (`vYY.MM.DD-shortsha`) automatically during GitHub Actions builds and surfaces it in two low-friction locations: the site footer (passive, always visible) and the Admin Dashboard subtitle (active, staff first-look).

---

## Persona Gate

- **Primary:** Staff (Developer) — zero-friction traceability, no manual `package.json` bumping
- **Secondary:** Jordan — version string in footer is a minor PWA maturity signal
- All other persona tests: N/A

---

## Files to Modify

| File | Change |
|---|---|
| `.github/workflows/deploy-dev.yml` | Add "Generate version" step before Build; pass `VITE_APP_VERSION` into Build env |
| `.github/workflows/deploy-prod.yml` | Same as above |
| `src/vite-env.d.ts` *(create)* | Declare `readonly VITE_APP_VERSION: string` in `ImportMetaEnv` |
| `src/App.tsx` | Append version to footer copyright line with local fallback |
| `src/pages/admin/DashboardPage.tsx` | Append version to "Live inventory snapshot" subtitle |

---

## Implementation Detail

### 1. Both workflow files — add before the Build step

```yaml
- name: Generate version
  if: steps.check.outputs.skip != 'true'
  run: echo "VITE_APP_VERSION=v$(date +'%y.%m.%d')-$(git rev-parse --short HEAD)" >> $GITHUB_ENV
```

Then in the Build step's `env:` block, add:

```yaml
VITE_APP_VERSION: ${{ env.VITE_APP_VERSION }}
```

### 2. Create `src/vite-env.d.ts`

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 3. `src/App.tsx` — footer (line 25–27)

```diff
- <p className="site-footer-copy">
-   © {new Date().getFullYear()} The Pawn Shop · Cornwall Island, Akwesasne
- </p>
+ <p className="site-footer-copy">
+   © {new Date().getFullYear()} The Pawn Shop · Cornwall Island, Akwesasne
+   {' · '}{import.meta.env.VITE_APP_VERSION || 'v0.0.0-local'}
+ </p>
```

### 4. `src/pages/admin/DashboardPage.tsx` — subtitle (line 173)

```diff
- Live inventory snapshot · The Pawn Shop
+ Live inventory snapshot · The Pawn Shop · {import.meta.env.VITE_APP_VERSION || 'v0.0.0-local'}
```

---

## Verification

1. `npm run build` — zero TypeScript errors (new `vite-env.d.ts` types must resolve cleanly)
2. Local dev: footer and dashboard subtitle both show `v0.0.0-local`
3. Post-deploy (CI): footer and dashboard subtitle show e.g. `v26.05.21-a1b2c3d`
4. Log decision in `docs/DECISIONS.md`

---

## Anti-Regression Checklist

- [x] No hardcoded hex/px values — version text uses existing muted copy styles (no new tokens needed)
- [x] No Firestore field invention — no Firestore involvement
- [x] No client-side AI keys
- [x] No PII — version string is build metadata only
- [x] No unapproved motion
- [x] Brand voice — version string is muted, technical, appropriate for staff context

---

*The Pawn Shop · docs/plans/E26_Versioning_Strategy_PLAN.md*
