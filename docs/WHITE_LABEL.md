# White-label: new client checklist

DSD Direct is white-labelled as **one deployment per client**: every client gets its own
Supabase project (its own database, users and data) and its own Netlify site built from this
same repo. Everything client-specific in the UI comes from `VITE_BRAND_*` environment variables
plus an optional brand asset folder, so **adding a client needs no code edits**.

| Per client | Where |
|---|---|
| Database, auth users, data | New Supabase project (schema from `supabase/migrations/`) |
| Hosting, domain, HTTPS | New Netlify site linked to `bzucker4/DSD-Direct` (`main`) |
| Name, colors, labels, demo mode | Netlify env vars `VITE_BRAND_*` (full list below) |
| Favicon, PWA icons, logo | `public/brands/<slug>/` in this repo, selected by `VITE_BRAND_SLUG` |

Allow about an hour for a new client. Steps 1-4 are Supabase, 5 is the repo, 6-8 are Netlify, 9 is the smoke test.

---

## 1. Create the Supabase project

1. Supabase dashboard → **New project**. Name it `dsd-<client>` and pick the region closest to the
   client's warehouse. Generate a strong database password and store it in the password manager
   (the app never uses it).
2. Plan: the free plan allows only **2 active projects per organization** and pauses idle projects.
   Put production clients on a paid plan (or their own organization).
3. When the project is ready, open **Project Settings → API** and record:
   - Project URL `https://<ref>.supabase.co` → `VITE_SUPABASE_URL`
   - `anon` / publishable key → `VITE_SUPABASE_ANON_KEY`
   - Never copy the `service_role` / secret key anywhere near the frontend or Netlify.

## 2. Apply the schema (all migrations)

`supabase/migrations/` holds the complete schema, applied in filename order:

| File | What it does |
|---|---|
| `20260912000000_base_schema.sql` | Base schema: 20 tables, role helpers (`jwt_role`, `is_admin`, `is_warehouse`, `is_field`), RLS policies, `handle_new_user` trigger on `auth.users`, RPCs `receive_inventory`, `allocate_fefo_pick`, `resolve_customer_price`. Structure only, no data. |
| `20260926142232_per_account_planogram.sql` | `shelf_slots.customer_id` + `ensure_customer_planogram()` |
| `20260926142246_fefo_pick_decrements_location.sql` | FEFO picks also decrement location occupancy |
| `20260926143101_reset_customer_planogram.sql` | Per-command `shelf_slots` policies, template protection, `reset_customer_planogram()` |

**Option A: Supabase CLI (recommended, records migration history)**

```bash
npm i -g supabase            # or: brew install supabase/tap/supabase
supabase login
supabase link --project-ref <ref>      # asks for the database password
supabase db push                       # applies every file in supabase/migrations/ in order
```

**Option B: SQL editor.** Open each file above in filename order, paste it into
**SQL Editor → New query** and run it. Don't skip or reorder files.

Check the result in the SQL editor:

```sql
select
  (select count(*) from pg_tables where schemaname = 'public')                      as tables,     -- 20
  (select count(*) from pg_policies where schemaname = 'public')                    as policies,   -- 40
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public')                                                     as functions,  -- 12
  (select count(*) from pg_trigger where tgname = 'on_auth_user_created')           as auth_trigger; -- 1
```

## 3. Configure Auth

In the new project:

1. **Authentication → URL Configuration**: Site URL = the client's app URL (the Netlify URL for
   now, the custom domain after step 8). Add both to **Redirect URLs**.
2. **Authentication → Sign In / Providers → Email**: keep Email enabled and turn **off**
   "Allow new users to sign up". Users are invited by an admin, and roles come only from
   `app_metadata.role` (a self-signup would have no role and see nothing).
3. **Authentication → Attack Protection**: enable leaked-password protection.
4. Optional for production: custom SMTP (**Authentication → Emails → SMTP settings**) and
   client-branded email templates. These live in Supabase and are not driven by the env vars.

## 4. Create the first admin (and other users)

1. **Authentication → Users → Add user → Create new user**: email + password, tick
   **Auto Confirm User**.
2. Give it the admin role (SQL editor):

   ```sql
   update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'
     where email = 'ops@acme.example';
   update public.profiles set role = 'admin' where email = 'ops@acme.example';
   ```

   Roles: `admin` (everything), `warehouse` (warehouse + field pages), `field_rep` (field pages
   only). The role is read from the JWT, so it applies from the user's **next sign-in**.
3. Repeat for the other users with `warehouse` or `field_rep`.
4. Demo accounts (`warehouse@`, `field@`, `admin@` + `VITE_BRAND_DEMO_EMAIL_DOMAIN`) are
   only for pilots. For a production client, don't create them and set
   `VITE_BRAND_SHOW_DEMO_BANNER=false`.

### Load master data

