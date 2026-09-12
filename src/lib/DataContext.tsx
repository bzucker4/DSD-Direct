import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createPosAsset,
  ensureSeededOnce,
  fetchAll,
  receivePoLine,
  saveSurveyResult,
  submitSalesOrder,
  updateCycleCountLineQty,
  updateCycleCountStatus,
  updateLocationAssignedSku,
  updatePosAssetStatus,
  updateShelfSlotRow,
  type InventoryMovement,
  type OrderHistoryPointRow,
} from './api'
import { useAuth } from './AuthContext'
import type {
  CatalogOrderLine,
  Customer,
  CycleCount,
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

export interface AppData {
  products: Product[]
  customers: Customer[]
  locations: Location[]
  lots: Lot[]
  purchaseOrders: PurchaseOrderLine[]
  cycleCounts: CycleCount[]
  pickOrders: PickOrder[]
  surveyQuestions: SurveyQuestion[]
  surveyResults: SurveyResult[]
  posAssets: PosAsset[]
  shelfSlots: ShelfSlot[]
  salesOrders: SubmittedOrder[]
  orderHistory: OrderHistoryPointRow[]
  inventoryMovements: InventoryMovement[]
  loading: boolean
  error: string | null
  getProduct: (id: string) => Product | undefined
  getCustomer: (id: string) => Customer | undefined
  orderHistoryFor: (customerId: string) => { week: string; cases: number }[]
  refresh: () => Promise<void>
  receiveLine: (id: string, qty: number, locationId: string) => Promise<void>
  submitOrder: (customerId: string, lines: CatalogOrderLine[]) => Promise<SubmittedOrder>
  startCycleCount: (id: string) => Promise<void>
  setCycleCounted: (
    countId: string,
    locationId: string,
    productId: string,
    countedQty: number | null,
  ) => Promise<void>
  completeCycleCount: (id: string) => Promise<void>
  saveSurvey: (
    customerId: string,
    answers: Record<string, string | number | boolean>,
  ) => Promise<SurveyResult>
  advancePosStatus: (id: string, status: PosAsset['status']) => Promise<void>
  requestPosAsset: (input: {
    name: string
    type: PosAsset['type']
    customerId: string
    notes: string
  }) => Promise<PosAsset>
  assignSku: (locationId: string, sku: string | null) => Promise<void>
  patchShelfSlot: (id: string, patch: Partial<ShelfSlot>) => Promise<void>
}

const DataContext = createContext<AppData | null>(null)

const empty = {
  products: [] as Product[],
  customers: [] as Customer[],
  locations: [] as Location[],
  lots: [] as Lot[],
  purchaseOrders: [] as PurchaseOrderLine[],
  cycleCounts: [] as CycleCount[],
  pickOrders: [] as PickOrder[],
  surveyQuestions: [] as SurveyQuestion[],
  surveyResults: [] as SurveyResult[],
  posAssets: [] as PosAsset[],
  shelfSlots: [] as ShelfSlot[],
  salesOrders: [] as SubmittedOrder[],
  orderHistory: [] as OrderHistoryPointRow[],
  inventoryMovements: [] as InventoryMovement[],
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [data, setData] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!session) {
      setData(empty)
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    try {
      await ensureSeededOnce()
      const next = await fetchAll()
      setData(next)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load live data')
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const getProduct = useCallback(
    (id: string) => data.products.find((p) => p.id === id),
    [data.products],
  )
  const getCustomer = useCallback(
    (id: string) => data.customers.find((c) => c.id === id),
    [data.customers],
  )

  const orderHistoryFor = useCallback(
    (customerId: string) =>
      data.orderHistory
        .filter((h) => h.customerId === customerId)
        .map((h) => ({ week: h.week, cases: h.cases })),
    [data.orderHistory],
  )

  const receiveLine = useCallback(async (id: string, qty: number, locationId: string) => {
    const { line, lot } = await receivePoLine(id, qty, locationId)
    setData((prev) => ({
      ...prev,
      purchaseOrders: prev.purchaseOrders.map((p) => (p.id === line.id ? line : p)),
      lots: prev.lots.some((l) => l.id === lot.id)
        ? prev.lots.map((l) => (l.id === lot.id ? lot : l))
        : [...prev.lots, lot],
      locations: prev.locations.map((loc) =>
        loc.id === locationId ? { ...loc, occupiedCases: loc.occupiedCases + qty } : loc,
      ),
    }))
    // Refresh movements after receive (best-effort)
    void fetchAll()
      .then((next) => {
        setData((prev) => ({
          ...prev,
          inventoryMovements: next.inventoryMovements,
          lots: next.lots,
          purchaseOrders: next.purchaseOrders,
          locations: next.locations,
        }))
      })
      .catch(() => undefined)
  }, [])

  const submitOrder = useCallback(async (customerId: string, lines: CatalogOrderLine[]) => {
    const order = await submitSalesOrder(customerId, lines)
    setData((prev) => ({ ...prev, salesOrders: [order, ...prev.salesOrders] }))
    return order
  }, [])

  const startCycleCount = useCallback(async (id: string) => {
    const current = data.cycleCounts.find((c) => c.id === id)
    if (current && current.status === 'pending') {
      await updateCycleCountStatus(id, 'in_progress')
      setData((prev) => ({
        ...prev,
        cycleCounts: prev.cycleCounts.map((c) =>
          c.id === id && c.status === 'pending' ? { ...c, status: 'in_progress' } : c,
        ),
      }))
    }
  }, [data.cycleCounts])

  const setCycleCounted = useCallback(
    async (countId: string, locationId: string, productId: string, countedQty: number | null) => {
      await updateCycleCountLineQty(countId, locationId, productId, countedQty)
      setData((prev) => ({
        ...prev,
        cycleCounts: prev.cycleCounts.map((c) => {
          if (c.id !== countId) return c
          return {
            ...c,
            lines: c.lines.map((l) =>
              l.locationId === locationId && l.productId === productId ? { ...l, countedQty } : l,
            ),
          }
        }),
      }))
    },
    [],
  )

  const completeCycleCount = useCallback(async (id: string) => {
    const current = data.cycleCounts.find((c) => c.id === id)
    if (!current) return
    const allDone = current.lines.every((l) => l.countedQty !== null)
    if (!allDone) return
    await updateCycleCountStatus(id, 'complete')
    setData((prev) => ({
      ...prev,
      cycleCounts: prev.cycleCounts.map((c) => (c.id === id ? { ...c, status: 'complete' } : c)),
    }))
  }, [data.cycleCounts])

  const saveSurvey = useCallback(
    async (customerId: string, answers: Record<string, string | number | boolean>) => {
      const result = await saveSurveyResult(customerId, answers)
      setData((prev) => ({ ...prev, surveyResults: [result, ...prev.surveyResults] }))
      return result
    },
    [],
  )

  const advancePosStatus = useCallback(async (id: string, status: PosAsset['status']) => {
    await updatePosAssetStatus(id, status)
    setData((prev) => ({
      ...prev,
      posAssets: prev.posAssets.map((a) => (a.id === id ? { ...a, status } : a)),
    }))
  }, [])

  const requestPosAsset = useCallback(
    async (input: { name: string; type: PosAsset['type']; customerId: string; notes: string }) => {
      const asset = await createPosAsset(input)
      setData((prev) => ({ ...prev, posAssets: [asset, ...prev.posAssets] }))
      return asset
    },
    [],
  )

  const assignSku = useCallback(async (locationId: string, sku: string | null) => {
    await updateLocationAssignedSku(locationId, sku)
    setData((prev) => ({
      ...prev,
      locations: prev.locations.map((l) =>
        l.id === locationId ? { ...l, assignedSku: sku ?? undefined } : l,
      ),
    }))
  }, [])

  const patchShelfSlot = useCallback(async (id: string, patch: Partial<ShelfSlot>) => {
    await updateShelfSlotRow(id, patch)
    setData((prev) => ({
      ...prev,
      shelfSlots: prev.shelfSlots.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }))
  }, [])

  const value = useMemo<AppData>(
    () => ({
      ...data,
      loading,
      error,
      getProduct,
      getCustomer,
      orderHistoryFor,
      refresh,
      receiveLine,
      submitOrder,
      startCycleCount,
      setCycleCounted,
      completeCycleCount,
      saveSurvey,
      advancePosStatus,
      requestPosAsset,
      assignSku,
      patchShelfSlot,
    }),
    [
      data,
      loading,
      error,
      getProduct,
      getCustomer,
      orderHistoryFor,
      refresh,
      receiveLine,
      submitOrder,
      startCycleCount,
      setCycleCounted,
      completeCycleCount,
      saveSurvey,
      advancePosStatus,
      requestPosAsset,
      assignSku,
      patchShelfSlot,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useAppData(): AppData {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useAppData must be used within DataProvider')
  return ctx
}
