import { useMemo, useState } from 'react'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { useAppData } from '../lib/DataContext'
import type { Location } from '../types'

function suggestPutaway(productId: string, crossDock: boolean, locations: Location[]): string {
  if (crossDock) {
    const dock = locations.find((l) => l.zone === 'X' && l.occupiedCases < l.capacityCases)
    return dock?.id ?? 'X-DOCK-01-1-A'
  }
  const assigned = locations.find(
    (l) => l.assignedSku === productId && l.occupiedCases < l.capacityCases,
  )
  if (assigned) return assigned.id
  const empty = locations.find(
    (l) => !l.assignedSku && l.zone !== 'X' && l.occupiedCases < l.capacityCases,
  )
  return empty?.id ?? 'C-01-01-1-A'
}

export function Receiving() {
  const { purchaseOrders, locations, getProduct, receiveLine } = useAppData()
  const firstOpen = purchaseOrders.find((p) => p.status !== 'received')
  const [selectedId, setSelectedId] = useState(firstOpen?.id ?? '')
  const [recvQty, setRecvQty] = useState(
    firstOpen ? firstOpen.orderedQty - firstOpen.receivedQty : 0,
  )
  const [crossDock, setCrossDock] = useState(false)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const selected = purchaseOrders.find((p) => p.id === selectedId)
  const remaining = selected ? selected.orderedQty - selected.receivedQty : 0
  const suggested = selected ? suggestPutaway(selected.productId, crossDock, locations) : ''

  const openLines = useMemo(
    () => purchaseOrders.filter((p) => p.status !== 'received'),
    [purchaseOrders],
  )

  async function receive() {
    if (!selected || recvQty <= 0) return
    const qty = Math.min(recvQty, remaining)
    const slot = suggestPutaway(selected.productId, crossDock, locations)
    setSaving(true)
    try {
      await receiveLine(selected.id, qty, slot)
      setMessage(
        `Received ${qty} cases of ${getProduct(selected.productId)?.sku} → put-away ${slot}${
          crossDock ? ' (cross-dock)' : ''
        }`,
      )
      setRecvQty(0)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to persist receive')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Receiving & Put-away"
        subtitle="Receive PO lines into locations with suggested put-away slots"
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card title="Open PO lines" className="lg:col-span-3">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-500">
                  <th className="pb-2 pr-2 font-medium">PO</th>
                  <th className="pb-2 pr-2 font-medium">SKU</th>
                  <th className="pb-2 pr-2 font-medium">Vendor</th>
                  <th className="pb-2 pr-2 font-medium">Ordered</th>
                  <th className="pb-2 pr-2 font-medium">Recv</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {openLines.map((line) => {
                  const p = getProduct(line.productId)
                  const active = line.id === selectedId
                  return (
                    <tr
                      key={line.id}
                      onClick={() => {
                        setSelectedId(line.id)
                        setRecvQty(line.orderedQty - line.receivedQty)
                        setMessage('')
                      }}
                      className={`cursor-pointer ${active ? 'bg-brand-50' : 'hover:bg-slate-50'}`}
                    >
                      <td className="py-2.5 pr-2 font-mono text-xs">{line.poNumber}</td>
                      <td className="py-2.5 pr-2">
                        <div className="font-medium">{p?.sku}</div>
                        <div className="text-xs text-slate-500">{p?.name}</div>
                      </td>
                      <td className="py-2.5 pr-2 text-xs">{line.vendor}</td>
                      <td className="py-2.5 pr-2">{line.orderedQty}</td>
                      <td className="py-2.5 pr-2">{line.receivedQty}</td>
                      <td className="py-2.5">
                        <Badge tone={line.status}>{line.status}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Receive into location" className="lg:col-span-2">
          {selected ? (
            <>
              <p className="text-sm font-medium text-slate-900">
                {getProduct(selected.productId)?.name}
              </p>
              <p className="text-xs text-slate-500">
                {selected.poNumber} · remaining {remaining} cases
              </p>

              <label className="mt-4 block text-xs font-medium text-slate-600">Receive qty</label>
              <input
                type="number"
                min={1}
                max={remaining}
                value={recvQty}
                onChange={(e) => setRecvQty(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />

              <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={crossDock}
                  onChange={(e) => setCrossDock(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600"
                />
                Cross-dock (stage to dock)
              </label>

              <div className="mt-4 rounded-lg border border-dashed border-brand-200 bg-brand-50/50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-brand-700">
                  Suggested put-away
                </p>
                <p className="mt-1 font-mono text-lg font-semibold text-brand-900">{suggested}</p>
              </div>

              <button
                type="button"
                onClick={() => void receive()}
                disabled={remaining <= 0 || recvQty <= 0 || saving}
                className="mt-4 w-full rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Confirm receive'}
              </button>

              {message && (
                <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
                  {message}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">Select a PO line to receive.</p>
          )}
        </Card>
      </div>
    </div>
  )
}
