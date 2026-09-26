/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // White-label branding (all optional; see src/config/brand.core.ts and .env.example)
  readonly VITE_BRAND_SLUG?: string
  readonly VITE_BRAND_PRODUCT_NAME?: string
  readonly VITE_BRAND_SHORT_NAME?: string
  readonly VITE_BRAND_COMPANY_NAME?: string
  readonly VITE_BRAND_TAGLINE?: string
  readonly VITE_BRAND_NAV_TAGLINE?: string
  readonly VITE_BRAND_HEADLINE?: string
  readonly VITE_BRAND_DESCRIPTION?: string
  readonly VITE_BRAND_META_DESCRIPTION?: string
  readonly VITE_BRAND_DC_NAME?: string
  readonly VITE_BRAND_ROUTE_LABEL?: string
  readonly VITE_BRAND_LOGO_TEXT?: string
  readonly VITE_BRAND_LOGO_URL?: string
  readonly VITE_BRAND_FAVICON?: string
  readonly VITE_BRAND_PRIMARY_COLOR?: string
  readonly VITE_BRAND_ACCENT_COLOR?: string
  readonly VITE_BRAND_BACKGROUND_COLOR?: string
  readonly VITE_BRAND_SUPPORT_EMAIL?: string
  readonly VITE_BRAND_SHOW_DEMO_BANNER?: string
  readonly VITE_BRAND_DEMO_EMAIL_DOMAIN?: string
  readonly [key: string]: string | boolean | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
