import { useState } from 'react'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { useAppData } from '../lib/DataContext'

export function CycleCounting() {
  const { cycleCounts, getProduct, startCycleCount, setCycleCounted, completeCycleCount } =
    useAppData()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const active = cycleCounts.find((c) => c.id === activeId)

  async function startCount(id: string) {
    setBusy(true)
    try {
      await startCycleCount(id)
      setActiveId(id)
    } finally {
      setBusy(false)
    }
  }

  async function setCounted(locationId: string, productId: string, value: number | null) {
    if (!activeId) return
    setBusy(true)
    try {
      await setCycleCounted(activeId, locationId, productId, value)
    } finally {
      setBusy(false)
    }
  }

  async function finish() {
    if (!activeId) return
    setBusy(true)
    try {
      await completeCycleCount(activeId)
    } finally {
      setBusy(false)
    }
  }

  const variance =
    active?.lines.map((l) => ({
      ...l,
      variance: l.countedQty === null ? null : l.countedQty - l.systemQty,
    })) ?? []

  return (
    <div>
      <PageHeader
        title="Cycle Counting"
        subtitle="Count by zone/aisle, enter physical counts, and review variance"
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card title="Count schedule" className="lg:col-span-2">
          <ul className="space-y-2">
            {cycleCounts.map((cc) => (
              <li
                key={cc.id}
                className={`rounded-lg border p-3 ${
                  activeId === cc.id ? 'border-brand-300 bg-brand-50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Zone {cc.zone} · Aisle {cc.aisle}
                    </p>
                    <p className="text-xs text-slate-500">
                      Due {cc.dueDate} · {cc.lines.length} locations
                    </p>
                  </div>
                  <Badge tone={cc.status}>{cc.status.replace('_', ' ')}</Badge>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void startCount(cc.id)}
                  className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-40"
                >
                  {cc.status === 'complete' ? 'Review' : cc.status === 'in_progress' ? 'Continue' : 'Start count'}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title={
            active
              ? `Counting Zone ${active.zone} / Aisle ${active.aisle}`
              : 'Select a count'
          }
          className="lg:col-span-3"
          action={
            active && active.status !== 'complete' ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void finish()}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
              >
                Complete count
              </button>
            ) : null
          }
        >
          {!active ? (
            <p className="text-sm text-slate-500">Choose a zone/aisle to begin.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase text-slate-500">
                    <th className="pb-2 pr-2 font-medium">Location</th>
                    <th className="pb-2 pr-2 font-medium">SKU</th>
                    <th className="pb-2 pr-2 font-medium">System</th>
                    <th className="pb-2 pr-2 font-medium">Counted</th>
                    <th className="pb-2 font-medium">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {variance.map((line, idx) => {
                    const p = getProduct(line.productId)
                    const v = line.variance
                    return (
                      <tr key={`${line.locationId}-${idx}`}>
                        <td className="py-2 pr-2 font-mono text-xs">{line.locationId}</td>
                        <td className="py-2 pr-2 text-xs">{p?.sku}</td>
                        <td className="py-2 pr-2">{line.systemQty}</td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            disabled={active.status === 'complete' || busy}
                            value={line.countedQty ?? ''}
                            onChange={(e) =>
                              void setCounted(
                                line.locationId,
                                line.productId,
                                e.target.value === '' ? null : Number(e.target.value),
                              )
                            }
                            className="w-20 rounded border border-slate-200 px-2 py-1 text-sm disabled:bg-slate-50"
                          />
                        </td>
                        <td className="py-2">
                          {v === null ? (
                            <span className="text-xs text-slate-400">—</span>
                          ) : (
                            <span
                              className={`text-sm font-semibold ${
                                v === 0
                                  ? 'text-emerald-600'
                                  : v > 0
                                    ? 'text-blue-600'
                                    : 'text-rose-600'
                              }`}
                            >
                              {v > 0 ? `+${v}` : v}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {active.status === 'complete' && (
                <p className="mt-3 text-xs text-slate-500">
                  Absolute variance:{' '}
                  <strong>
                    {variance.reduce((s, l) => s + Math.abs(l.variance ?? 0), 0)} cases
                  </strong>
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
