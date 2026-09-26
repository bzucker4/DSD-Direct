// White-label brand config: pure helpers shared by the app (src/config/brand.ts) and the
// build (vite.config.ts / vite-plugin-brand.ts). No imports and no import.meta here, so
// this file runs both in the browser bundle and in Node at build time.
//
// Every value comes from a VITE_BRAND_* env var; the defaults are the stock
// DSD Direct / Demo Beverage Distributing branding. See .env.example and docs/WHITE_LABEL.md.

export interface BrandPalette {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
}

export interface BrandConfig {
  /** Folder under public/brands/ holding this client's assets. */
  slug: string
  /** App name: login heading, sidebar, document title, PWA name. */
  productName: string
  /** PWA short_name and iOS home-screen title. */
  shortName: string
  /** Client / distributor name shown next to the product name. */
  companyName: string
  /** Login subtitle and document title suffix. */
  tagline: string
  /** Shorter tagline under the product name in the sidebar. */
  navTagline: string
  /** Sentence in the top header bar. */
  headline: string
  /** PWA manifest description. */
  description: string
  /** <meta name="description">. */
  metaDescription: string
  /** Distribution center label (header, sidebar, dashboard). */
  dcName: string
  /** Route label shown next to the DC in the header. */
  routeLabel: string
  /** Initials in the square logo badge when no logo image is set. */
  logoText: string
  /** Logo image URL ('' = use the initials badge). */
  logoUrl: string
  /** Favicon URL. */
  faviconUrl: string
  /** PWA / apple-touch icons. */
  icon192Url: string
  icon512Url: string
  /** Main brand color (buttons, links, active nav) = palette 600. */
  primaryColor: string
  /** Darker accent (logo gradient end, browser theme-color) = palette 800. */
  accentColor: string
  /** Page / PWA splash background. */
  backgroundColor: string
  /** Full 50-900 scale behind the Tailwind brand-* classes. */
  palette: BrandPalette
  /** Support contact shown on login + account pages ('' = hidden). */
  supportEmail: string
  /** Show the demo-account banner, demo notices and the login demo-account picker. */
  showDemoBanner: boolean
  /** Email domain of the demo accounts (e.g. warehouse@<domain>). */
  demoEmailDomain: string
}

export type BrandEnv = Record<string, string | boolean | undefined>

export const DEFAULT_PRIMARY = '#2563eb'
export const DEFAULT_ACCENT = '#1e40af'

/** Tailwind "blue" — the original look. Used verbatim when the default colors are kept. */
export const DEFAULT_PALETTE: BrandPalette = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
}

function str(env: BrandEnv, key: string, fallback: string): string {
  const v = env[key]
  if (typeof v !== 'string') return fallback
  const t = v.trim()
  return t === '' ? fallback : t
}

function bool(env: BrandEnv, key: string, fallback: boolean): boolean {
  const v = env[key]
  if (typeof v === 'boolean') return v
  if (typeof v !== 'string' || v.trim() === '') return fallback
  return ['1', 'true', 'yes', 'on'].includes(v.trim().toLowerCase())
}

