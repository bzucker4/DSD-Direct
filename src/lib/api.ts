import { supabase } from './supabase'
import { cycleCounts as seedCycleCounts, pickOrders as seedPickOrders } from '../data/warehouse'
import {
  defaultShelfPlan,
  posAssets as seedPosAssets,
  surveyQuestions as seedSurveyQuestions,
} from '../data/field'
import type {
  CatalogOrderLine,
  Customer,
  CycleCount,
  CycleCountLine,
  FefoStatus,
  Location,
  Lot,
  PickOrder,
  PosAsset,
  Product,
  PurchaseOrderLine,
  ShelfSlot,
  SubmittedOrder,
  SurveyQuestion,
  SurveyResult,
} from '../types'

function throwIf(error: { message: string } | null): void {
  if (error) throw new Error(error.message)
}

function num(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

/* ---------- mappers (DB snake_case → app camelCase) ---------- */

type ProductRow = {
  id: string
  sku: string
  name: string
  category: string
  brand: string
  unit: string
  case_pack: number
  weight_lbs: number | string
  height_in: number | string
  par_level: number
  base_price: number | string
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category,
    brand: row.brand,
    unit: row.unit,
    casePack: num(row.case_pack),
    weightLbs: num(row.weight_lbs),
    heightIn: num(row.height_in),
    parLevel: num(row.par_level),
    basePrice: num(row.base_price),
  }
}

type CustomerRow = {
  id: string
  name: string
  account_number: string
  type: Customer['type']
  address: string
  city: string
  price_tier: Customer['priceTier']
  suggested_par: Record<string, number> | null
}

export function mapCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    accountNumber: row.account_number,
    type: row.type,
    address: row.address,
    city: row.city,
    priceTier: row.price_tier,
    suggestedPar: row.suggested_par ?? {},
  }
}

type LocationRow = {
  id: string
  zone: string
  aisle: string
  bay: string
  level: string
  slot: string
  capacity_cases: number
  occupied_cases: number
  temp_zone: Location['tempZone']
  assigned_sku: string | null
}

export function mapLocation(row: LocationRow): Location {
  return {
    id: row.id,
    zone: row.zone,
    aisle: row.aisle,
    bay: row.bay,
    level: row.level,
    slot: row.slot,
    capacityCases: num(row.capacity_cases),
    occupiedCases: num(row.occupied_cases),
    tempZone: row.temp_zone,
    assignedSku: row.assigned_sku ?? undefined,
  }
}

type LotRow = {
  id: string
  product_id: string
  lot_code: string
  location_id: string
  qty_on_hand: number
  received_date: string
  code_date: string
  expiration_date: string
  fefo_status: FefoStatus
}

export function mapLot(row: LotRow): Lot {
  return {
    id: row.id,
    productId: row.product_id,
    lotCode: row.lot_code,
    locationId: row.location_id,
    qtyOnHand: num(row.qty_on_hand),
    receivedDate: row.received_date,
    codeDate: row.code_date,
    expirationDate: row.expiration_date,
    fefoStatus: row.fefo_status,
  }
}

type PoRow = {
  id: string
  po_number: string
  product_id: string
  ordered_qty: number
  received_qty: number
  status: PurchaseOrderLine['status']
  vendor: string
  expected_date: string
}

export function mapPurchaseOrder(row: PoRow): PurchaseOrderLine {
  return {
    id: row.id,
    poNumber: row.po_number,
    productId: row.product_id,
    orderedQty: num(row.ordered_qty),
    receivedQty: num(row.received_qty),
    status: row.status,
    vendor: row.vendor,
    expectedDate: row.expected_date,
  }
}

type CycleCountRow = {
  id: string
  zone: string
  aisle: string
  status: CycleCount['status']
  due_date: string | null
}

type CycleCountLineRow = {
  id: number
  cycle_count_id: string
  location_id: string
  product_id: string | null
  system_qty: number
  counted_qty: number | null
}

export function mapCycleCountLine(row: CycleCountLineRow): CycleCountLine {
  return {
    locationId: row.location_id,
    productId: row.product_id ?? '',
    systemQty: num(row.system_qty),
    countedQty: row.counted_qty === null ? null : num(row.counted_qty),
  }
}

type PickOrderRow = {
  id: string
  customer_id: string
  stop_sequence: number
  status: PickOrder['status']
}

type PickOrderLineRow = {
  id: number
  pick_order_id: string
  product_id: string
  qty: number
}

type SalesOrderRow = {
  id: string
  customer_id: string
  status: SubmittedOrder['status']
  created_at: string
}

