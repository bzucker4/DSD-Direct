import { useMemo, useState } from 'react'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { sortLotsFefo } from '../lib/fefo'
import { allocateFefoPick, type FefoAllocation } from '../lib/api'
import { useAppData } from '../lib/DataContext'
import type { FefoStatus } from '../types'

export function Inventory() {
  const { lots, products, getProduct } = useAppData()
  const [statusFilter, setStatusFilter] = useState<FefoStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [allocSku, setAllocSku] = useState(products[0]?.id ?? '')
  const [allocQty, setAllocQty] = useState(10)
  const [allocResult, setAllocResult] = useState<{ allocations: FefoAllocation[]; shortfall: number } | null>(null)
  const [allocBusy, setAllocBusy] = useState(false)
  const [allocError, setAllocError] = useState('')

  const filtered = useMemo(() => {
    let list = sortLotsFefo(lots)
    if (statusFilter !== 'all') list = list.filter((l) => l.fefoStatus === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((l) => {
        const p = getProduct(l.productId)
        return (
          l.lotCode.toLowerCase().includes(q) ||
          p?.sku.toLowerCase().includes(q) ||
          p?.name.toLowerCase().includes(q) ||
          l.locationId.toLowerCase().includes(q)
        )
      })
    }
    return list
  }, [lots, statusFilter, search, getProduct])

  async function runAllocate() {
    setAllocBusy(true)
    setAllocError('')
    try {
      const result = await allocateFefoPick(
        allocSku,
        allocQty,
        `demo-pick-${Date.now()}`,
      )
      setAllocResult(result)
    } catch (err) {
      setAllocError(err instanceof Error ? err.message : 'FEFO allocate failed')
      setAllocResult(null)
    } finally {
      setAllocBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Inventory & Lots"
        subtitle="Lot-level inventory with code dates and FEFO-aware allocation"
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Search SKU, lot, location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-brand-500 focus:ring-2 sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'prefer', 'ok', 'expiring', 'expired'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                statusFilter === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Lots / batches" className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-500">
                  <th className="pb-2 pr-3 font-medium">SKU</th>
                  <th className="pb-2 pr-3 font-medium">Lot</th>
                  <th className="pb-2 pr-3 font-medium">Location</th>
                  <th className="pb-2 pr-3 font-medium">Qty</th>
                  <th className="pb-2 pr-3 font-medium">Expires</th>
                  <th className="pb-2 font-medium">FEFO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((lot) => {
                  const p = getProduct(lot.productId)
                  return (
                    <tr key={lot.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 pr-3">
                        <div className="font-medium text-slate-900">{p?.sku}</div>
                        <div className="text-xs text-slate-500">{p?.name}</div>
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-xs">{lot.lotCode}</td>
                      <td className="py-2.5 pr-3 font-mono text-xs">{lot.locationId}</td>
                      <td className="py-2.5 pr-3">{lot.qtyOnHand}</td>
                      <td className="py-2.5 pr-3 text-xs">{lot.expirationDate}</td>
                      <td className="py-2.5">
                        <Badge tone={lot.fefoStatus}>{lot.fefoStatus}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="FEFO allocation">
          <p className="mb-3 text-xs text-slate-500">
            Server FEFO via <span className="font-mono">allocate_fefo_pick</span>. Expired lots are skipped.
          </p>
          <label className="block text-xs font-medium text-slate-600">Product</label>
          <select
            value={allocSku}
            onChange={(e) => setAllocSku(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku}
              </option>
            ))}
          </select>
          <label className="mt-3 block text-xs font-medium text-slate-600">Qty needed (cases)</label>
          <input
            type="number"
            min={1}
            value={allocQty}
            onChange={(e) => setAllocQty(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => void runAllocate()}
            disabled={allocBusy || !allocSku}
            className="mt-4 w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
          >
            {allocBusy ? 'Allocating…' : 'Allocate FEFO'}
          </button>
          {allocError && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
              {allocError}
            </p>
          )}
          {allocResult && (
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
              {allocResult.allocations.length === 0 ? (
                <p className="text-rose-600">No available lots</p>
              ) : (
                <ul className="space-y-1">
                  {allocResult.allocations.map((a) => (
                    <li key={a.lotId} className="flex justify-between text-xs">
                      <span className="font-mono">{a.lotCode}</span>
                      <span className="font-medium">{a.qty} cs</span>
                    </li>
                  ))}
                </ul>
              )}
              {allocResult.shortfall > 0 && (
                <p className="mt-2 text-xs font-medium text-rose-600">
                  Shortfall: {allocResult.shortfall} cases
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
