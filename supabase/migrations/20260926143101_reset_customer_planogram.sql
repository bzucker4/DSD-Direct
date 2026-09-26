-- "Reset to shared layout": delete an account's own planogram rows so it falls back
-- to the shared template (customer_id IS NULL). Template rows can never be deleted.

-- Split the former FOR ALL policy so DELETE can require a non-null customer_id.
-- Same role rule as before (is_field(): admin, warehouse, field_rep); authenticated only.
drop policy if exists shelf_slots_all on public.shelf_slots;
drop policy if exists shelf_slots_select on public.shelf_slots;
drop policy if exists shelf_slots_insert on public.shelf_slots;
drop policy if exists shelf_slots_update on public.shelf_slots;
drop policy if exists shelf_slots_delete on public.shelf_slots;

create policy shelf_slots_select on public.shelf_slots
  for select to authenticated
  using (public.is_field());

create policy shelf_slots_insert on public.shelf_slots
  for insert to authenticated
  with check (public.is_field());

create policy shelf_slots_update on public.shelf_slots
  for update to authenticated
  using (public.is_field())
  with check (public.is_field());

-- Only per-account rows are deletable; template rows are protected.
create policy shelf_slots_delete on public.shelf_slots
  for delete to authenticated
  using (public.is_field() and customer_id is not null);

-- A slot can't move between the template and an account (or between accounts),
-- so a template row can't be re-labelled to make it deletable.
create or replace function public.shelf_slots_customer_id_immutable()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  if new.customer_id is distinct from old.customer_id then
    raise exception 'shelf_slots.customer_id cannot be changed';
  end if;
  return new;
end;
$function$;

revoke execute on function public.shelf_slots_customer_id_immutable() from public, anon, authenticated;

drop trigger if exists shelf_slots_customer_id_immutable on public.shelf_slots;
create trigger shelf_slots_customer_id_immutable
  before update of customer_id on public.shelf_slots
  for each row execute function public.shelf_slots_customer_id_immutable();

-- RPC used by the UI. SECURITY INVOKER: runs as the caller, so the RLS policies
-- above still apply. Returns the number of rows removed.
create or replace function public.reset_customer_planogram(p_customer_id text)
returns integer
language plpgsql
set search_path to 'public'
as $function$
declare
  removed integer;
begin
  if not public.is_field() then
    raise exception 'field, warehouse or admin role required';
  end if;
  if p_customer_id is null or btrim(p_customer_id) = '' then
    raise exception 'customer id required';
  end if;

  delete from public.shelf_slots
  where customer_id = p_customer_id
    and customer_id is not null;
  get diagnostics removed = row_count;
  return removed;
end;
$function$;

revoke execute on function public.reset_customer_planogram(text) from public, anon;
grant execute on function public.reset_customer_planogram(text) to authenticated;