function normalizeHex(value: string, fallback: string): string {
  const v = value.trim().toLowerCase()
  if (/^#[0-9a-f]{6}$/.test(v)) return v
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(v)
  if (short) return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`
  return fallback
}

function mix(a: string, b: string, weightOfB: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return (
    '#' +
    pa
      .map((c, i) => Math.round(c + (pb[i] - c) * weightOfB))
      .map((c) => c.toString(16).padStart(2, '0'))
      .join('')
  )
}

/** Build a 50-900 scale from the two brand colors (600 = primary, 800 = accent). */
export function buildPalette(primary: string, accent: string): BrandPalette {
  if (primary === DEFAULT_PRIMARY && accent === DEFAULT_ACCENT) return { ...DEFAULT_PALETTE }
  const white = '#ffffff'
  return {
    50: mix(primary, white, 0.94),
    100: mix(primary, white, 0.86),
    200: mix(primary, white, 0.74),
    300: mix(primary, white, 0.56),
    400: mix(primary, white, 0.34),
    500: mix(primary, white, 0.14),
    600: primary,
    700: mix(primary, accent, 0.5),
    800: accent,
    900: mix(accent, '#000000', 0.25),
  }
}

/** Resolve a brand asset: absolute URLs / root paths are kept, bare file names live in /brands/<slug>/. */
export function brandAssetUrl(slug: string, value: string): string {
  if (value === '' || /^(https?:)?\/\//.test(value) || value.startsWith('/') || value.startsWith('data:')) {
    return value
  }
  return `/brands/${slug}/${value}`
}

export function resolveBrand(env: BrandEnv = {}): BrandConfig {
  const slug = str(env, 'VITE_BRAND_SLUG', 'default').replace(/[^a-z0-9-_]/gi, '') || 'default'
  const productName = str(env, 'VITE_BRAND_PRODUCT_NAME', 'DSD Direct')
  const companyName = str(env, 'VITE_BRAND_COMPANY_NAME', 'Demo Beverage Distributing')
  const primaryColor = normalizeHex(str(env, 'VITE_BRAND_PRIMARY_COLOR', DEFAULT_PRIMARY), DEFAULT_PRIMARY)
  const accentColor = normalizeHex(str(env, 'VITE_BRAND_ACCENT_COLOR', DEFAULT_ACCENT), DEFAULT_ACCENT)
  const initials = productName
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return {
    slug,
    productName,
    shortName: str(env, 'VITE_BRAND_SHORT_NAME', productName),
    companyName,
    tagline: str(env, 'VITE_BRAND_TAGLINE', 'Warehouse & Field Sales'),
    navTagline: str(env, 'VITE_BRAND_NAV_TAGLINE', 'WMS + Field Sales'),
    headline: str(env, 'VITE_BRAND_HEADLINE', 'Functional & modern warehouse + field sales for DSD distributors'),
    description: str(env, 'VITE_BRAND_DESCRIPTION', 'Warehouse WMS + field sales for DSD distributors'),
    metaDescription: str(
      env,
      'VITE_BRAND_META_DESCRIPTION',
      `${productName} — Warehouse WMS + field sales for ${companyName} DSD distributors`,
    ),
    dcName: str(env, 'VITE_BRAND_DC_NAME', 'Rochester DC'),
    routeLabel: str(env, 'VITE_BRAND_ROUTE_LABEL', 'Route 12'),
    logoText: str(env, 'VITE_BRAND_LOGO_TEXT', initials || 'DD').slice(0, 3),
    logoUrl: brandAssetUrl(slug, str(env, 'VITE_BRAND_LOGO_URL', '')),
    faviconUrl: brandAssetUrl(slug, str(env, 'VITE_BRAND_FAVICON', 'favicon.svg')),
    icon192Url: brandAssetUrl(slug, 'pwa-192.png'),
    icon512Url: brandAssetUrl(slug, 'pwa-512.png'),
    primaryColor,
    accentColor,
    backgroundColor: normalizeHex(str(env, 'VITE_BRAND_BACKGROUND_COLOR', '#f8fafc'), '#f8fafc'),
    palette: buildPalette(primaryColor, accentColor),
    supportEmail: str(env, 'VITE_BRAND_SUPPORT_EMAIL', ''),
    showDemoBanner: bool(env, 'VITE_BRAND_SHOW_DEMO_BANNER', true),
    demoEmailDomain: str(env, 'VITE_BRAND_DEMO_EMAIL_DOMAIN', 'dsddirect.demo').replace(/^@/, ''),
  }
}

/** CSS custom properties consumed by the Tailwind brand-* colors (see src/index.css). */
export function brandCssVars(b: BrandConfig): string {
  const scale = (Object.keys(b.palette) as unknown as (keyof BrandPalette)[])
    .map((k) => `--brand-${k}:${b.palette[k]}`)
    .join(';')
  return `:root{--brand-primary:${b.primaryColor};--brand-accent:${b.accentColor};--brand-bg:${b.backgroundColor};${scale}}`
}
