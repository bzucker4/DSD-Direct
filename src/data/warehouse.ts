import type {
  CycleCount,
  Location,
  Lot,
  PickOrder,
  PurchaseOrderLine,
} from '../types'

function loc(
  zone: string,
  aisle: string,
  bay: string,
  level: string,
  slot: string,
  capacity: number,
  occupied: number,
  temp: Location['tempZone'],
  sku?: string,
): Location {
  return {
    id: `${zone}-${aisle}-${bay}-${level}-${slot}`,
    zone,
    aisle,
    bay,
    level,
    slot,
    capacityCases: capacity,
    occupiedCases: occupied,
    tempZone: temp,
    assignedSku: sku,
  }
}

export const locations: Location[] = [
  // Zone A — domestic & import ambient
  loc('A', '01', '01', '1', 'A', 48, 36, 'ambient', 'p1'),
  loc('A', '01', '01', '1', 'B', 48, 28, 'ambient', 'p2'),
  loc('A', '01', '01', '2', 'A', 48, 30, 'ambient', 'p3'),
  loc('A', '01', '02', '1', 'A', 40, 22, 'ambient', 'p4'),
  loc('A', '01', '02', '1', 'B', 40, 24, 'ambient', 'p5'),
  loc('A', '02', '01', '1', 'A', 36, 16, 'ambient', 'p6'),
  loc('A', '02', '01', '1', 'B', 36, 18, 'ambient', 'p7'),
  loc('A', '02', '02', '1', 'A', 36, 14, 'ambient', 'p8'),
  loc('A', '02', '02', '1', 'B', 36, 10, 'ambient', 'p9'),
  // Zone B — craft, cider, hard tea/seltzer (cooler)
  loc('B', '01', '01', '1', 'A', 30, 12, 'cooler', 'p10'),
  loc('B', '01', '01', '1', 'B', 30, 10, 'cooler', 'p11'),
  loc('B', '01', '02', '1', 'A', 30, 16, 'cooler', 'p12'),
  loc('B', '01', '02', '1', 'B', 30, 10, 'cooler', 'p13'),
  loc('B', '02', '01', '1', 'A', 28, 12, 'cooler', 'p14'),
  loc('B', '02', '01', '1', 'B', 28, 14, 'cooler', 'p15'),
  loc('B', '02', '02', '1', 'A', 24, 8, 'cooler', 'p16'),
  loc('B', '03', '01', '1', 'A', 32, 22, 'cooler', 'p17'),
  loc('B', '03', '01', '1', 'B', 32, 16, 'cooler', 'p18'),
  loc('B', '03', '02', '1', 'A', 32, 18, 'cooler', 'p19'),
  loc('B', '03', '02', '1', 'B', 32, 12, 'cooler', 'p20'),
  loc('B', '04', '01', '1', 'A', 28, 10, 'cooler', 'p21'),
  loc('B', '04', '01', '1', 'B', 28, 8, 'cooler', 'p22'),
  loc('B', '04', '02', '1', 'A', 28, 10, 'ambient', 'p23'),
  loc('B', '04', '02', '1', 'B', 28, 8, 'ambient', 'p24'),
  // Overflow / dock
  loc('C', '01', '01', '1', 'A', 50, 0, 'ambient'),
  loc('C', '01', '01', '1', 'B', 50, 0, 'ambient'),
  loc('C', '01', '02', '1', 'A', 50, 6, 'ambient'),
  loc('D', '01', '01', '1', 'A', 40, 0, 'cooler'),
  loc('X', 'DOCK', '01', '1', 'A', 80, 8, 'ambient'),
  loc('X', 'DOCK', '01', '1', 'B', 80, 0, 'ambient'),
]