type SalesOrderLineRow = {
  id: number
  sales_order_id: string
  product_id: string
  qty: number
  unit_price: number | string
}

type SurveyQuestionRow = {
  id: string
  label: string
  type: SurveyQuestion['type']
  category: string
  options: string[] | null
  sort_order: number
}

export function mapSurveyQuestion(row: SurveyQuestionRow): SurveyQuestion {
  return {
    id: row.id,
    label: row.label,
    type: row.type,
    category: row.category,
    options: row.options ?? undefined,
  }
}

type SurveyResultRow = {
  id: string
  customer_id: string
  completed_at: string
  answers: Record<string, string | number | boolean>
}

export function mapSurveyResult(row: SurveyResultRow): SurveyResult {
  return {
    id: row.id,
    customerId: row.customer_id,
    completedAt: row.completed_at,
    answers: row.answers ?? {},
  }
}

type PosAssetRow = {
  id: string
  name: string
  type: PosAsset['type']
  customer_id: string | null
  status: PosAsset['status']
  requested_at: string | null
  notes: string | null
}

export function mapPosAsset(row: PosAssetRow): PosAsset {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    customerId: row.customer_id ?? '',
    status: row.status,
    requestedAt: row.requested_at ?? '',
    notes: row.notes ?? '',
  }
}

type ShelfSlotRow = {
  id: string
  customer_id: string | null
  shelf: number
  position: number
  product_id: string | null
  competitor_brand: string | null
  oos: boolean
  facing_count: number
}

export function mapShelfSlot(row: ShelfSlotRow): ShelfSlot {
  return {
    id: row.id,
    shelf: num(row.shelf),
    position: num(row.position),
    productId: row.product_id,
    competitorBrand: row.competitor_brand,
    oos: Boolean(row.oos),
    facingCount: num(row.facing_count, 1),
  }
}


type OrderHistoryRow = {
  id?: string
  customer_id: string
  week?: string
  week_label?: string
  cases?: number | string
  qty?: number | string
}

export type OrderHistoryPointRow = {
  customerId: string
  week: string
  cases: number
}

export function mapOrderHistory(row: OrderHistoryRow): OrderHistoryPointRow {
  return {
    customerId: row.customer_id,
    week: row.week ?? row.week_label ?? '',
    cases: num(row.cases ?? row.qty),
  }
}

type InventoryMovementRow = {
  id: string
  product_id: string | null
  location_id: string | null
  lot_id: string | null
  qty: number | string
  movement_type: string
  reference_id: string | null
  created_at: string
  notes: string | null
}

export type InventoryMovement = {
  id: string
  productId: string
  locationId: string
  lotId: string
  qty: number
  movementType: string
  referenceId: string
  createdAt: string
  notes: string
}

export function mapInventoryMovement(row: InventoryMovementRow): InventoryMovement {
  return {
    id: row.id,
    productId: row.product_id ?? '',
    locationId: row.location_id ?? '',
    lotId: row.lot_id ?? '',
    qty: num(row.qty),
    movementType: row.movement_type,
    referenceId: row.reference_id ?? '',
    createdAt: row.created_at,
    notes: row.notes ?? '',
  }
}

export type FefoAllocation = { lotId: string; lotCode: string; qty: number; locationId?: string }

/* ---------- fetchers ---------- */

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('id')
  throwIf(error)
  return (data as ProductRow[]).map(mapProduct)
}

export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase.from('customers').select('*').order('id')
  throwIf(error)
  return (data as CustomerRow[]).map(mapCustomer)
}

export async function fetchLocations(): Promise<Location[]> {
  const { data, error } = await supabase.from('locations').select('*').order('id')
  throwIf(error)
  return (data as LocationRow[]).map(mapLocation)
}

export async function fetchLots(): Promise<Lot[]> {
  const { data, error } = await supabase.from('lots').select('*').order('id')
  throwIf(error)
  return (data as LotRow[]).map(mapLot)
}

export async function fetchPurchaseOrders(): Promise<PurchaseOrderLine[]> {
  const { data, error } = await supabase.from('purchase_orders').select('*').order('id')
  throwIf(error)
  return (data as PoRow[]).map(mapPurchaseOrder)
}

export async function fetchCycleCounts(): Promise<CycleCount[]> {
  const { data: counts, error: cErr } = await supabase.from('cycle_counts').select('*').order('id')
  throwIf(cErr)
  const { data: lines, error: lErr } = await supabase.from('cycle_count_lines').select('*')
  throwIf(lErr)
  const byCount = new Map<string, CycleCountLine[]>()
  for (const row of (lines ?? []) as CycleCountLineRow[]) {
    const list = byCount.get(row.cycle_count_id) ?? []
    list.push(mapCycleCountLine(row))
    byCount.set(row.cycle_count_id, list)
  }
  return ((counts ?? []) as CycleCountRow[]).map((row) => ({
    id: row.id,
    zone: row.zone,
    aisle: row.aisle,
    status: row.status,
    dueDate: row.due_date ?? '',
    lines: byCount.get(row.id) ?? [],
  }))
}

