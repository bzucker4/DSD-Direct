import { useState } from 'react'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { useAppData } from '../lib/DataContext'
import type { PosAsset } from '../types'

const workflow: PosAsset['status'][] = [
  'requested',
  'approved',
  'in_transit',
  'installed',
  'retired',
]

const types: PosAsset['type'][] = [
  'signage',
  'display',
  'cooler_wrap',
  'tap_handle',
  'shelf_talker',
]

export function PosManagement() {
  const { posAssets, customers, getCustomer, advancePosStatus, requestPosAsset } = useAppData()
  const [name, setName] = useState('')
  const [type, setType] = useState<PosAsset['type']>('signage')
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? 'c1')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)

  async function advance(id: string) {
    const asset = posAssets.find((a) => a.id === id)
    if (!asset) return
    const idx = workflow.indexOf(asset.status)
    if (idx < 0 || idx >= workflow.length - 1) return
    setBusy(true)
    try {
      await advancePosStatus(id, workflow[idx + 1])
    } finally {
      setBusy(false)
    }
  }

  async function request() {
    if (!name.trim()) return
    setBusy(true)
    try {
      await requestPosAsset({
        name: name.trim(),
        type,
        customerId,
        notes,
      })
      setName('')
      setNotes('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="POS Management"
        subtitle="Request and track marketing collateral, signage, and display assets"
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card title="New POS request" className="lg:col-span-2">
          <label className="text-xs font-medium text-slate-600">Asset name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="e.g. Summer cooler cling"
          />
          <label className="mt-3 text-xs font-medium text-slate-600">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as PosAsset['type'])}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t.replace('_', ' ')}
              </option>
            ))}
          </select>
          <label className="mt-3 text-xs font-medium text-slate-600">Customer</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <label className="mt-3 text-xs font-medium text-slate-600">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void request()}
            className="mt-4 w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
          >
            Submit request
          </button>
        </Card>

        <Card title="Asset workflow" className="lg:col-span-3">
          <div className="mb-3 flex flex-wrap gap-1">
            {workflow.map((s) => (
              <span key={s} className="text-[10px] uppercase text-slate-400">
                {s.replace('_', ' ')}
                {s !== 'retired' && ' → '}
              </span>
            ))}
          </div>
          <ul className="space-y-2">
            {posAssets.map((a) => {
              const c = getCustomer(a.customerId)
              return (
                <li
                  key={a.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{a.name}</p>
                    <p className="text-xs text-slate-500">
                      {a.type.replace('_', ' ')} · {c?.name} · {a.requestedAt}
                    </p>
                    {a.notes && <p className="mt-0.5 text-xs text-slate-400">{a.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={a.status}>{a.status.replace('_', ' ')}</Badge>
                    {a.status !== 'retired' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void advance(a.id)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                      >
                        Advance →
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>
    </div>
  )
}