export let lots: Lot[] = [
  // Miller Lite — ok + prefer
  { id: 'l1', productId: 'p1', lotCode: 'MC260812A', locationId: 'A-01-01-1-A', qtyOnHand: 24, receivedDate: '2026-08-12', codeDate: '2027-02-12', expirationDate: '2027-02-12', fefoStatus: 'ok' },
  { id: 'l2', productId: 'p1', lotCode: 'MC260520B', locationId: 'A-01-01-1-A', qtyOnHand: 12, receivedDate: '2026-05-20', codeDate: '2026-11-20', expirationDate: '2026-11-20', fefoStatus: 'prefer' },
  // Coors Light
  { id: 'l3', productId: 'p2', lotCode: 'MC260901A', locationId: 'A-01-01-1-B', qtyOnHand: 28, receivedDate: '2026-09-01', codeDate: '2027-03-01', expirationDate: '2027-03-01', fefoStatus: 'ok' },
  // Bud Light
  { id: 'l4', productId: 'p3', lotCode: 'ABI260710A', locationId: 'A-01-01-2-A', qtyOnHand: 30, receivedDate: '2026-07-10', codeDate: '2027-01-10', expirationDate: '2027-01-10', fefoStatus: 'ok' },
  // Michelob Ultra
  { id: 'l5', productId: 'p4', lotCode: 'ABI260401A', locationId: 'A-01-02-1-A', qtyOnHand: 22, receivedDate: '2026-04-01', codeDate: '2026-10-01', expirationDate: '2026-10-01', fefoStatus: 'expiring' },
  // Budweiser
  { id: 'l6', productId: 'p5', lotCode: 'ABI260615B', locationId: 'A-01-02-1-B', qtyOnHand: 24, receivedDate: '2026-06-15', codeDate: '2026-12-15', expirationDate: '2026-12-15', fefoStatus: 'ok' },
  // Stella
  { id: 'l7', productId: 'p6', lotCode: 'ABI260830A', locationId: 'A-02-01-1-A', qtyOnHand: 16, receivedDate: '2026-08-30', codeDate: '2027-02-28', expirationDate: '2027-02-28', fefoStatus: 'ok' },
  // Modelo
  { id: 'l8', productId: 'p7', lotCode: 'CST260901A', locationId: 'A-02-01-1-B', qtyOnHand: 18, receivedDate: '2026-09-01', codeDate: '2027-03-01', expirationDate: '2027-03-01', fefoStatus: 'ok' },
  // Corona — expiring lot + fresh
  { id: 'l9', productId: 'p8', lotCode: 'CST260825A', locationId: 'A-02-02-1-A', qtyOnHand: 8, receivedDate: '2026-08-25', codeDate: '2026-10-25', expirationDate: '2026-10-25', fefoStatus: 'expiring' },
  { id: 'l10', productId: 'p8', lotCode: 'CST260905B', locationId: 'A-02-02-1-A', qtyOnHand: 6, receivedDate: '2026-09-05', codeDate: '2026-12-05', expirationDate: '2026-12-05', fefoStatus: 'ok' },
  // Dos Equis
  { id: 'l11', productId: 'p9', lotCode: 'HEI260820A', locationId: 'A-02-02-1-B', qtyOnHand: 10, receivedDate: '2026-08-20', codeDate: '2027-02-20', expirationDate: '2027-02-20', fefoStatus: 'ok' },
  // Ithaca Flower Power
  { id: 'l12', productId: 'p10', lotCode: 'ITH260828A', locationId: 'B-01-01-1-A', qtyOnHand: 12, receivedDate: '2026-08-28', codeDate: '2027-02-28', expirationDate: '2027-02-28', fefoStatus: 'ok' },
  // Southern Tier
  { id: 'l13', productId: 'p11', lotCode: 'ST260901A', locationId: 'B-01-01-1-B', qtyOnHand: 10, receivedDate: '2026-09-01', codeDate: '2027-03-01', expirationDate: '2027-03-01', fefoStatus: 'ok' },
  // Genesee
  { id: 'l14', productId: 'p12', lotCode: 'GEN260815A', locationId: 'B-01-02-1-A', qtyOnHand: 16, receivedDate: '2026-08-15', codeDate: '2027-02-15', expirationDate: '2027-02-15', fefoStatus: 'ok' },
  // Saranac
  { id: 'l15', productId: 'p13', lotCode: 'SAR260820A', locationId: 'B-01-02-1-B', qtyOnHand: 10, receivedDate: '2026-08-20', codeDate: '2027-02-20', expirationDate: '2027-02-20', fefoStatus: 'ok' },
  // Brooklyn — expiring + prefer
  { id: 'l16', productId: 'p14', lotCode: 'BKL260710A', locationId: 'B-02-01-1-A', qtyOnHand: 4, receivedDate: '2026-07-10', codeDate: '2026-10-10', expirationDate: '2026-10-10', fefoStatus: 'expiring' },
  { id: 'l17', productId: 'p14', lotCode: 'BKL260901B', locationId: 'B-02-01-1-A', qtyOnHand: 8, receivedDate: '2026-09-01', codeDate: '2026-12-01', expirationDate: '2026-12-01', fefoStatus: 'prefer' },
  // Angry Orchard
  { id: 'l18', productId: 'p15', lotCode: 'BB260901A', locationId: 'B-02-01-1-B', qtyOnHand: 14, receivedDate: '2026-09-01', codeDate: '2026-12-01', expirationDate: '2026-12-01', fefoStatus: 'ok' },
  // McKenzie's
  { id: 'l19', productId: 'p16', lotCode: 'MCK260905A', locationId: 'B-02-02-1-A', qtyOnHand: 8, receivedDate: '2026-09-05', codeDate: '2027-03-05', expirationDate: '2027-03-05', fefoStatus: 'ok' },
  // Twisted Tea Original
  { id: 'l20', productId: 'p17', lotCode: 'BB260812A', locationId: 'B-03-01-1-A', qtyOnHand: 22, receivedDate: '2026-08-12', codeDate: '2027-02-12', expirationDate: '2027-02-12', fefoStatus: 'ok' },
  // Twisted Tea Half & Half
  { id: 'l21', productId: 'p18', lotCode: 'BB260820A', locationId: 'B-03-01-1-B', qtyOnHand: 16, receivedDate: '2026-08-20', codeDate: '2027-02-20', expirationDate: '2027-02-20', fefoStatus: 'ok' },
  // White Claw
  { id: 'l22', productId: 'p19', lotCode: 'MA260901A', locationId: 'B-03-02-1-A', qtyOnHand: 18, receivedDate: '2026-09-01', codeDate: '2027-03-01', expirationDate: '2027-03-01', fefoStatus: 'ok' },
  // Truly
  { id: 'l23', productId: 'p20', lotCode: 'BB260828A', locationId: 'B-03-02-1-B', qtyOnHand: 12, receivedDate: '2026-08-28', codeDate: '2027-02-28', expirationDate: '2027-02-28', fefoStatus: 'ok' },
  // Mike's
  { id: 'l24', productId: 'p21', lotCode: 'MA260815A', locationId: 'B-04-01-1-A', qtyOnHand: 10, receivedDate: '2026-08-15', codeDate: '2027-02-15', expirationDate: '2027-02-15', fefoStatus: 'ok' },
  // Clausthaler
  { id: 'l25', productId: 'p22', lotCode: 'CL260901A', locationId: 'B-04-01-1-B', qtyOnHand: 8, receivedDate: '2026-09-01', codeDate: '2027-03-01', expirationDate: '2027-03-01', fefoStatus: 'ok' },
  // Pure Leaf NA teas
  { id: 'l26', productId: 'p23', lotCode: 'PL260820A', locationId: 'B-04-02-1-A', qtyOnHand: 10, receivedDate: '2026-08-20', codeDate: '2027-02-20', expirationDate: '2027-02-20', fefoStatus: 'ok' },
  { id: 'l27', productId: 'p24', lotCode: 'PL260825A', locationId: 'B-04-02-1-B', qtyOnHand: 8, receivedDate: '2026-08-25', codeDate: '2027-02-25', expirationDate: '2027-02-25', fefoStatus: 'ok' },
  // Expired Twisted Tea on dock (FEFO variety)
  { id: 'l28', productId: 'p17', lotCode: 'BB260301X', locationId: 'X-DOCK-01-1-A', qtyOnHand: 4, receivedDate: '2026-03-01', codeDate: '2026-09-01', expirationDate: '2026-09-01', fefoStatus: 'expired' },
  // Overflow Miller Lite
  { id: 'l29', productId: 'p1', lotCode: 'MC260910D', locationId: 'C-01-02-1-A', qtyOnHand: 6, receivedDate: '2026-09-10', codeDate: '2027-03-10', expirationDate: '2027-03-10', fefoStatus: 'ok' },
  // Expired White Claw dock remainder
  { id: 'l30', productId: 'p19', lotCode: 'MA260215X', locationId: 'X-DOCK-01-1-A', qtyOnHand: 4, receivedDate: '2026-02-15', codeDate: '2026-08-15', expirationDate: '2026-08-15', fefoStatus: 'expired' },
]