export async function fetchPickOrders(): Promise<PickOrder[]> {
  const { data: orders, error: oErr } = await supabase.from('pick_orders').select('*').order('stop_sequence')
  throwIf(oErr)
  const { data: lines, error: lErr } = await supabase.from('pick_order_lines').select('*')
  throwIf(lErr)
  const byOrder = new Map<string, { productId: string; qty: number }[]>()
  for (const row of (lines ?? []) as PickOrderLineRow[]) {
    const list = byOrder.get(row.pick_order_id) ?? []
    list.push({ productId: row.product_id, qty: num(row.qty) })
    byOrder.set(row.pick_order_id, list)
  }
  return ((orders ?? []) as PickOrderRow[]).map((row) => ({
    id: row.id,
    customerId: row.customer_id,
    stopSequence: num(row.stop_sequence, 1),
    status: row.status,
    lines: byOrder.get(row.id) ?? [],
  }))
}

export async function fetchSurveyQuestions(): Promise<SurveyQuestion[]> {
  const { data, error } = await supabase.from('survey_questions').select('*').order('sort_order')
  throwIf(error)
  return (data as SurveyQuestionRow[]).map(mapSurveyQuestion)
}

export async function fetchSurveyResults(): Promise<SurveyResult[]> {
  const { data, error } = await supabase
    .from('survey_results')
    .select('*')
    .order('completed_at', { ascending: false })
  throwIf(error)
  return (data as SurveyResultRow[]).map(mapSurveyResult)
}

export async function fetchPosAssets(): Promise<PosAsset[]> {
  const { data, error } = await supabase.from('pos_assets').select('*').order('id')
  throwIf(error)
  return (data as PosAssetRow[]).map(mapPosAsset)
}

export async function fetchShelfSlots(): Promise<ShelfSlot[]> {
  const { data, error } = await supabase.from('shelf_slots').select('*').order('id')
  throwIf(error)
  return (data as ShelfSlotRow[]).map(mapShelfSlot)
}

export async function fetchSalesOrders(): Promise<SubmittedOrder[]> {
  const { data: orders, error: oErr } = await supabase
    .from('sales_orders')
    .select('*')
    .order('created_at', { ascending: false })
  throwIf(oErr)
  const { data: lines, error: lErr } = await supabase.from('sales_order_lines').select('*')
  throwIf(lErr)
  const byOrder = new Map<string, CatalogOrderLine[]>()
  for (const row of (lines ?? []) as SalesOrderLineRow[]) {
    const list = byOrder.get(row.sales_order_id) ?? []
    list.push({
      productId: row.product_id,
      qty: num(row.qty),
      unitPrice: num(row.unit_price),
    })
    byOrder.set(row.sales_order_id, list)
  }
  return ((orders ?? []) as SalesOrderRow[]).map((row) => {
    const orderLines = byOrder.get(row.id) ?? []
    return {
      id: row.id,
      customerId: row.customer_id,
      createdAt: row.created_at,
      lines: orderLines,
      total: orderLines.reduce((s, l) => s + l.qty * l.unitPrice, 0),
      status: row.status,
    }
  })
}


export async function fetchOrderHistory(): Promise<OrderHistoryPointRow[]> {
  const { data, error } = await supabase
    .from('order_history')
    .select('*')
    .order('week', { ascending: true })
  throwIf(error)
  return ((data ?? []) as OrderHistoryRow[]).map(mapOrderHistory)
}

export async function fetchInventoryMovements(limit = 20): Promise<InventoryMovement[]> {
  const { data, error } = await supabase
    .from('inventory_movements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  throwIf(error)
  return ((data ?? []) as InventoryMovementRow[]).map(mapInventoryMovement)
}

export async function fetchAll() {
  const [
    products,
    customers,
    locations,
    lots,
    purchaseOrders,
    cycleCounts,
    pickOrders,
    surveyQuestions,
    surveyResults,
    posAssets,
    shelfSlots,
    salesOrders,
    orderHistory,
    inventoryMovements,
  ] = await Promise.all([
    fetchProducts(),
    fetchCustomers(),
    fetchLocations(),
    fetchLots(),
    fetchPurchaseOrders(),
    fetchCycleCounts(),
    fetchPickOrders(),
    fetchSurveyQuestions(),
    fetchSurveyResults(),
    fetchPosAssets(),
    fetchShelfSlots(),
    fetchSalesOrders(),
    fetchOrderHistory(),
    fetchInventoryMovements(25),
  ])
  return {
    products,
    customers,
    locations,
    lots,
    purchaseOrders,
    cycleCounts,
    pickOrders,
    surveyQuestions,
    surveyResults,
    posAssets,
    shelfSlots,
    salesOrders,
    orderHistory,
    inventoryMovements,
  }
}

/* ---------- one-shot seed for empty demo tables ---------- */

async function isEmpty(table: string): Promise<boolean> {
  const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true })
  throwIf(error)
  return (count ?? 0) === 0
}

