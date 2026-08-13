/**
 * Literal color values for contexts that cannot consume a CSS custom property:
 * SVG `fill` attributes, a `<meta content>` string, and a third-party library's
 * color option. Centralized here (Decision 0051) so "is this hardcoded hex
 * approved" is a one-file check instead of a codebase grep. Keep in sync with
 * the equivalent values in src/index.css.
 */

/** YouTube brand-mark SVG — must stay YouTube red/white regardless of view theme. */
export const YOUTUBE_BRAND_COLORS = {
  playButtonRed: '#f00',
  playButtonWhite: '#fff',
} as const

/** <meta name="theme-color"> per view — mirrors --color-primary in src/index.css. Views without an entry (e.g. tobacco) fall back to VIEW_META_THEME_COLORS.pawn. */
export const VIEW_META_THEME_COLORS: Record<'pawn' | 'cannabis' | 'fireworks', string> = {
  pawn: '#C8A14A',
  cannabis: '#7B4FA0',
  fireworks: '#C0392B',
}

/** QR code generator contrast pair — literal values required by the `qrcode` library's color option, tuned for scan reliability rather than view theme. Mirrors Pawn --color-bg/--color-text. */
export const QR_CODE_COLORS = {
  dark: '#080706',
  light: '#F5F0E8',
} as const
