import { Link } from 'react-router-dom'
import { Card, KpiCard } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { Badge } from '../components/Badge'
import { canAccessField, canAccessWarehouse, useAuth } from '../lib/AuthContext'
import { useAppData } from '../lib/DataContext'
import {
  cycleCountsDue,
  fefoAlertCount,
  loadsToday,
  onHandSkuCount,
  openPickCount,
} from '../lib/api'

export function Dashboard() {
  const { lots, pickOrders, cycleCounts, inventoryMovements, getProduct, getCustomer } = useAppData()
  const { role } = useAuth()
  const alerts = lots.filter((l) => l.fefoStatus === 'expiring' || l.fefoStatus === 'expired')
  const openPicks = pickOrders.filter((p) => p.status === 'open' || p.status === 'picking')
  const dueCounts = cycleCounts.filter((c) => c.status !== 'complete')
  const showWarehouse = canAccessWarehouse(role)
  const showField = canAccessField(role)

  const quickLinks = [
    ...(showWarehouse
      ? [
          { to: '/receiving', label: 'Receive PO' },
          { to: '/slotting', label: 'Slotting map' },
        ]
      : []),
    ...(showField
      ? [
          { to: '/catalog', label: 'Field catalog' },
          { to: '/surveys', label: 'RED survey' },
        ]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Operations Dashboard"
        subtitle="Rochester DC — Wright Beverage warehouse KPIs and today's work"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="On-hand SKUs" value={onHandSkuCount(lots)} hint="Active inventory" accent="blue" />
        <KpiCard label="Open picks" value={openPickCount(pickOrders)} hint="Orders to pick" accent="slate" />
        <KpiCard label="FEFO alerts" value={fefoAlertCount(lots)} hint="Expiring / expired" accent="amber" />
        <KpiCard label="Cycle counts due" value={cycleCountsDue(cycleCounts)} hint="Zones pending" accent="rose" />
        <KpiCard label="Loads today" value={loadsToday(pickOrders)} hint="Staged / loaded" accent="emerald" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card
          title="FEFO alerts"
          action={
            showWarehouse ? (
              <Link to="/inventory" className="text-xs font-medium text-brand-600 hover:text-brand-700">
                View inventory →
              </Link>
            ) : undefined
          }
        >
          <ul className="divide-y divide-slate-100">
            {alerts.slice(0, 5).map((lot) => {
              const p = getProduct(lot.productId)
              return (
                <li key={lot.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{p?.name}</p>
                    <p className="text-xs text-slate-500">
                      {lot.lotCode} · exp {lot.expirationDate} · {lot.qtyOnHand} cs
                    </p>
                  </div>
                  <Badge tone={lot.fefoStatus}>{lot.fefoStatus}</Badge>
                </li>
              )
            })}
            {alerts.length === 0 && (
              <li className="py-2.5 text-sm text-slate-500">No FEFO alerts</li>
            )}
          </ul>
        </Card>

        {showWarehouse && (
          <Card
            title="Open picks"
            action={
              <Link to="/palletization" className="text-xs font-medium text-brand-600 hover:text-brand-700">
                Build loads →
              </Link>
            }
          >
            <ul className="divide-y divide-slate-100">
              {openPicks.map((pk) => {
                const c = getCustomer(pk.customerId)
                const cases = pk.lines.reduce((s, l) => s + l.qty, 0)
                return (
                  <li key={pk.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Stop {pk.stopSequence} · {c?.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {pk.lines.length} lines · {cases} cases
                      </p>
                    </div>
                    <Badge tone={pk.status}>{pk.status}</Badge>
                  </li>
                )
              })}
              {openPicks.length === 0 && (
                <li className="py-2.5 text-sm text-slate-500">No open picks</li>
              )}
            </ul>
          </Card>
        )}

        {showWarehouse && (
          <Card
            title="Cycle counts due"
            action={
              <Link to="/cycle-counting" className="text-xs font-medium text-brand-600 hover:text-brand-700">
                Start counting →
              </Link>
            }
          >
            <ul className="divide-y divide-slate-100">
              {dueCounts.map((cc) => (
                <li key={cc.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Zone {cc.zone} · Aisle {cc.aisle}
                    </p>
                    <p className="text-xs text-slate-500">
                      Due {cc.dueDate} · {cc.lines.length} locations
                    </p>
                  </div>
                  <Badge tone={cc.status}>{cc.status.replace('_', ' ')}</Badge>
                </li>
              ))}
              {dueCounts.length === 0 && (
                <li className="py-2.5 text-sm text-slate-500">No counts due</li>
              )}
            </ul>
          </Card>
        )}

        <Card title="Recent inventory movements">
          <ul className="divide-y divide-slate-100">
            {inventoryMovements.slice(0, 8).map((m) => {
              const p = getProduct(m.productId)
              return (
                <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {m.movementType} · {(p?.sku ?? m.productId) || '—'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {m.qty} cs · {m.locationId || 'n/a'} ·{' '}
                      {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                    </p>
                  </div>
                </li>
              )
            })}
            {inventoryMovements.length === 0 && (
              <li className="py-2.5 text-sm text-slate-500">No recent movements</li>
            )}
          </ul>
        </Card>

        {quickLinks.length > 0 && (
          <Card title="Quick links">
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="rounded-lg border border-slate-200 px-3 py-3 text-center text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
