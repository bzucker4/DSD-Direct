import { useState } from 'react'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { useAppData } from '../lib/DataContext'
import type { Location } from '../types'

export function Slotting() {
  const { locations, products, getProduct, assignSku } = useAppData()
  const [zoneFilter, setZoneFilter] = useState('all')
  const [assignLoc, setAssignLoc] = useState<string | null>(null)
  const [sku, setSku] = useState(products[0]?.id ?? 'p1')
  const [busy, setBusy] = useState(false)

  const zones = [...new Set(locations.map((l) => l.zone))]
  const filtered = zoneFilter === 'all' ? locations : locations.filter((l) => l.zone === zoneFilter)

  function occupancyPct(l: Location) {
    return Math.round((l.occupiedCases / l.capacityCases) * 100)
  }

  async function assign() {
    if (!assignLoc) return
    setBusy(true)
    try {
      await assignSku(assignLoc, sku)
      setAssignLoc(null)
    } finally {
      setBusy(false)
    }
  }

  async function clear() {
    if (!assignLoc) return
    setBusy(true)
    try {
      await assignSku(assignLoc, null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Slotting"
        subtitle="Location map with occupancy — assign SKUs to pick slots"
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setZoneFilter('all')}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            zoneFilter === 'all' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
          }`}
        >
          All zones
        </button>
        {zones.map((z) => (
          <button
            key={z}
            type="button"
            onClick={() => setZoneFilter(z)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              zoneFilter === z ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
            }`}
          >
            Zone {z}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Location map" className="lg:col-span-2">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((l) => {
              const pct = occupancyPct(l)
              const p = l.assignedSku ? getProduct(l.assignedSku) : undefined
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    setAssignLoc(l.id)
                    if (l.assignedSku) setSku(l.assignedSku)
                  }}
                  className={`rounded-xl border p-3 text-left transition hover:border-brand-300 hover:shadow-sm ${
                    assignLoc === l.id ? 'border-brand-400 bg-brand-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-slate-800">{l.id}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase text-slate-600">
                      {l.tempZone}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-xs font-medium text-slate-700">
                    {p ? p.sku : 'Unassigned'}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {l.occupiedCases}/{l.capacityCases} cs · {pct}%
                  </p>
                </button>
              )
            })}
          </div>
        </Card>

        <Card title="Assign SKU to slot">
          {assignLoc ? (
            <>
              <p className="font-mono text-sm font-semibold text-slate-900">{assignLoc}</p>
              <label className="mt-3 block text-xs font-medium text-slate-600">SKU</label>
              <select
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={busy}
                onClick={() => void assign()}
                className="mt-4 w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
              >
                Assign to slot
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void clear()}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Clear assignment
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-500">Select a location on the map.</p>
          )}

          <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Legend</p>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="h-2 w-6 rounded bg-emerald-500" /> Under 70%
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="h-2 w-6 rounded bg-amber-500" /> 70–89%
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="h-2 w-6 rounded bg-rose-500" /> 90%+ full
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