export async function ensureSeeded(): Promise<void> {
  if (await isEmpty('cycle_counts')) {
    const headers = seedCycleCounts.map((c) => ({
      id: c.id,
      zone: c.zone,
      aisle: c.aisle,
      status: c.status,
      due_date: c.dueDate,
    }))
    const { error } = await supabase.from('cycle_counts').upsert(headers, { onConflict: 'id' })
    throwIf(error)
    const lines = seedCycleCounts.flatMap((c) =>
      c.lines.map((l) => ({
        cycle_count_id: c.id,
        location_id: l.locationId,
        product_id: l.productId,
        system_qty: l.systemQty,
        counted_qty: l.countedQty,
      })),
    )
    const { error: lErr } = await supabase.from('cycle_count_lines').insert(lines)
    throwIf(lErr)
  }

  if (await isEmpty('pick_orders')) {
    const headers = seedPickOrders.map((p) => ({
      id: p.id,
      customer_id: p.customerId,
      stop_sequence: p.stopSequence,
      status: p.status,
    }))
    const { error } = await supabase.from('pick_orders').upsert(headers, { onConflict: 'id' })
    throwIf(error)
    const lines = seedPickOrders.flatMap((p) =>
      p.lines.map((l) => ({
        pick_order_id: p.id,
        product_id: l.productId,
        qty: l.qty,
      })),
    )
    const { error: lErr } = await supabase.from('pick_order_lines').insert(lines)
    throwIf(lErr)
  }

  if (await isEmpty('survey_questions')) {
    const rows = seedSurveyQuestions.map((q, i) => ({
      id: q.id,
      label: q.label,
      type: q.type,
      category: q.category,
      options: q.options ?? null,
      sort_order: i + 1,
    }))
    const { error } = await supabase.from('survey_questions').upsert(rows, { onConflict: 'id' })
    throwIf(error)
  }

  if (await isEmpty('pos_assets')) {
    const rows = seedPosAssets.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      customer_id: a.customerId,
      status: a.status,
      requested_at: a.requestedAt,
      notes: a.notes,
    }))
    const { error } = await supabase.from('pos_assets').upsert(rows, { onConflict: 'id' })
    throwIf(error)
  }

  if (await isEmpty('shelf_slots')) {
    const rows = defaultShelfPlan().map((s) => ({
      id: s.id,
      customer_id: null,
      shelf: s.shelf,
      position: s.position,
      product_id: s.productId,
      competitor_brand: s.competitorBrand,
      oos: s.oos,
      facing_count: s.facingCount,
    }))
    const { error } = await supabase.from('shelf_slots').upsert(rows, { onConflict: 'id' })
    throwIf(error)
  }
}

let seedPromise: Promise<void> | null = null
export function ensureSeededOnce(): Promise<void> {
  if (!seedPromise) seedPromise = ensureSeeded()
  return seedPromise
}

/* ---------- mutations ---------- */

