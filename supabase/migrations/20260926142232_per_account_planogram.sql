-- Per-account planograms.
-- shelf_slots.customer_id: NULL = shared template, otherwise the account's own layout.
-- Existing template rows (customer_id IS NULL) are left untouched.
alter table public.shelf_slots
  add column if not exists customer_id text references public.customers(id);

-- One slot per (account, shelf, position); lets the template copy be idempotent.
create unique index if not exists shelf_slots_customer_shelf_position_key
  on public.shelf_slots (customer_id, shelf, position)
  where customer_id is not null;

create index if not exists shelf_slots_customer_id_idx
  on public.shelf_slots (customer_id);

-- RLS: the existing policy "shelf_slots_all" (FOR ALL TO authenticated USING is_field()
-- WITH CHECK is_field()) already governs both template and per-account rows.
-- Re-assert it so the table's policy is explicit in this migration.
alter table public.shelf_slots enable row level security;
drop policy if exists shelf_slots_all on public.shelf_slots;
create policy shelf_slots_all on public.shelf_slots
  for all to authenticated
  using (public.is_field())
  with check (public.is_field());

-- Copy the template to an account the first time it is edited. Runs as the caller
-- (SECURITY INVOKER), so RLS still applies. Returns the account's slots.
create or replace function public.ensure_customer_planogram(p_customer_id text)
returns setof public.shelf_slots
language plpgsql
set search_path to 'public'
as $function$
begin
  if not public.is_field() then
    raise exception 'field, warehouse or admin role required';
  end if;
  if p_customer_id is null then
    raise exception 'customer id required';
  end if;

  if not exists (select 1 from public.shelf_slots where customer_id = p_customer_id) then
    insert into public.shelf_slots
      (id, customer_id, shelf, position, product_id, competitor_brand, oos, facing_count)
    select p_customer_id || ':' || t.id, p_customer_id, t.shelf, t.position,
           t.product_id, t.competitor_brand, t.oos, t.facing_count
    from public.shelf_slots t
    where t.customer_id is null
    on conflict (customer_id, shelf, position) where customer_id is not null do nothing;
  end if;

  return query
    select * from public.shelf_slots
    where customer_id = p_customer_id
    order by shelf, position;
end;
$function$;

revoke execute on function public.ensure_customer_planogram(text) from public, anon;
grant execute on function public.ensure_customer_planogram(text) to authenticated;
