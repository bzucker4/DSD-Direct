# Pilot definition of done

Short checklist before handing the build to pilot users.

## Must have
- [ ] `npm run build` succeeds locally / CI
- [ ] Auth required; demo users documented; real invites process known
- [ ] Roles enforced in UI: field_rep cannot open warehouse/import routes
- [ ] Receiving uses `receive_inventory`; FEFO allocate available
- [ ] Catalog pricing uses `resolve_customer_price` with account vs tier badge
- [ ] CSV import page + templates for products, customers, prices; writes `import_batches`
- [ ] UAT script (`docs/UAT.md`) executed; critical scenarios Pass
- [ ] PWA install smoke completed on at least one device
- [ ] Supabase: leaked password protection enabled (dashboard)
- [ ] Demo `@dsddirect.demo` accounts replaced or disabled before production cutover
- [ ] `.env` / service role key never committed; Netlify has `VITE_SUPABASE_*` only

## Nice to have
- [ ] Pilot users invited via Supabase Auth (email) with correct `app_metadata.role`
- [ ] Sample customer_prices reviewed for pilot accounts
- [ ] Netlify (or host) preview URL shared with UAT sign-off

## Exit criteria
Pilot-ready when all **Must have** items are checked and UAT has no Sev-1 blockers.