export async function receivePoLine(
  lineId: string,
  qty: number,
  locationId: string,
): Promise<{ line: PurchaseOrderLine; lot: Lot }> {
  const { data: current, error: fetchErr } = await supabase
    .from('purchase_orders')
    .select('*')
    .eq('id', lineId)
    .single()
  throwIf(fetchErr)
  const row = current as PoRow

  const today = new Date().toISOString().slice(0, 10)
  const exp = new Date()
  exp.setMonth(exp.getMonth() + 6)
  const expDate = exp.toISOString().slice(0, 10)
  const lotCode = `RCV${today.replaceAll('-', '').slice(2)}`

  const { data: lotId, error: rpcErr } = await supabase.rpc('receive_inventory', {
    p_product_id: row.product_id,
    p_location_id: locationId,
    p_qty: qty,
    p_lot_code: lotCode,
    p_expiration_date: expDate,
    p_code_date: expDate,
    p_po_id: lineId,
  })
  throwIf(rpcErr)

  const { data: updated, error: poErr } = await supabase
    .from('purchase_orders')
    .select('*')
    .eq('id', lineId)
    .single()
  throwIf(poErr)

  let lotRow: LotRow | null = null
  if (lotId) {
    const { data: lot, error: lotErr } = await supabase
      .from('lots')
      .select('*')
      .eq('id', lotId as string)
      .maybeSingle()
    throwIf(lotErr)
    lotRow = lot as LotRow | null
  }
  if (!lotRow) {
    const { data: lots, error: lotListErr } = await supabase
      .from('lots')
      .select('*')
      .eq('product_id', row.product_id)
      .eq('location_id', locationId)
      .order('received_date', { ascending: false })
      .limit(1)
    throwIf(lotListErr)
    lotRow = (lots?.[0] as LotRow) ?? null
  }
  if (!lotRow) {
    throw new Error('receive_inventory succeeded but lot could not be loaded')
  }

  return { line: mapPurchaseOrder(updated as PoRow), lot: mapLot(lotRow) }
}

/** Server-side FEFO pick via allocate_fefo_pick RPC. */
export async function allocateFefoPick(
  productId: string,
  qty: number,
  referenceId: string,
): Promise<{ allocations: FefoAllocation[]; shortfall: number }> {
  const { data, error } = await supabase.rpc('allocate_fefo_pick', {
    p_product_id: productId,
    p_qty: qty,
    p_reference_id: referenceId,
  })
  throwIf(error)

  const raw = data as unknown
  let list: unknown[] = []
  if (Array.isArray(raw)) list = raw
  else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.allocations)) list = obj.allocations
    else if (Array.isArray(obj.items)) list = obj.items
  }

  const allocations: FefoAllocation[] = list.map((item) => {
    const row = item as Record<string, unknown>
    return {
      lotId: String(row.lot_id ?? row.lotId ?? ''),
      lotCode: String(row.lot_code ?? row.lotCode ?? ''),
      qty: num(row.qty ?? row.quantity),
      locationId: row.location_id != null || row.locationId != null
        ? String(row.location_id ?? row.locationId)
        : undefined,
    }
  })
  const allocated = allocations.reduce((s, a) => s + a.qty, 0)
  const shortfall =
    raw && typeof raw === 'object' && !Array.isArray(raw) && 'shortfall' in (raw as object)
      ? num((raw as Record<string, unknown>).shortfall)
      : Math.max(0, qty - allocated)
  return { allocations, shortfall }
}

export async function submitSalesOrder(
  customerId: string,
  lines: CatalogOrderLine[],
): Promise<SubmittedOrder> {
  const { data: order, error: oErr } = await supabase
    .from('sales_orders')
    .insert({ customer_id: customerId, status: 'submitted' })
    .select()
    .single()
  throwIf(oErr)
  const so = order as SalesOrderRow
  if (lines.length > 0) {
    const { error: lErr } = await supabase.from('sales_order_lines').insert(
      lines.map((l) => ({
        sales_order_id: so.id,
        product_id: l.productId,
        qty: l.qty,
        unit_price: l.unitPrice,
      })),
    )
    throwIf(lErr)
  }
  return {
    id: so.id,
    customerId: so.customer_id,
    createdAt: so.created_at,
    lines,
    total: lines.reduce((s, l) => s + l.qty * l.unitPrice, 0),
    status: so.status,
  }
}

export async function updateCycleCountStatus(
  id: string,
  status: CycleCount['status'],
): Promise<void> {
  const { error } = await supabase.from('cycle_counts').update({ status }).eq('id', id)
  throwIf(error)
}

export async function updateCycleCountLineQty(
  countId: string,
  locationId: string,
  productId: string,
  countedQty: number | null,
): Promise<void> {
  let query = supabase
    .from('cycle_count_lines')
    .update({ counted_qty: countedQty })
    .eq('cycle_count_id', countId)
    .eq('location_id', locationId)
  query = productId ? query.eq('product_id', productId) : query
  const { error } = await query
  throwIf(error)
}

export async function saveSurveyResult(
  customerId: string,
  answers: Record<string, string | number | boolean>,
): Promise<SurveyResult> {
  const row = {
    id: `sr-${Date.now()}`,
    customer_id: customerId,
    completed_at: new Date().toISOString(),
    answers,
  }
  const { data, error } = await supabase.from('survey_results').insert(row).select().single()
  throwIf(error)
  return mapSurveyResult(data as SurveyResultRow)
}

export async function updatePosAssetStatus(id: string, status: PosAsset['status']): Promise<void> {
  const { error } = await supabase.from('pos_assets').update({ status }).eq('id', id)
  throwIf(error)
}