- Sign in once as the admin: the app seeds the RED survey questions and the shared planogram
  template (empty slots until the client's products exist). The Wright demo cycle counts /
  pick orders / POS assets are only seeded when their demo locations/customers/products exist,
  so a new project stays clean.
- **CSV Import** page (admin/warehouse), in this order: products → customers → prices.
  Templates: `/templates/products.csv`, `/templates/customers.csv`, `/templates/prices.csv`.
- Warehouse locations and purchase orders have no importer yet; insert them in the SQL editor:

  ```sql
  insert into public.locations (id, zone, aisle, bay, level, slot, capacity_cases, temp_zone)
  values ('A-01-01-1', 'A', '01', '01', '1', 'A', 60, 'ambient');
  ```

## 5. Add the brand assets (repo)

1. Copy `public/brands/example/` to `public/brands/<slug>/` (lowercase, e.g. `acme`) and replace:

   | File | Size | Used for |
   |---|---|---|
   | `favicon.svg` | square SVG (or set `VITE_BRAND_FAVICON=favicon.png` / `.ico`) | browser tab |
   | `pwa-192.png` | 192×192 PNG | PWA icon, apple-touch-icon |
   | `pwa-512.png` | 512×512 PNG, artwork inside the centre 80% (it is also the maskable icon) | PWA icon / splash |
   | `logo.svg` (optional) | square SVG/PNG | login + sidebar mark, with `VITE_BRAND_LOGO_URL=logo.svg` |

   Without a logo file the app shows an initials badge (`VITE_BRAND_LOGO_TEXT`) in the brand
   colors. Missing favicon/icon files fall back to `public/brands/default/` with a build warning;
   a `VITE_BRAND_LOGO_URL` pointing at a missing file fails the build.
2. Commit and push to `main`. Brand folders are public files: nothing confidential in them.
   Every site ships all brand folders, but each site only references and precaches its own.

Preview a brand locally before touching Netlify:

```bash
VITE_BRAND_SLUG=acme VITE_BRAND_PRODUCT_NAME="Acme Route" VITE_BRAND_COMPANY_NAME="Acme Beverage" \
VITE_BRAND_PRIMARY_COLOR="#c2410c" VITE_BRAND_ACCENT_COLOR="#7c2d12" \
npx vite build --outDir dist-acme && npx vite preview --outDir dist-acme
```

## 6. Create the Netlify site

1. Netlify → **Add new site → Import an existing project → GitHub → `bzucker4/DSD-Direct`**,
   branch `main`. Build settings come from `netlify.toml` (`npm run build`, publish `dist`,
   SPA redirect); leave them as they are.
2. Before the first deploy (or redeploy afterwards), set the environment variables from step 7
   under **Site configuration → Environment variables**. `VITE_*` values are baked in at build
   time, so **any env var change needs a new deploy** (Deploys → Trigger deploy → Clear cache
   and deploy site).
3. Every push to `main` redeploys **every** client site. To hold a client on a release, point
   its site at a release branch instead.

## 7. Environment variables

Required:

| Variable | Example | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://abcdefghijklmnop.supabase.co` | the client's own project |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | anon / publishable key only |

Branding (all optional; unset or empty = default, which is the original DSD Direct look):

| Variable | Default | Acme example | Used for |
|---|---|---|---|
| `VITE_BRAND_SLUG` | `default` | `acme` | asset folder `public/brands/<slug>/` |
| `VITE_BRAND_PRODUCT_NAME` | `DSD Direct` | `Acme Route` | login heading, sidebar, `<title>`, PWA name |
| `VITE_BRAND_SHORT_NAME` | product name | `Acme Route` | PWA `short_name`, iOS home-screen title (≤ 12 chars) |
| `VITE_BRAND_COMPANY_NAME` | `Wright Beverage` | `Acme Beverage` | login subtitle, sidebar, dashboard, meta description |
| `VITE_BRAND_TAGLINE` | `Warehouse & Field Sales` | `Warehouse & Route Sales` | login subtitle, `<title>` suffix |
| `VITE_BRAND_NAV_TAGLINE` | `WMS + Field Sales` | `WMS + Route Sales` | sidebar under the product name |
| `VITE_BRAND_HEADLINE` | `Functional & modern warehouse + field sales for DSD distributors` | `Acme Beverage warehouse + route sales` | top header bar |
| `VITE_BRAND_DESCRIPTION` | `Warehouse WMS + field sales for DSD distributors` | `Acme warehouse + route sales` | PWA manifest description |
| `VITE_BRAND_META_DESCRIPTION` | `<product> — Warehouse WMS + field sales for <company> DSD distributors` | | `<meta name="description">` |
| `VITE_BRAND_DC_NAME` | `Rochester DC` | `Buffalo DC` | header, sidebar, dashboard subtitle |
| `VITE_BRAND_ROUTE_LABEL` | `Route 12` | `Route 3` | header, next to the DC |
| `VITE_BRAND_LOGO_TEXT` | initials of product name (`DD`) | `AR` | initials badge (max 3 chars) |
| `VITE_BRAND_LOGO_URL` | none (badge) | `logo.svg` | logo image; file in brand folder, `/path` or `https://` URL |
| `VITE_BRAND_FAVICON` | `favicon.svg` | `favicon.svg` | favicon; file in brand folder, `/path` or URL |
| `VITE_BRAND_PRIMARY_COLOR` | `#2563eb` | `#c2410c` | buttons, links, active nav (Tailwind `brand-600` / `brand-primary`) |
| `VITE_BRAND_ACCENT_COLOR` | `#1e40af` | `#7c2d12` | logo gradient end, browser + PWA `theme-color` (`brand-800` / `brand-accent`) |
| `VITE_BRAND_BACKGROUND_COLOR` | `#f8fafc` | `#f8fafc` | page + PWA splash background |
| `VITE_BRAND_SUPPORT_EMAIL` | none (hidden) | `help@acme.example` | "Need help?" on login, Support on Account page |
| `VITE_BRAND_SHOW_DEMO_BANNER` | `true` | `false` | demo-account banner, demo notices, login demo-account picker |
| `VITE_BRAND_DEMO_EMAIL_DOMAIN` | `dsddirect.demo` | `acme.demo` | which emails count as demo accounts |

The full 50-900 color scale behind the `brand-*` Tailwind classes is generated from the primary
and accent colors (600 = primary, 800 = accent). Keeping both defaults gives exactly the original
Tailwind blue scale. `.env.example` lists the same variables.

## 8. Custom domain + HTTPS

1. Netlify site → **Domain management → Add a domain** (e.g. `app.acmebev.com`).
2. At the client's DNS provider: a `CNAME` from `app` to `<site-name>.netlify.app`
   (for an apex domain use Netlify DNS, or an `ALIAS`/`ANAME` record, or `A 75.2.60.5`).
3. Wait for DNS to verify. Netlify then issues a Let's Encrypt certificate automatically
   (**HTTPS** section shows "Your site has HTTPS enabled"); HTTP redirects to HTTPS by default.
4. Back in Supabase (step 3), set Site URL / Redirect URLs to `https://app.acmebev.com`.

## 9. Smoke test

On the deployed URL, in a private window:

- [ ] Tab title is `<product> — <tagline>`, favicon is the client's, primary buttons use the client color.
- [ ] `https://<domain>/manifest.webmanifest` shows the client name, `theme_color` = accent color,
      and each icon URL (`/brands/<slug>/pwa-192.png`, `pwa-512.png`) loads with HTTP 200.
- [ ] Login page shows the client name/logo; no "Pilot mode — demo accounts" if demo mode is off.
- [ ] Sign in as the admin: dashboard loads (no "Could not load live data"), header shows the
      client DC/route, no demo banner for real accounts.
- [ ] CSV Import: import one product, then check the SQL editor:
      `select kind, success_count from import_batches order by created_at desc limit 1;`
- [ ] Warehouse user: receive a PO line, then a FEFO pick (`inventory_movements` gets a
      `receive` and a `pick` row).
- [ ] Field rep: no warehouse pages in the menu; submitting a catalog order works.
- [ ] Chrome DevTools → Application → Manifest shows it installable; the service worker is active.
- [ ] Account page → Supabase Auth link points at the client's project, not another client's.

## Existing reference project (dsd-direct, `jdtdtuioenznqyipngvw`)

`20260912000000_base_schema.sql` was exported from this project, which already has those objects
(it was built by six earlier migrations recorded as `20260912045727` … `20260912223513`).
**Don't run the base file there.** If you use the CLI against it, align the history first:

```bash
supabase migration repair --status reverted 20260912045727 20260912051357 20260912051411 20260912051447 20260912055239 20260912223513
supabase migration repair --status applied 20260912000000
```

## Keeping clients in sync

- Schema changes: `supabase migration new <name>`, commit, then apply the file to **every** client
  project (`supabase link --project-ref <ref> && supabase db push` per client). Keep a list of
  client project refs and Netlify sites next to this doc.
- Frontend changes deploy to all client sites on push to `main`.
- Branding rule for developers: no hardcoded brand names, DC/route labels or brand hex colors
  in the app. Use `brand` from `src/config/brand.ts` and the Tailwind `brand-*` classes.

## How it works (for developers)

- `src/config/brand.core.ts`: `resolveBrand(env)` turns `VITE_BRAND_*` into one typed
  `BrandConfig` (defaults = original site) and builds the color palette. No imports, so it runs in
  the browser and at build time.
- `src/config/brand.ts`: `brand = resolveBrand(import.meta.env)` for components, plus
  `isDemoEmail()` and `supabaseAuthUsersUrl()` (derived from `VITE_SUPABASE_URL`).
- `vite-plugin-brand.ts`: fills the `%BRAND_*%` tokens in `index.html` (title, description,
  theme-color, favicon, apple-touch-icon, iOS title), injects the `--brand-*` CSS variables, and
  checks the brand folder.
- `vite.config.ts`: generates the PWA manifest (name, short_name, description, colors, icons) from
  the same config and precaches only the active brand's folder.
- `src/index.css`: Tailwind `brand-50` … `brand-900`, `brand-primary`, `brand-accent` map to
  `var(--brand-*)`.