export const purchaseOrders: PurchaseOrderLine[] = [
  { id: 'po1', poNumber: 'PO-4521', productId: 'p1', orderedQty: 48, receivedQty: 0, status: 'open', vendor: 'Molson Coors', expectedDate: '2026-09-12' },
  { id: 'po2', poNumber: 'PO-4521', productId: 'p2', orderedQty: 36, receivedQty: 0, status: 'open', vendor: 'Molson Coors', expectedDate: '2026-09-12' },
  { id: 'po3', poNumber: 'PO-4521', productId: 'p17', orderedQty: 40, receivedQty: 16, status: 'partial', vendor: 'Boston Beer', expectedDate: '2026-09-12' },
  { id: 'po4', poNumber: 'PO-4528', productId: 'p3', orderedQty: 48, receivedQty: 0, status: 'open', vendor: 'AB InBev', expectedDate: '2026-09-13' },
  { id: 'po5', poNumber: 'PO-4528', productId: 'p7', orderedQty: 36, receivedQty: 0, status: 'open', vendor: 'Constellation Brands', expectedDate: '2026-09-13' },
  { id: 'po6', poNumber: 'PO-4510', productId: 'p19', orderedQty: 30, receivedQty: 30, status: 'received', vendor: 'Mark Anthony Brands', expectedDate: '2026-09-10' },
  { id: 'po7', poNumber: 'PO-4532', productId: 'p10', orderedQty: 12, receivedQty: 0, status: 'open', vendor: 'Ithaca Beer Co.', expectedDate: '2026-09-14' },
  { id: 'po8', poNumber: 'PO-4532', productId: 'p11', orderedQty: 10, receivedQty: 0, status: 'open', vendor: 'Southern Tier Brewing', expectedDate: '2026-09-14' },
]

