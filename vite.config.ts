import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { resolveBrand } from './src/config/brand.core.ts'
import { brandHtmlPlugin, checkBrandAssets } from './vite-plugin-brand.ts'

export default defineConfig(({ mode }) => {
  // VITE_BRAND_* from .env files or the host environment (Netlify site env vars).
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const brand = checkBrandAssets(resolveBrand(env), path.resolve('public'), (m) => console.warn(m))
  const rel = (url: string) => url.replace(/^\//, '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      brandHtmlPlugin(brand),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: brand.productName,
          short_name: brand.shortName,
          description: brand.description,
          theme_color: brand.accentColor,
          background_color: brand.backgroundColor,
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          icons: [
            { src: rel(brand.icon192Url), sizes: '192x192', type: 'image/png' },
            { src: rel(brand.icon512Url), sizes: '512x512', type: 'image/png' },
            { src: rel(brand.icon512Url), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          navigateFallback: '/index.html',
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          // Only precache the active brand's assets.
          globIgnores: [`brands/!(${brand.slug})/**`],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
  }
})
