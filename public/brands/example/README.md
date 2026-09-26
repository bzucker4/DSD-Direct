# Example brand (sample only)

Fictional "Acme Beverage" brand used to demonstrate white-labelling. Not a real client.
Build with it:

```bash
VITE_BRAND_SLUG=example VITE_BRAND_PRODUCT_NAME="Acme Route" VITE_BRAND_COMPANY_NAME="Acme Beverage" \
VITE_BRAND_PRIMARY_COLOR="#c2410c" VITE_BRAND_ACCENT_COLOR="#7c2d12" VITE_BRAND_LOGO_URL=logo.svg \
VITE_BRAND_DC_NAME="Buffalo DC" VITE_BRAND_ROUTE_LABEL="Route 3" VITE_BRAND_SUPPORT_EMAIL=help@acme.example \
VITE_BRAND_SHOW_DEMO_BANNER=false npm run build
```

Files: favicon.svg (browser tab), pwa-192.png / pwa-512.png (PWA + apple-touch icons,
rendered from the .svg sources), logo.svg (VITE_BRAND_LOGO_URL=logo.svg).
