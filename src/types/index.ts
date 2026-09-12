export type FefoStatus = 'ok' | 'expiring' | 'expired' | 'prefer'

export interface Product {
  id: string
  sku: string
  name: string
  category: string
  brand: string
  unit: string
  casePack: number
  weightLbs: number
  heightIn: number
  parLevel: number
  basePrice: number
}

export interface Lot {
  id: string
  productId: string
  lotCode: string
  locationId: string
  qtyOnHand: number
  receivedDate: string
  codeDate: string
  expirationDate: string
  fefoStatus: FefoStatus
}

export interface Location {
  id: string
  zone: string
  aisle: string
  bay: string
  level: string
  slot: string
  capacityCases: number
  occupiedCases: number
  tempZone: 'ambient' | 'cooler' | 'freezer'
  assignedSku?: string
}

export interface PurchaseOrderLine {
  id: string
  poNumber: string
  productId: string
  orderedQty: number
  receivedQty: number
  status: 'open' | 'partial' | 'received'
  vendor: string
  expectedDate: string
}

export interface CycleCount {
  id: string
  zone: string
  aisle: string
  status: 'pending' | 'in_progress' | 'complete'
  dueDate: string
  lines: CycleCountLine[]
}

export interface CycleCountLine {
  locationId: string
  productId: string
  systemQty: number
  countedQty: number | null
}

export interface PickOrder {
  id: string
  customerId: string
  stopSequence: number
  status: 'open' | 'picking' | 'staged' | 'loaded'
  lines: { productId: string; qty: number }[]
}

export interface Customer {
  id: string
  name: string
  accountNumber: string
  type: 'grocery' | 'convenience' | 'on_premise' | 'restaurant'
  address: string
  city: string
  priceTier: 'A' | 'B' | 'C'
  suggestedPar: Record<string, number>
}

export interface OrderHistoryPoint {
  week: string
  cases: number
}

export interface CatalogOrderLine {
  productId: string
  qty: number
  unitPrice: number
}

export interface SubmittedOrder {
  id: string
  customerId: string
  createdAt: string
  lines: CatalogOrderLine[]
  total: number
  status: 'submitted' | 'confirmed'
}

export interface SurveyQuestion {
  id: string
  label: string
  type: 'yes_no' | 'number' | 'select' | 'text'
  options?: string[]
  category: string
}

export interface SurveyResult {
  id: string
  customerId: string
  completedAt: string
  answers: Record<string, string | number | boolean>
}

export interface PosAsset {
  id: string
  name: string
  type: 'signage' | 'display' | 'cooler_wrap' | 'tap_handle' | 'shelf_talker'
  customerId: string
  status: 'requested' | 'approved' | 'in_transit' | 'installed' | 'retired'
  requestedAt: string
  notes: string
}

export interface ShelfSlot {
  id: string
  shelf: number
  position: number
  productId: string | null
  competitorBrand: string | null
  oos: boolean
  facingCount: number
}

export interface TruckConfig {
  bays: number
  maxWeightLbs: number
  maxHeightIn: number
  palletMaxWeightLbs: number
  palletMaxHeightIn: number
}

export interface PalletBuild {
  id: string
  stopSequence: number
  customerId: string
  bay: number
  layers: { productId: string; cases: number; weightLbs: number; heightIn: number }[]
  totalWeight: number
  totalHeight: number
  stable: boolean
}