export async function createPosAsset(input: {
  name: string
  type: PosAsset['type']
  customerId: string
  notes: string
}): Promise<PosAsset> {
  const row = {
    id: `pos-${Date.now()}`,
    name: input.name,
    type: input.type,
    customer_id: input.customerId,
    status: 'requested' as const,
    requested_at: new Date().toISOString().slice(0, 10),
    notes: input.notes,
  }
  const { data, error } = await supabase.from('pos_assets').insert(row).select().single()
  throwIf(error)
  return mapPosAsset(data as PosAssetRow)
}

export async function updateLocationAssignedSku(
  locationId: string,
  assignedSku: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('locations')
    .update({ assigned_sku: assignedSku })
    .eq('id', locationId)
  throwIf(error)
}

export async function updateShelfSlotRow(id: string, patch: Partial<ShelfSlot>): Promise<void> {
  const row: Record<string, unknown> = {}
  if (patch.productId !== undefined) row.product_id = patch.productId
  if (patch.competitorBrand !== undefined) row.competitor_brand = patch.competitorBrand
  if (patch.oos !== undefined) row.oos = patch.oos
  if (patch.facingCount !== undefined) row.facing_count = patch.facingCount
  if (patch.shelf !== undefined) row.shelf = patch.shelf
  if (patch.position !== undefined) row.position = patch.position
  if (Object.keys(row).length === 0) return
  const { error } = await supabase.from('shelf_slots').update(row).eq('id', id)
  throwIf(error)
}

/* ---------- KPI helpers from live collections ---------- */

export function onHandSkuCount(lots: Lot[]): number {
  return new Set(lots.filter((l) => l.qtyOnHand > 0).map((l) => l.productId)).size
}

export function fefoAlertCount(lots: Lot[]): number {
  return lots.filter((l) => l.fefoStatus === 'expiring' || l.fefoStatus === 'expired').length
}

export function openPickCount(picks: PickOrder[]): number {
  return picks.filter((p) => p.status === 'open' || p.status === 'picking').length
}

export function cycleCountsDue(counts: CycleCount[]): number {
  return counts.filter((c) => c.status === 'pending' || c.status === 'in_progress').length
}

export function loadsToday(picks: PickOrder[]): number {
  return picks.filter((p) => p.status === 'staged' || p.status === 'loaded').length
}

export function onHandForProduct(lots: Lot[], productId: string): number {
  return lots
    .filter((l) => l.productId === productId && l.fefoStatus !== 'expired')
    .reduce((s, l) => s + l.qtyOnHand, 0)
}

/* ---------- customer pricing ---------- */

export type PriceSource = 'account' | 'tier'

export type ResolvedPrice = {
  productId: string
  unitPrice: number
  source: PriceSource
}

type CustomerPriceRow = {
  id?: number | string
  customer_id: string
  product_id: string
  unit_price: number | string
  effective_from: string | null
  effective_to: string | null
}

export type CustomerPrice = {
  id?: string
  customerId: string
  productId: string
  unitPrice: number
  effectiveFrom: string | null
  effectiveTo: string | null
}

export function mapCustomerPrice(row: CustomerPriceRow): CustomerPrice {
  return {
    id: row.id != null ? String(row.id) : undefined,
    customerId: row.customer_id,
    productId: row.product_id,
    unitPrice: num(row.unit_price),
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
  }
}

export async function fetchCustomerPrices(customerId?: string): Promise<CustomerPrice[]> {
  let query = supabase.from('customer_prices').select('*').order('customer_id')
  if (customerId) query = query.eq('customer_id', customerId)
  const { data, error } = await query
  throwIf(error)
  return ((data ?? []) as CustomerPriceRow[]).map(mapCustomerPrice)
}

/** Active account overrides for a customer (effective window contains today or nulls). */
function activeOverrideSet(prices: CustomerPrice[], today: string): Set<string> {
  const set = new Set<string>()
  for (const p of prices) {
    const fromOk = !p.effectiveFrom || p.effectiveFrom <= today
    const toOk = !p.effectiveTo || p.effectiveTo >= today
    if (fromOk && toOk) set.add(p.productId)
  }
  return set
}

export async function resolveCustomerPrice(
  customerId: string,
  productId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc('resolve_customer_price', {
    p_customer_id: customerId,
    p_product_id: productId,
  })
  throwIf(error)
  return num(data)
}

