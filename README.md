# DSD Direct

Functional & modern **warehouse + field sales** app for Direct Store Delivery (DSD) distributors.

SPA built with **Vite · React · TypeScript · Tailwind CSS · React Router · Supabase · PWA**.

Demo catalog is modeled on **Wright Beverage Distributing** (wrightbev.com) — Upstate NY beer, cider, hard tea, hard seltzer, and NA beverage portfolio.

## Auth & roles

Authentication is **required**. Open anon RLS has been removed. After login, role comes from JWT `app_metadata.role`:

| Role | Access |
|------|--------|
| `admin` | All warehouse + field routes |
| `warehouse` | Dashboard, inventory, receiving, cycle counting, slotting, palletization (+ field routes) |
| `field_rep` | Dashboard, catalog, surveys, POS, planogram |

### Demo users

Password for all: `DemoPass123!`

| Email | Role |
|-------|------|
| `warehouse@dsddirect.demo` | warehouse |
| `field@dsddirect.demo` | field_rep |
| `admin@dsddirect.demo` | admin |

## Supabase

| Setting | Value |
|---------|-------|
| URL | `https://jdtdtuioenznqyipngvw.supabase.co` |
| Anon key | `VITE_SUPABASE_ANON_KEY` in `.env` (client-safe) |

Set both in Netlify (or local `.env`):

```
VITE_SUPABASE_URL=https://jdtdtuioenznqyipngvw.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

### Notable RPCs & tables

- `receive_inventory(p_product_id, p_location_id, p_qty, p_lot_code, p_expiration_date, p_code_date, p_po_id)` → lot id
- `allocate_fefo_pick(p_product_id, p_qty, p_reference_id)` → allocations jsonb
- Tables: `inventory_movements`, `order_history` (plus existing products, lots, POs, etc.)

Queries run as the authenticated session (supabase-js attaches the JWT after login).

## Modules

### Warehouse (WMS)
- **Dashboard** — KPIs, FEFO alerts, recent `inventory_movements`
- **Inventory & Lots** — lot list + server FEFO allocate
- **Receiving & Put-away** — `receive_inventory` RPC
- **Cycle counting** — zone/aisle counts with variance
- **Slotting** — location occupancy map + SKU assignment
- **Palletization & Load Optimization** — route-sequenced pallet heuristic

### Field Sales
- **Digital Catalog & Order Entry** — inventory, pricing, cart; charts from `order_history`
- **RED Surveys** — shelf / cooler / tap questionnaire
- **POS Management** — collateral request + status workflow
- **Planogram** — mobile-friendly shelf editor

## PWA

Installable via `vite-plugin-pwa`:

- Web app manifest + 192/512 icons
- Theme color `#1e40af`
- Service worker caches the offline shell (navigate fallback to `index.html`)
- Field routes are mobile-friendly (viewport-fit, responsive layout)

## Local development

```bash
npm install
cp .env.example .env   # or ensure .env has VITE_SUPABASE_* 
npm run dev
```

```bash
npm run build    # production build → dist/
npm run preview  # preview production build
```

## Netlify deploy

`netlify.toml` is included:

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Publish directory | `dist` |
| SPA redirect | `/*` → `/index.html` (200) |

**Required env vars on Netlify:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

Deploy options:
1. Connect the Git repo in Netlify (settings from `netlify.toml`).
2. Or CLI: `npx netlify deploy --prod --dir=dist` after `npm run build`.

## Production notes

- Layout shows **Live · Authenticated** when signed in.
- Do not expose the service role key in the frontend — anon key + RLS + JWT roles only.
- Seed helpers may insert demo cycle counts / pick orders / surveys when those tables are empty (authenticated).
- Package a release zip from `dist/` after a successful build if shipping static assets manually.
