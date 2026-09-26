-- Picking mirrors receiving: receive_inventory adds to locations.occupied_cases,
-- so allocate_fefo_pick now subtracts the picked cases from the lot's location
-- (never below 0).
create or replace function public.allocate_fefo_pick(p_product_id text, p_qty integer, p_reference_id text default null::text)
returns jsonb
language plpgsql
set search_path to 'public'
as $function$
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
    update public.locations
      set occupied_cases = greatest(occupied_cases - take, 0)
      where id = r.location_id;
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
$function$;
