# DSD Direct

Functional & modern **warehouse + field sales** app for Direct Store Delivery (DSD) distributors.

SPA built with **Vite · React · TypeScript · Tailwind CSS · React Router · Supabase · PWA**.

Demo catalog is modeled on **Wright Beverage Distributing** (wrightbev.com) — Upstate NY beer, cider, hard tea, hard seltzer, and NA beverage portfolio.

## Auth & roles

Authentication is **required**. After login, role comes from JWT `app_metadata.role`:

| Role | Access |
|------|--------|
| `admin` | All warehouse + field routes, CSV import |
| `warehouse` | Dashboard, inventory, receiving, cycle counting, slotting, palletization, import (+ field routes) |
| `field_rep` | Dashboard, catalog, surveys, POS, planogram, account settings — **no** receiving / cycle-counting / slotting / import |

### Inviting pilot users

1. Open [Supabase Auth → Users](https://supabase.com/dashboard/project/jdtdtuioenznqyipngvw/auth/users).
2. Invite or create the user with email/password.
3. Set raw `app_metadata` JSON, e.g. `{ "role": "field_rep" }` (`admin` | `warehouse` | `field_rep`).
4. Share credentials out-of-band; user can change password under **Account** in the app.

### Demo users (pilot / UAT only)

Password for all: `DemoPass123!`

| Email | Role |
|-------|------|
| `warehouse@dsddirect.demo` | warehouse |
| `field@dsddirect.demo` | field_rep |
| `admin@dsddirect.demo` | admin |

Login keeps demo accounts collapsed under **Pilot mode**. The app shows a warning banner for `@dsddirect.demo` emails: *Demo account — replace before production*.

### Pilot Auth hardening (dashboard — document only)

In the Supabase project dashboard:

1. **Authentication → Providers → Email** — confirm email provider settings for pilot invites.
2. **Authentication → Attack Protection** — enable **Leaked password protection** (HaveIBeenPwned).
3. Prefer disabling or rotating demo users before production cutover.
4. Never put the **service role** key in the frontend or Netlify public env — anon key + RLS + JWT roles only.

## Supabase

| Setting | Value |
|---------|-------|
| URL | `https://jdtdtuioenznqyipngvw.supabase.co` |
| Anon key | `VITE_SUPABASE_ANON_KEY` in `.env` (client-safe) |

```
VITE_SUPABASE_URL=https://jdtdtuioenznqyipngvw.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

### Notable RPCs & tables

- `receive_inventory(...)` → lot id
- `allocate_fefo_pick(...)` → allocations jsonb
- `resolve_customer_price(p_customer_id, p_product_id)` → numeric
- Tables: `customer_prices`, `import_batches`, `inventory_movements`, `order_history`, plus products, lots, POs, etc.

## Modules

### Warehouse (WMS)
- **Dashboard** — KPIs, FEFO alerts, recent `inventory_movements`
- **Inventory & Lots** — lot list + server FEFO allocate
- **Receiving & Put-away** — `receive_inventory` RPC
- **Cycle counting** — zone/aisle counts with variance
- **Slotting** — location occupancy map + SKU assignment
- **Palletization & Load Optimization** — route-sequenced pallet heuristic
- **CSV Import** — products / customers / prices + account price overrides

### Field Sales
- **Digital Catalog & Order Entry** — `resolve_customer_price`, account vs tier badges, cart submit
- **RED Surveys** — shelf / cooler / tap questionnaire
- **POS Management** — collateral request + status workflow
- **Planogram** — mobile-friendly shelf editor

### Account
- Sign out, role display, change password (`supabase.auth.updateUser`)

## CSV templates

Downloadable from `/templates/` (also linked on Import):

- `products.csv` — sku,name,category,brand,unit,case_pack,weight_lbs,height_in,par_level,base_price
- `customers.csv` — account_number,name,type,address,city,price_tier
- `prices.csv` — account_number,sku,unit_price,effective_from(optional)

New rows get ids like `p_<sku>` / `c_<account>` when inserted.

## Pilot docs

- [`docs/UAT.md`](docs/UAT.md) — 15 UAT scenarios with pass/fail checkboxes
- [`docs/PILOT_CHECKLIST.md`](docs/PILOT_CHECKLIST.md) — definition of done

## PWA

Installable via `vite-plugin-pwa`:

- Web app manifest + 192/512 icons
- Theme color `#1e40af`
- Service worker caches the offline shell (navigate fallback to `index.html`)

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

## Production notes

- Layout shows **Live · Authenticated** when signed in; demo emails get a warning banner.
- Do not expose the service role key in the frontend.
- Seed helpers may insert demo cycle counts / pick orders / surveys when those tables are empty (authenticated).
- Run UAT before pilot handoff; replace demo accounts before production.
