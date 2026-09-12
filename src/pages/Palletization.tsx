import { useMemo, useState } from 'react'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { useAppData } from '../lib/DataContext'
import { buildPallets, DEFAULT_TRUCK } from '../lib/palletize'
import type { TruckConfig } from '../types'

export function Palletization() {
  const { pickOrders, getCustomer, getProduct } = useAppData()
  const [truck, setTruck] = useState<TruckConfig>({ ...DEFAULT_TRUCK })
  const [built, setBuilt] = useState(false)

  const pallets = useMemo(
    () => (built ? buildPallets(pickOrders, truck, getProduct) : []),
    [built, truck, pickOrders, getProduct],
  )

  const selectedOrders = pickOrders.filter((o) => o.status !== 'loaded')

  return (
    <div>
      <PageHeader
        title="Palletization & Load Optimization"
        subtitle="Route-sequenced stable pallets with weight/height limits (LIFO unload)"
        actions={
          <button
            type="button"
            onClick={() => setBuilt(true)}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Run pallet build
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Truck / bay config">
          <div className="space-y-3">
            {(
              [
                ['bays', 'Bays'],
                ['palletMaxWeightLbs', 'Pallet max weight (lbs)'],
                ['palletMaxHeightIn', 'Pallet max height (in)'],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="text-xs font-medium text-slate-600">{label}</label>
                <input
                  type="number"
                  value={truck[key]}
                  onChange={(e) => {
                    setBuilt(false)
                    setTruck((t) => ({ ...t, [key]: Number(e.target.value) }))
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Orders / stops" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-500">
                  <th className="pb-2 pr-2 font-medium">Stop</th>
                  <th className="pb-2 pr-2 font-medium">Customer</th>
                  <th className="pb-2 pr-2 font-medium">Lines</th>
                  <th className="pb-2 pr-2 font-medium">Cases</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[...selectedOrders]
                  .sort((a, b) => a.stopSequence - b.stopSequence)
                  .map((o) => {
                    const c = getCustomer(o.customerId)
                    return (
                      <tr key={o.id}>
                        <td className="py-2 pr-2 font-semibold">{o.stopSequence}</td>
                        <td className="py-2 pr-2">{c?.name}</td>
                        <td className="py-2 pr-2">{o.lines.length}</td>
                        <td className="py-2 pr-2">{o.lines.reduce((s, l) => s + l.qty, 0)}</td>
                        <td className="py-2">
                          <Badge tone={o.status}>{o.status}</Badge>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Heuristic builds last-stop-first (LIFO) so stop 1 unloads last from the nose.
          </p>
        </Card>
      </div>

      {built && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            Pallet build results ({pallets.length} pallets)
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pallets.map((plt) => {
              const c = getCustomer(plt.customerId)
              return (
                <div
                  key={plt.id}
                  className={`rounded-xl border bg-white p-4 shadow-sm ${
                    plt.stable ? 'border-slate-200' : 'border-rose-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{plt.id}</p>
                      <p className="text-xs text-slate-500">
                        Stop {plt.stopSequence} · {c?.name} · Bay {plt.bay}
                      </p>
                    </div>
                    <Badge tone={plt.stable ? 'ok' : 'expired'}>
                      {plt.stable ? 'stable' : 'over limit'}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-col-reverse gap-1">
                    {plt.layers.map((layer, i) => {
                      const p = getProduct(layer.productId)
                      const h = Math.max(28, layer.heightIn * 2.5)
                      return (
                        <div
                          key={`${plt.id}-${i}`}
                          className="flex items-center justify-between rounded-md bg-gradient-to-r from-brand-50 to-slate-50 px-2 text-xs ring-1 ring-inset ring-brand-100"
                          style={{ minHeight: h }}
                          title={`${p?.sku}: ${layer.cases} cs`}
                        >
                          <span className="font-medium text-slate-800">{p?.sku}</span>
                          <span className="text-slate-500">
                            {layer.cases} cs · {layer.weightLbs} lbs
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-3 flex justify-between border-t border-slate-100 pt-2 text-xs text-slate-600">
                    <span>{plt.totalWeight} lbs</span>
                    <span>{plt.totalHeight}" high</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
