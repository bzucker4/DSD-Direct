-- DSD Direct base schema (structure only, no data).
--
-- Exported from the reference project (jdtdtuioenznqyipngvw) on 2026-09-26. It consolidates
-- the six migrations that were applied there before this repo tracked migrations:
--   20260912045727 init_dsd_direct_schema
--   20260912051357 inventory_ledger_and_role_rls
--   20260912051411 replace_open_rls_with_roles
--   20260912051447 harden_function_security
--   20260912055239 fix_order_history_week_column
--   20260912223513 customer_pricing_and_imports   (its demo customer_prices seed rows are NOT included)
-- The later migrations in this folder (20260926...) apply on top of it, in filename order.
--
-- New client projects: apply this file first, then the rest of supabase/migrations/.
-- The reference project already has these objects: do NOT re-apply this file there
-- (see docs/WHITE_LABEL.md, "Existing project").
--
-- Roles come from the JWT: auth.jwt() -> 'app_metadata' ->> 'role' in (admin, warehouse, field_rep).

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Role helpers (app_metadata.role only; never user_metadata)
-- ---------------------------------------------------------------------------
create or replace function public.jwt_role() returns text
language sql stable set search_path = public as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '');
$$;

create or replace function public.is_admin() returns boolean
language sql stable set search_path = public as $$
  select public.jwt_role() = 'admin';
$$;

create or replace function public.is_warehouse() returns boolean
language sql stable set search_path = public as $$
  select public.jwt_role() in ('admin','warehouse');
$$;

create or replace function public.is_field() returns boolean
language sql stable set search_path = public as $$
  select public.jwt_role() in ('admin','field_rep','warehouse');
$$;

create or replace function public.is_authenticated_user() returns boolean
language sql stable set search_path = public as $$
  select auth.uid() is not null;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'field_rep' check (role in ('admin','warehouse','field_rep')),
  created_at timestamptz not null default now()
);

