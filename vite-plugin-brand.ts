// Build-time white-labelling: resolves the brand from VITE_BRAND_* env vars, checks the
// brand's asset folder (public/brands/<slug>/), fills the %BRAND_*% tokens in index.html
// and injects the brand color CSS variables. The PWA manifest is generated from the same
// config in vite.config.ts.
import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { brandCssVars, type BrandConfig } from './src/config/brand.core.ts'

const REQUIRED_ASSETS = ['faviconUrl', 'icon192Url', 'icon512Url'] as const

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function mimeFor(url: string): string {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase()
  if (ext === 'svg') return 'image/svg+xml'
  if (ext === 'ico') return 'image/x-icon'
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'webp') return 'image/webp'
  return 'image/png'
}

/**
 * Point missing favicon/icons at the default brand (with a warning) and fail on a missing
 * logo file, so a half-configured brand folder is noticed at build time. Mutates `brand`.
 */
export function checkBrandAssets(brand: BrandConfig, publicDir: string, warn: (msg: string) => void): BrandConfig {
  const local = (url: string) => url.startsWith('/brands/')
  const exists = (url: string) => fs.existsSync(path.join(publicDir, url))
  for (const key of REQUIRED_ASSETS) {
    const url = brand[key]
    if (local(url) && !exists(url)) {
      const fallback = url.replace(`/brands/${brand.slug}/`, '/brands/default/')
      warn(`[brand] ${url} not found; using ${fallback}`)
      brand[key] = fallback
    }
  }
  if (brand.logoUrl && local(brand.logoUrl) && !exists(brand.logoUrl)) {
    throw new Error(`[brand] VITE_BRAND_LOGO_URL points to ${brand.logoUrl}, which does not exist in public/`)
  }
  return brand
}

export function brandHtmlPlugin(brand: BrandConfig): Plugin {
  const tokens: Record<string, string> = {
    BRAND_TITLE: `${brand.productName} — ${brand.tagline}`,
    BRAND_SHORT_NAME: brand.shortName,
    BRAND_META_DESCRIPTION: brand.metaDescription,
    BRAND_THEME_COLOR: brand.accentColor,
    BRAND_FAVICON: brand.faviconUrl,
    BRAND_FAVICON_TYPE: mimeFor(brand.faviconUrl),
    BRAND_APPLE_TOUCH_ICON: brand.icon192Url,
  }
  return {
    name: 'dsd-brand-html',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const out = html.replace(/%(BRAND_[A-Z0-9_]+)%/g, (m, key: string) =>
          key in tokens ? escapeHtml(tokens[key]) : m,
        )
        const left = out.match(/%BRAND_[A-Z0-9_]+%/)
        if (left) throw new Error(`[brand] unknown token ${left[0]} in index.html`)
        return {
          html: out,
          tags: [{ tag: 'style', attrs: { id: 'brand-vars' }, children: brandCssVars(brand), injectTo: 'head' }],
        }
      },
    },
  }
}
