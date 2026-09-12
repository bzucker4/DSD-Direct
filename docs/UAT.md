# DSD Direct — UAT Script (Pilot)

Use demo accounts or invited pilot users. Password for demos: `DemoPass123!`

| Email | Role |
|-------|------|
| `admin@dsddirect.demo` | admin |
| `warehouse@dsddirect.demo` | warehouse |
| `field@dsddirect.demo` | field_rep |

Mark each scenario **Pass** or **Fail**. File bugs with role, steps, and screenshot.

---

## 1. Login — Admin role
- **Role:** any (unauthenticated)
- **Steps:** Open app → Sign in as `admin@dsddirect.demo` / `DemoPass123!`
- **Expected:** Lands on Dashboard; sidebar shows Warehouse + Field Sales; header shows role **Admin**; demo warning banner visible.
- **Result:** [ ] Pass  [ ] Fail

## 2. Login — Warehouse role
- **Role:** warehouse
- **Steps:** Sign out → Sign in as `warehouse@dsddirect.demo`
- **Expected:** Warehouse nav visible (Inventory, Receiving, Cycle Counting, Slotting, Palletization, Import); Field Sales also visible; role badge **Warehouse**.
- **Result:** [ ] Pass  [ ] Fail

## 3. Login — Field Rep role
- **Role:** field_rep
- **Steps:** Sign out → Sign in as `field@dsddirect.demo`
- **Expected:** Only Dashboard + Field Sales nav (Catalog, Surveys, POS, Planogram). No Warehouse or Import links.
- **Result:** [ ] Pass  [ ] Fail

## 4. Receive + FEFO
- **Role:** warehouse or admin
- **Steps:** Go to Receiving → pick an open PO line → enter qty + location → Receive. Then Inventory → use FEFO allocate on that SKU (or note new lot expiration/status).
- **Expected:** PO status updates; new/updated lot appears with code date/expiration and FEFO status; dashboard movements show receive.
- **Result:** [ ] Pass  [ ] Fail

## 5. Cycle count
- **Role:** warehouse or admin
- **Steps:** Cycle Counting → start a pending count → enter counted qty for each line → complete when all lines counted.
- **Expected:** Status moves pending → in_progress → complete; variance shown where counted ≠ system.
- **Result:** [ ] Pass  [ ] Fail

## 6. Order submit (catalog)
- **Role:** field_rep or admin
- **Steps:** Catalog → select customer → add products to cart → Submit order.
- **Expected:** Toast with order id/total; order appears under Submitted; prices match resolved customer price.
- **Result:** [ ] Pass  [ ] Fail

## 7. RED Survey
- **Role:** field_rep or admin
- **Steps:** Surveys → select customer → answer questions → submit.
- **Expected:** Success confirmation; result listed in recent surveys for that account.
- **Result:** [ ] Pass  [ ] Fail

## 8. POS management
- **Role:** field_rep or admin
- **Steps:** POS → request new asset (name, type, customer, notes) → advance status on an existing asset.
- **Expected:** New asset appears as requested; status updates persist after refresh.
- **Result:** [ ] Pass  [ ] Fail

## 9. Planogram
- **Role:** field_rep or admin
- **Steps:** Planogram → edit a shelf slot (product, OOS, facing) → save/blur.
- **Expected:** Slot updates immediately; changes still present after page refresh.
- **Result:** [ ] Pass  [ ] Fail

## 10. CSV import (products / customers / prices)
- **Role:** warehouse or admin
- **Steps:** Import → download a template → upload a small CSV (products or customers or prices) → Import. Confirm `import_batches` feedback (counts/errors) on page.
- **Expected:** Rows upserted; summary shows inserted/updated/error counts; bad rows listed without blocking good ones (best-effort).
- **Result:** [ ] Pass  [ ] Fail

## 11. Customer price override
- **Role:** warehouse or admin (+ field to verify)
- **Steps:** Import (or Catalog admin section) → select account → set/edit a `customer_prices` unit price for a SKU. As field_rep, open Catalog for that account.
- **Expected:** Catalog shows the override price with **Account-specific** badge (not tier-only). Other SKUs show **Tier default**.
- **Result:** [ ] Pass  [ ] Fail

## 12. RLS denial — field cannot receive
- **Role:** field_rep
- **Steps:** While signed in as field, navigate manually to `/receiving` (and `/cycle-counting`, `/slotting`, `/import`).
- **Expected:** Redirected to Dashboard (or home). Warehouse actions not available in nav. If API receive is attempted somehow, Supabase RLS denies the mutation.
- **Result:** [ ] Pass  [ ] Fail

## 13. Refresh persistence
- **Role:** any authenticated
- **Steps:** After submitting an order or completing a count, hard-refresh the browser (F5 / pull-to-refresh).
- **Expected:** Session remains (still logged in); submitted data still visible from Supabase.
- **Result:** [ ] Pass  [ ] Fail

## 14. PWA install smoke
- **Role:** any
- **Steps:** On supported browser (Chrome/Edge mobile or desktop): open installed app prompt or “Install app” / Add to Home Screen. Open from home screen icon.
- **Expected:** App opens in standalone/PWA shell; login and core navigation work offline shell loads (live data needs network).
- **Result:** [ ] Pass  [ ] Fail

## 15. Settings — role, sign out, password change
- **Role:** any authenticated
- **Steps:** Open Settings/Account → confirm email + role → optionally change password (then sign in again) → Sign out.
- **Expected:** Role matches JWT; sign out returns to login; password change succeeds for non-demo or documents demo limitation.
- **Result:** [ ] Pass  [ ] Fail

---

**Sign-off**

| Tester | Date | Build / SHA | Overall |
|--------|------|-------------|---------|
|        |      |             | [ ] Ready for pilot  [ ] Blocked |