create table public.products (
  id text primary key,
  sku text not null unique,
  name text not null,
  category text not null,
  brand text not null,
  unit text not null default 'case',
  case_pack int not null default 12,
  weight_lbs numeric(10,2) not null default 0,
  height_in numeric(10,2) not null default 0,
  par_level int not null default 0,
  base_price numeric(10,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index products_category_idx on public.products (category);
create index products_brand_idx on public.products (brand);

create table public.customers (
  id text primary key,
  name text not null,
  account_number text not null unique,
  type text not null check (type in ('grocery','convenience','on_premise','restaurant','other')),
  address text,
  city text,
  price_tier text not null default 'B' check (price_tier in ('A','B','C')),
  suggested_par jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.locations (
  id text primary key,
  zone text not null,
  aisle text not null,
  bay text not null,
  level text not null,
  slot text not null,
  capacity_cases int not null default 0,
  occupied_cases int not null default 0,
  temp_zone text not null check (temp_zone in ('ambient','cooler','freezer')),
  assigned_sku text references public.products(id) on delete set null,
  created_at timestamptz not null default now()
);
create index locations_zone_aisle_idx on public.locations (zone, aisle);

create table public.lots (
  id text primary key,
  product_id text not null references public.products(id) on delete restrict,
  lot_code text not null,
  location_id text not null references public.locations(id) on delete restrict,
  qty_on_hand int not null default 0 check (qty_on_hand >= 0),
  received_date date not null,
  code_date date,
  expiration_date date not null,
  fefo_status text not null default 'ok' check (fefo_status in ('ok','prefer','expiring','expired')),
  created_at timestamptz not null default now()
);
create index lots_product_exp_idx on public.lots (product_id, expiration_date);
create index lots_location_idx on public.lots (location_id);
create index lots_fefo_idx on public.lots (fefo_status);

create table public.purchase_orders (
  id text primary key,
  po_number text not null,
  product_id text not null references public.products(id),
  ordered_qty int not null,
  received_qty int not null default 0,
  status text not null default 'open' check (status in ('open','partial','received')),
  vendor text not null,
  expected_date date,
  created_at timestamptz not null default now()
);
create index purchase_orders_po_number_idx on public.purchase_orders (po_number);

create table public.cycle_counts (
  id text primary key,
  zone text not null,
  aisle text not null,
  status text not null default 'pending' check (status in ('pending','in_progress','complete')),
  due_date date,
  created_at timestamptz not null default now()
);

create table public.cycle_count_lines (
  id bigserial primary key,
  cycle_count_id text not null references public.cycle_counts(id) on delete cascade,
  location_id text not null references public.locations(id),
  product_id text references public.products(id),
  system_qty int not null default 0,
  counted_qty int
);

create table public.pick_orders (
  id text primary key,
  customer_id text not null references public.customers(id),
  stop_sequence int not null default 1,
  status text not null default 'open' check (status in ('open','picking','staged','loaded')),
  created_at timestamptz not null default now()
);

create table public.pick_order_lines (
  id bigserial primary key,
  pick_order_id text not null references public.pick_orders(id) on delete cascade,
  product_id text not null references public.products(id),
  qty int not null check (qty > 0)
);

create table public.sales_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id text not null references public.customers(id),
  status text not null default 'submitted' check (status in ('draft','submitted','allocated','shipped','cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

create table public.sales_order_lines (
  id bigserial primary key,
  sales_order_id uuid not null references public.sales_orders(id) on delete cascade,
  product_id text not null references public.products(id),
  qty int not null check (qty > 0),
  unit_price numeric(10,2) not null default 0
);

create table public.survey_questions (
  id text primary key,
  label text not null,
  type text not null check (type in ('yes_no','number','select','text')),
  category text not null,
  options jsonb,
  sort_order int not null default 0
);

create table public.survey_results (
  id text primary key,
  customer_id text not null references public.customers(id),
  completed_at timestamptz not null default now(),
  answers jsonb not null default '{}'::jsonb
);

create table public.pos_assets (
  id text primary key,
  name text not null,
  type text not null,
  customer_id text references public.customers(id),
  status text not null default 'requested',
  requested_at date,
  notes text
);

-- customer_id (per-account planograms) is added by 20260926142232_per_account_planogram.sql
create table public.shelf_slots (
  id text primary key,
  shelf int not null,
  position int not null,
  product_id text references public.products(id),
  competitor_brand text,
  oos boolean not null default false,
  facing_count int not null default 1
);

create table public.inventory_movements (
  id bigserial primary key,
  movement_type text not null check (movement_type in ('receive','pick','adjust','transfer','cycle_count')),
  product_id text not null references public.products(id),
  lot_id text references public.lots(id),
  from_location_id text references public.locations(id),
  to_location_id text references public.locations(id),
  qty int not null check (qty <> 0),
  reference_type text,
  reference_id text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index inventory_movements_product_idx on public.inventory_movements (product_id, created_at desc);
create index inventory_movements_lot_idx on public.inventory_movements (lot_id);

create table public.order_history (
  id bigserial primary key,
  customer_id text not null references public.customers(id) on delete cascade,
  week text not null,
  cases int not null default 0,
  constraint order_history_customer_id_week_key unique (customer_id, week)
);

create table public.customer_prices (
  id bigserial primary key,
  customer_id text not null references public.customers(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  effective_from date not null default current_date,
  effective_to date,
  created_at timestamptz not null default now(),
  unique (customer_id, product_id, effective_from)
);
create index customer_prices_lookup_idx on public.customer_prices (customer_id, product_id);

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('products','customers','prices')),
  filename text,
  row_count int not null default 0,
  success_count int not null default 0,
  error_count int not null default 0,
  errors jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.locations enable row level security;
alter table public.lots enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.cycle_counts enable row level security;
alter table public.cycle_count_lines enable row level security;
alter table public.pick_orders enable row level security;
alter table public.pick_order_lines enable row level security;
alter table public.sales_orders enable row level security;
alter table public.sales_order_lines enable row level security;
alter table public.survey_questions enable row level security;
alter table public.survey_results enable row level security;
alter table public.pos_assets enable row level security;
alter table public.shelf_slots enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.order_history enable row level security;
alter table public.customer_prices enable row level security;
alter table public.import_batches enable row level security;

-- Master data: every signed-in role reads; warehouse/admin write
create policy products_select on public.products for select to authenticated using (public.is_field());
create policy products_write on public.products for all to authenticated using (public.is_warehouse()) with check (public.is_warehouse());
create policy customers_select on public.customers for select to authenticated using (public.is_field());
create policy customers_write on public.customers for all to authenticated using (public.is_warehouse()) with check (public.is_warehouse());
create policy customer_prices_select on public.customer_prices for select to authenticated using (public.is_field());
create policy customer_prices_write on public.customer_prices for all to authenticated using (public.is_warehouse()) with check (public.is_warehouse());

-- Locations / lots: field reads, warehouse writes
create policy locations_select on public.locations for select to authenticated using (public.is_field());
create policy locations_write on public.locations for all to authenticated using (public.is_warehouse()) with check (public.is_warehouse());
create policy lots_select on public.lots for select to authenticated using (public.is_field());
create policy lots_write on public.lots for all to authenticated using (public.is_warehouse()) with check (public.is_warehouse());

-- Purchase orders
create policy purchase_orders_select on public.purchase_orders for select to authenticated using (public.is_field());
create policy purchase_orders_write on public.purchase_orders for all to authenticated using (public.is_warehouse()) with check (public.is_warehouse());

-- Cycle counts: warehouse only
create policy cycle_counts_all on public.cycle_counts for all to authenticated using (public.is_warehouse()) with check (public.is_warehouse());
create policy cycle_count_lines_all on public.cycle_count_lines for all to authenticated using (public.is_warehouse()) with check (public.is_warehouse());

-- Picks: warehouse writes, field reads
create policy pick_orders_select on public.pick_orders for select to authenticated using (public.is_field());
create policy pick_orders_write on public.pick_orders for all to authenticated using (public.is_warehouse()) with check (public.is_warehouse());
create policy pick_order_lines_select on public.pick_order_lines for select to authenticated using (public.is_field());
create policy pick_order_lines_write on public.pick_order_lines for all to authenticated using (public.is_warehouse()) with check (public.is_warehouse());

-- Sales orders: field inserts/reads; warehouse updates
create policy sales_orders_select on public.sales_orders for select to authenticated using (public.is_field());
create policy sales_orders_insert on public.sales_orders for insert to authenticated with check (public.is_field());
create policy sales_orders_update on public.sales_orders for update to authenticated using (public.is_warehouse()) with check (public.is_warehouse());
create policy sales_order_lines_select on public.sales_order_lines for select to authenticated using (public.is_field());
create policy sales_order_lines_insert on public.sales_order_lines for insert to authenticated with check (public.is_field());
create policy sales_order_lines_update on public.sales_order_lines for all to authenticated using (public.is_warehouse()) with check (public.is_warehouse());

-- Surveys / POS / planogram: field
create policy survey_questions_select on public.survey_questions for select to authenticated using (public.is_field());
create policy survey_questions_write on public.survey_questions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy survey_results_all on public.survey_results for all to authenticated using (public.is_field()) with check (public.is_field());
create policy pos_assets_all on public.pos_assets for all to authenticated using (public.is_field()) with check (public.is_field());
-- Replaced by per-command policies in 20260926143101_reset_customer_planogram.sql
create policy shelf_slots_all on public.shelf_slots for all to authenticated using (public.is_field()) with check (public.is_field());

-- Profiles: users read/update their own; admin all
create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Ledger, order history, import log
create policy inventory_movements_select on public.inventory_movements for select to authenticated using (public.is_field());
create policy inventory_movements_insert on public.inventory_movements for insert to authenticated with check (public.is_warehouse());
create policy order_history_select on public.order_history for select to authenticated using (public.is_field());
create policy order_history_write on public.order_history for all to authenticated using (public.is_warehouse()) with check (public.is_warehouse());
create policy import_batches_all on public.import_batches for all to authenticated using (public.is_warehouse()) with check (public.is_warehouse());

-- ---------------------------------------------------------------------------
-- Auth: auto-create a profile row for every new auth user
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_app_meta_data->>'role', 'field_rep')
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RPCs (SECURITY INVOKER: RLS applies to the caller)
-- ---------------------------------------------------------------------------

-- FEFO pick: deduct from the earliest-expiring non-expired lots.
-- (20260926142246_fefo_pick_decrements_location.sql also decrements locations.occupied_cases.)
create or replace function public.allocate_fefo_pick(
  p_product_id text,
  p_qty int,
  p_reference_id text default null
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  remaining int := p_qty;
  r record;
  take int;
  allocations jsonb := '[]'::jsonb;
begin
  if not public.is_warehouse() then
    raise exception 'warehouse role required';
  end if;
  if p_qty <= 0 then
    raise exception 'qty must be positive';
  end if;

  for r in
    select id, location_id, qty_on_hand, expiration_date, fefo_status
    from public.lots
    where product_id = p_product_id
      and qty_on_hand > 0
      and fefo_status <> 'expired'
    order by expiration_date asc, received_date asc
    for update
  loop
    exit when remaining <= 0;
    take := least(remaining, r.qty_on_hand);
    update public.lots set qty_on_hand = qty_on_hand - take where id = r.id;
    insert into public.inventory_movements (
      movement_type, product_id, lot_id, from_location_id, qty, reference_type, reference_id, created_by
    ) values (
      'pick', p_product_id, r.id, r.location_id, -take, 'pick', p_reference_id, auth.uid()
    );
    allocations := allocations || jsonb_build_object('lot_id', r.id, 'qty', take, 'expiration_date', r.expiration_date);
    remaining := remaining - take;
  end loop;

  if remaining > 0 then
    raise exception 'insufficient non-expired stock for % (short %)', p_product_id, remaining;
  end if;

  return allocations;
end;
$$;

-- Receive into a location as a new lot; updates PO progress when p_po_id is given.
create or replace function public.receive_inventory(
  p_product_id text,
  p_location_id text,
  p_qty int,
  p_lot_code text,
  p_expiration_date date,
  p_code_date date default null,
  p_po_id text default null
) returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_lot_id text;
  po_ordered int;
  po_received int;
begin
  if not public.is_warehouse() then
    raise exception 'warehouse role required';
  end if;
  if p_qty <= 0 then raise exception 'qty must be positive'; end if;

  new_lot_id := 'l' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
  insert into public.lots (
    id, product_id, lot_code, location_id, qty_on_hand, received_date, code_date, expiration_date, fefo_status
  ) values (
    new_lot_id, p_product_id, p_lot_code, p_location_id, p_qty, current_date,
    coalesce(p_code_date, p_expiration_date), p_expiration_date,
    case when p_expiration_date <= current_date + 45 then 'prefer' else 'ok' end
  );

  update public.locations
    set occupied_cases = occupied_cases + p_qty
    where id = p_location_id;

  insert into public.inventory_movements (
    movement_type, product_id, lot_id, to_location_id, qty, reference_type, reference_id, created_by
  ) values (
    'receive', p_product_id, new_lot_id, p_location_id, p_qty, 'po', p_po_id, auth.uid()
  );

  if p_po_id is not null then
    update public.purchase_orders
      set received_qty = least(ordered_qty, received_qty + p_qty),
          status = case
            when received_qty + p_qty >= ordered_qty then 'received'
            when received_qty + p_qty > 0 then 'partial'
            else status end
      where id = p_po_id;
  end if;

  return new_lot_id;
end;
$$;

-- Price for an account + SKU: active customer-specific price, else base price x tier multiplier.
create or replace function public.resolve_customer_price(
  p_customer_id text,
  p_product_id text
) returns numeric
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  specific numeric;
  base numeric;
  tier text;
  mult numeric;
begin
  select unit_price into specific
  from public.customer_prices
  where customer_id = p_customer_id
    and product_id = p_product_id
    and effective_from <= current_date
    and (effective_to is null or effective_to >= current_date)
  order by effective_from desc
  limit 1;

  if specific is not null then
    return specific;
  end if;

  select p.base_price, c.price_tier into base, tier
  from public.products p
  cross join public.customers c
  where p.id = p_product_id and c.id = p_customer_id;

  if base is null then
    return null;
  end if;

  mult := case tier when 'A' then 0.92 when 'C' then 1.08 else 1.0 end;
  return round(base * mult, 2);
end;
$$;

grant execute on function public.allocate_fefo_pick(text, int, text) to authenticated;
grant execute on function public.receive_inventory(text, text, int, text, date, date, text) to authenticated;
grant execute on function public.resolve_customer_price(text, text) to authenticated;