export const cycleCounts: CycleCount[] = [
  {
    id: 'cc1',
    zone: 'A',
    aisle: '01',
    status: 'pending',
    dueDate: '2026-09-12',
    lines: [
      { locationId: 'A-01-01-1-A', productId: 'p1', systemQty: 36, countedQty: null },
      { locationId: 'A-01-01-1-B', productId: 'p2', systemQty: 28, countedQty: null },
      { locationId: 'A-01-01-2-A', productId: 'p3', systemQty: 30, countedQty: null },
      { locationId: 'A-01-02-1-A', productId: 'p4', systemQty: 22, countedQty: null },
      { locationId: 'A-01-02-1-B', productId: 'p5', systemQty: 24, countedQty: null },
    ],
  },
  {
    id: 'cc2',
    zone: 'B',
    aisle: '03',
    status: 'pending',
    dueDate: '2026-09-13',
    lines: [
      { locationId: 'B-03-01-1-A', productId: 'p17', systemQty: 22, countedQty: null },
      { locationId: 'B-03-01-1-B', productId: 'p18', systemQty: 16, countedQty: null },
      { locationId: 'B-03-02-1-A', productId: 'p19', systemQty: 18, countedQty: null },
      { locationId: 'B-03-02-1-B', productId: 'p20', systemQty: 12, countedQty: null },
    ],
  },
  {
    id: 'cc3',
    zone: 'B',
    aisle: '01',
    status: 'complete',
    dueDate: '2026-09-11',
    lines: [
      { locationId: 'B-01-01-1-A', productId: 'p10', systemQty: 12, countedQty: 11 },
      { locationId: 'B-01-01-1-B', productId: 'p11', systemQty: 10, countedQty: 10 },
      { locationId: 'B-01-02-1-A', productId: 'p12', systemQty: 16, countedQty: 16 },
    ],
  },
]

export const pickOrders: PickOrder[] = [
  {
    id: 'pk1',
    customerId: 'c1',
    stopSequence: 1,
    status: 'open',
    lines: [
      { productId: 'p1', qty: 12 },
      { productId: 'p3', qty: 10 },
      { productId: 'p17', qty: 8 },
      { productId: 'p19', qty: 6 },
    ],
  },
  {
    id: 'pk2',
    customerId: 'c2',
    stopSequence: 2,
    status: 'open',
    lines: [
      { productId: 'p1', qty: 4 },
      { productId: 'p17', qty: 6 },
      { productId: 'p19', qty: 4 },
      { productId: 'p7', qty: 3 },
    ],
  },
  {
    id: 'pk3',
    customerId: 'c5',
    stopSequence: 3,
    status: 'picking',
    lines: [
      { productId: 'p1', qty: 10 },
      { productId: 'p2', qty: 8 },
      { productId: 'p4', qty: 6 },
      { productId: 'p17', qty: 5 },
      { productId: 'p18', qty: 4 },
    ],
  },
  {
    id: 'pk4',
    customerId: 'c3',
    stopSequence: 4,
    status: 'open',
    lines: [
      { productId: 'p6', qty: 6 },
      { productId: 'p10', qty: 4 },
      { productId: 'p14', qty: 4 },
      { productId: 'p15', qty: 3 },
    ],
  },
  {
    id: 'pk5',
    customerId: 'c4',
    stopSequence: 5,
    status: 'staged',
    lines: [
      { productId: 'p6', qty: 3 },
      { productId: 'p8', qty: 2 },
      { productId: 'p23', qty: 2 },
    ],
  },
]

export function onHandSkuCount(): number {
  const skus = new Set(lots.filter((l) => l.qtyOnHand > 0).map((l) => l.productId))
  return skus.size
}

export function fefoAlertCount(): number {
  return lots.filter((l) => l.fefoStatus === 'expiring' || l.fefoStatus === 'expired').length
}

export function openPickCount(): number {
  return pickOrders.filter((p) => p.status === 'open' || p.status === 'picking').length
}

export function cycleCountsDue(): number {
  return cycleCounts.filter((c) => c.status === 'pending' || c.status === 'in_progress').length
}

export function loadsToday(): number {
  return 3
}