export async function resolveCustomerPricesBatch(
  customerId: string,
  productIds: string[],
  fallbackTierPrice: (productId: string) => number,
): Promise<Map<string, ResolvedPrice>> {
  const today = new Date().toISOString().slice(0, 10)
  const overrides = await fetchCustomerPrices(customerId)
  const active = activeOverrideSet(overrides, today)

  const unique = [...new Set(productIds)]
  const results = await Promise.all(
    unique.map(async (productId) => {
      try {
        const unitPrice = await resolveCustomerPrice(customerId, productId)
        return {
          productId,
          unitPrice,
          source: (active.has(productId) ? 'account' : 'tier') as PriceSource,
        }
      } catch {
        return {
          productId,
          unitPrice: fallbackTierPrice(productId),
          source: 'tier' as PriceSource,
        }
      }
    }),
  )
  return new Map(results.map((r) => [r.productId, r]))
}

export async function upsertCustomerPrice(input: {
  customerId: string
  productId: string
  unitPrice: number
  effectiveFrom?: string | null
  effectiveTo?: string | null
}): Promise<CustomerPrice> {
  const row = {
    customer_id: input.customerId,
    product_id: input.productId,
    unit_price: input.unitPrice,
    effective_from: input.effectiveFrom ?? new Date().toISOString().slice(0, 10),
    effective_to: input.effectiveTo ?? null,
  }
  // Prefer upsert on (customer_id, product_id) if unique; fall back to insert
  const { data: existing } = await supabase
    .from('customer_prices')
    .select('*')
    .eq('customer_id', input.customerId)
    .eq('product_id', input.productId)
    .is('effective_to', null)
    .limit(1)

  if (existing && existing.length > 0) {
    const id = (existing[0] as CustomerPriceRow).id
    const { data, error } = await supabase
      .from('customer_prices')
      .update({
        unit_price: row.unit_price,
        effective_from: row.effective_from,
        effective_to: row.effective_to,
      })
      .eq('id', id as string | number)
      .select()
      .single()
    throwIf(error)
    return mapCustomerPrice(data as CustomerPriceRow)
  }

  const { data, error } = await supabase.from('customer_prices').insert(row).select().single()
  throwIf(error)
  return mapCustomerPrice(data as CustomerPriceRow)
}

export async function deleteCustomerPrice(id: string): Promise<void> {
  const { error } = await supabase.from('customer_prices').delete().eq('id', id)
  throwIf(error)
}

/* ---------- CSV import ---------- */

export type ImportKind = 'products' | 'customers' | 'prices'

export type ImportBatchResult = {
  id?: string
  kind: ImportKind
  inserted: number
  updated: number
  errors: string[]
}

function sanitizeIdPart(raw: string): string {
  return raw.trim().replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)
}

export function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
  if (lines.length === 0) return { headers: [], rows: [] }

  function splitLine(line: string): string[] {
    const out: string[] = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === ',' && !inQuotes) {
        out.push(cur.trim())
        cur = ''
      } else {
        cur += ch
      }
    }
    out.push(cur.trim())
    return out
  }

  const headers = splitLine(lines[0]).map((h) => h.toLowerCase())
  const rows = lines.slice(1).map((line) => {
    const cols = splitLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? ''
    })
    return row
  })
  return { headers, rows }
}

async function writeImportBatch(
  kind: ImportKind,
  inserted: number,
  updated: number,
  errors: string[],
): Promise<string | undefined> {
  const row = {
    kind,
    inserted_count: inserted,
    updated_count: updated,
    error_count: errors.length,
    errors: errors.slice(0, 50),
    created_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from('import_batches').insert(row).select('id').maybeSingle()
  // Don't fail the import if audit insert fails (schema may vary slightly)
  if (error) {
    // try alternate column names
    const alt = {
      import_type: kind,
      inserted,
      updated,
      error_count: errors.length,
      error_messages: errors.slice(0, 50),
    }
    const { data: d2, error: e2 } = await supabase
      .from('import_batches')
      .insert(alt)
      .select('id')
      .maybeSingle()
    if (e2) return undefined
    return d2?.id as string | undefined
  }
  return data?.id as string | undefined
}

export async function importProductsCsv(text: string): Promise<ImportBatchResult> {
  const { rows } = parseCsv(text)
  const errors: string[] = []
  let inserted = 0
  let updated = 0

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const sku = (r.sku ?? '').trim()
    if (!sku) {
      errors.push(`Row ${i + 2}: missing sku`)
      continue
    }
    const id = `p_${sanitizeIdPart(sku)}`
    const payload = {
      id,
      sku,
      name: (r.name ?? sku).trim(),
      category: (r.category ?? 'Uncategorized').trim(),
      brand: (r.brand ?? '').trim(),
      unit: (r.unit ?? 'case').trim(),
      case_pack: num(r.case_pack, 1),
      weight_lbs: num(r.weight_lbs),
      height_in: num(r.height_in),
      par_level: num(r.par_level),
      base_price: num(r.base_price),
    }
    try {
      const { data: existing } = await supabase.from('products').select('id').eq('sku', sku).maybeSingle()
      if (existing) {
        const { error } = await supabase.from('products').update(payload).eq('id', (existing as { id: string }).id)
        throwIf(error)
        updated++
      } else {
        const { error } = await supabase.from('products').upsert(payload, { onConflict: 'id' })
        throwIf(error)
        inserted++
      }
    } catch (err) {
      errors.push(`Row ${i + 2} (${sku}): ${err instanceof Error ? err.message : 'failed'}`)
    }
  }

  const batchId = await writeImportBatch('products', inserted, updated, errors)
  return { id: batchId, kind: 'products', inserted, updated, errors }
}

