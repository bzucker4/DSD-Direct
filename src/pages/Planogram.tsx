import { useState } from 'react'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { useAppData } from '../lib/DataContext'
import type { ShelfSlot } from '../types'

export function Planogram() {
  const { customers, products, shelfSlots, getProduct, patchShelfSlot } = useAppData()
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? 'c1')
  const [selected, setSelected] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const slots = shelfSlots
  const shelves = [1, 2, 3, 4]
  const sel = slots.find((s) => s.id === selected)

  async function updateSlot(id: string, patch: Partial<ShelfSlot>) {
    setBusy(true)
    try {
      await patchShelfSlot(id, patch)
    } finally {
      setBusy(false)
    }
  }

  const oosCount = slots.filter((s) => s.oos && s.productId).length
  const competitorCount = slots.filter((s) => s.competitorBrand).length

  return (
    <div>
      <PageHeader
        title="Planogram & Shelf Sequencing"
        subtitle="Mobile-sized shelf layout with OOS flags and competitor placements"
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
          {oosCount} OOS
        </span>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
          {competitorCount} competitor
        </span>
      </div>

      <div className="mx-auto grid max-w-3xl gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="mx-auto w-full max-w-[380px] rounded-[2rem] border-4 border-slate-800 bg-slate-900 p-3 shadow-xl">
            <div className="mb-2 text-center text-[10px] font-medium text-slate-400">
              Field device preview · {customers.find((c) => c.id === customerId)?.name}
            </div>
            <div className="space-y-2 rounded-2xl bg-slate-100 p-3">
              {shelves.map((shelf) => (
                <div key={shelf}>
                  <p className="mb-1 text-[10px] font-semibold uppercase text-slate-500">
                    Shelf {shelf}
                  </p>
                  <div className="grid grid-cols-4 gap-1">
                    {slots
                      .filter((s) => s.shelf === shelf)
                      .sort((a, b) => a.position - b.position)
                      .map((slot) => {
                        const p = slot.productId ? getProduct(slot.productId) : null
                        const isSel = selected === slot.id
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelected(slot.id)}
                            className={`relative flex min-h-[72px] flex-col items-center justify-center rounded-lg border p-1 text-center transition ${
                              slot.competitorBrand
                                ? 'border-amber-300 bg-amber-50'
                                : slot.oos
                                  ? 'border-rose-300 bg-rose-50'
                                  : 'border-slate-200 bg-white'
                            } ${isSel ? 'ring-2 ring-brand-500' : ''}`}
                          >
                            {slot.oos && (
                              <span className="absolute right-0.5 top-0.5 rounded bg-rose-600 px-1 text-[8px] font-bold text-white">
                                OOS
                              </span>
                            )}
                            <span className="text-[9px] font-bold leading-tight text-slate-800">
                              {p?.sku.split('-').slice(0, 2).join('-') ??
                                slot.competitorBrand?.slice(0, 10) ??
                                'Empty'}
                            </span>
                            <span className="mt-0.5 text-[8px] text-slate-500">
                              {slot.facingCount}f
                            </span>
                          </button>
                        )
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Card title="Edit slot" className="lg:col-span-2">
          {!sel ? (
            <p className="text-sm text-slate-500">Tap a shelf slot to edit.</p>
          ) : (
            <div className="space-y-3">
              <p className="font-mono text-xs text-slate-500">
                Shelf {sel.shelf} · Pos {sel.position}
              </p>
              <div>
                <label className="text-xs font-medium text-slate-600">Our SKU</label>
                <select
                  disabled={busy}
                  value={sel.productId ?? ''}
                  onChange={(e) =>
                    void updateSlot(sel.id, {
                      productId: e.target.value || null,
                      competitorBrand: e.target.value ? null : sel.competitorBrand,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">— none —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Competitor brand</label>
                <input
                  disabled={busy}
                  value={sel.competitorBrand ?? ''}
                  onChange={(e) =>
                    void updateSlot(sel.id, {
                      competitorBrand: e.target.value || null,
                      productId: e.target.value ? null : sel.productId,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Facings</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  disabled={busy}
                  value={sel.facingCount}
                  onChange={(e) => void updateSlot(sel.id, { facingCount: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  disabled={busy}
                  checked={sel.oos}
                  onChange={(e) => void updateSlot(sel.id, { oos: e.target.checked })}
                  className="rounded border-slate-300"
                />
                Out of stock (OOS)
              </label>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