export async function importCustomersCsv(text: string): Promise<ImportBatchResult> {
  const { rows } = parseCsv(text)
  const errors: string[] = []
  let inserted = 0
  let updated = 0
  const validTypes = new Set(['grocery', 'convenience', 'on_premise', 'restaurant'])
  const validTiers = new Set(['A', 'B', 'C'])

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const account = (r.account_number ?? '').trim()
    if (!account) {
      errors.push(`Row ${i + 2}: missing account_number`)
      continue
    }
    const id = `c_${sanitizeIdPart(account)}`
    const typeRaw = (r.type ?? 'grocery').trim()
    const tierRaw = (r.price_tier ?? 'B').trim().toUpperCase()
    const payload = {
      id,
      account_number: account,
      name: (r.name ?? account).trim(),
      type: validTypes.has(typeRaw) ? typeRaw : 'grocery',
      address: (r.address ?? '').trim(),
      city: (r.city ?? '').trim(),
      price_tier: validTiers.has(tierRaw) ? tierRaw : 'B',
      suggested_par: {},
    }
    try {
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('account_number', account)
        .maybeSingle()
      if (existing) {
        const { error } = await supabase
          .from('customers')
          .update(payload)
          .eq('id', (existing as { id: string }).id)
        throwIf(error)
        updated++
      } else {
        const { error } = await supabase.from('customers').upsert(payload, { onConflict: 'id' })
        throwIf(error)
        inserted++
      }
    } catch (err) {
      errors.push(`Row ${i + 2} (${account}): ${err instanceof Error ? err.message : 'failed'}`)
    }
  }

  const batchId = await writeImportBatch('customers', inserted, updated, errors)
  return { id: batchId, kind: 'customers', inserted, updated, errors }
}

export async function importPricesCsv(text: string): Promise<ImportBatchResult> {
  const { rows } = parseCsv(text)
  const errors: string[] = []
  let inserted = 0
  let updated = 0

  const { data: customers } = await supabase.from('customers').select('id, account_number')
  const { data: products } = await supabase.from('products').select('id, sku')
  const acctToId = new Map(
    ((customers ?? []) as { id: string; account_number: string }[]).map((c) => [
      c.account_number,
      c.id,
    ]),
  )
  const skuToId = new Map(
    ((products ?? []) as { id: string; sku: string }[]).map((p) => [p.sku, p.id]),
  )

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const account = (r.account_number ?? '').trim()
    const sku = (r.sku ?? '').trim()
    const unitPrice = num(r.unit_price, NaN)
    if (!account || !sku || !Number.isFinite(unitPrice)) {
      errors.push(`Row ${i + 2}: need account_number, sku, unit_price`)
      continue
    }
    const customerId = acctToId.get(account)
    const productId = skuToId.get(sku)
    if (!customerId) {
      errors.push(`Row ${i + 2}: unknown account_number ${account}`)
      continue
    }
    if (!productId) {
      errors.push(`Row ${i + 2}: unknown sku ${sku}`)
      continue
    }
    const effectiveFrom = (r.effective_from ?? '').trim() || new Date().toISOString().slice(0, 10)
    try {
      const before = await fetchCustomerPrices(customerId)
      const had = before.some((p) => p.productId === productId && !p.effectiveTo)
      await upsertCustomerPrice({
        customerId,
        productId,
        unitPrice,
        effectiveFrom,
        effectiveTo: null,
      })
      if (had) updated++
      else inserted++
    } catch (err) {
      errors.push(`Row ${i + 2} (${account}/${sku}): ${err instanceof Error ? err.message : 'failed'}`)
    }
  }

  const batchId = await writeImportBatch('prices', inserted, updated, errors)
  return { id: batchId, kind: 'prices', inserted, updated, errors }
}
