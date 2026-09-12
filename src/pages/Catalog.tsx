import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { customerPrice } from '../data/customers'
import { onHandForProduct, resolveCustomerPricesBatch, type ResolvedPrice } from '../lib/api'
import { useAppData } from '../lib/DataContext'
import type { CatalogOrderLine } from '../types'

export function Catalog() {
  const { customers, products, lots, salesOrders, getCustomer, submitOrder, orderHistoryFor } =
    useAppData()
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? 'c1')
  const [cart, setCart] = useState<Record<string, number>>({})
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [priceMap, setPriceMap] = useState<Map<string, ResolvedPrice>>(new Map())
  const [pricesLoading, setPricesLoading] = useState(false)

  const customer = getCustomer(customerId) ?? customers[0]
  const history = orderHistoryFor(customerId)
  const maxHist = Math.max(...history.map((h) => h.cases), 1)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return products.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    )
  }, [search, products])

  useEffect(() => {
    if (!customer) {
      setPriceMap(new Map())
      return
    }
    let cancelled = false
    setPricesLoading(true)
    const ids = products.map((p) => p.id)
    void resolveCustomerPricesBatch(customer.id, ids, (productId) => {
      const p = products.find((x) => x.id === productId)
      return customerPrice(p?.basePrice ?? 0, customer.priceTier)
    })
      .then((map) => {
        if (!cancelled) setPriceMap(map)
      })
      .catch(() => {
        if (!cancelled) {
          const fallback = new Map<string, ResolvedPrice>()
          for (const p of products) {
            fallback.set(p.id, {
              productId: p.id,
              unitPrice: customerPrice(p.basePrice, customer.priceTier),
              source: 'tier',
            })
          }
          setPriceMap(fallback)
        }
      })
      .finally(() => {
        if (!cancelled) setPricesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [customer, products])

  function unitPriceFor(productId: string): number {
    const resolved = priceMap.get(productId)
    if (resolved) return resolved.unitPrice
    const p = products.find((x) => x.id === productId)
    return customer ? customerPrice(p?.basePrice ?? 0, customer.priceTier) : 0
  }

  function sourceFor(productId: string): 'account' | 'tier' {
    return priceMap.get(productId)?.source ?? 'tier'
  }

  function addToCart(productId: string, qty = 1) {
    setCart((c) => ({ ...c, [productId]: (c[productId] ?? 0) + qty }))
  }

  function setQty(productId: string, qty: number) {
    setCart((c) => {
      const next = { ...c }
      if (qty <= 0) delete next[productId]
      else next[productId] = qty
      return next
    })
  }

  const lines: CatalogOrderLine[] = customer
    ? Object.entries(cart).map(([productId, qty]) => ({
        productId,
        qty,
        unitPrice: unitPriceFor(productId),
      }))
    : []
  const total = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0)

  async function submit() {
    if (lines.length === 0 || !customer) return
    setSaving(true)
    try {
      const order = await submitOrder(customer.id, lines)
      setCart({})
      setToast(`Order ${order.id} submitted for ${customer.name} — $${total.toFixed(2)}`)
      setTimeout(() => setToast(''), 4000)
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to submit order')
    } finally {
      setSaving(false)
    }
  }

  if (!customer) {
    return <p className="text-sm text-slate-500">No customers loaded.</p>
  }

  return (
    <div>
      <PageHeader
        title="Digital Catalog & Order Entry"
        subtitle="Customer pricing via resolve_customer_price, inventory, par suggestions"
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={customer.id}
          onChange={(e) => {
            setCustomerId(e.target.value)
            setCart({})
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.accountNumber}) · Tier {c.priceTier}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search catalog…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:max-w-xs"
        />
        {pricesLoading && <span className="text-xs text-slate-500">Resolving prices…</span>}
      </div>

      {toast && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
          {toast}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card title="Products">
            <div className="space-y-2">
              {filtered.map((p) => {
                const price = unitPriceFor(p.id)
                const source = sourceFor(p.id)
                const onHand = onHandForProduct(lots, p.id)
                const par = customer.suggestedPar[p.id]
                const inCart = cart[p.id] ?? 0
                return (
                  <div
                    key={p.id}
                    className="flex flex-col gap-2 rounded-lg border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">
                        {p.sku} · {p.category} · {onHand} on hand
                        {par != null && <span className="ml-2 text-brand-600">Par {par}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900">${price.toFixed(2)}</span>
                        <div className="mt-0.5">
                          {source === 'account' ? (
                            <Badge tone="account">Account-specific</Badge>
                          ) : (
                            <Badge tone="tier">Tier default</Badge>
                          )}
                        </div>
                      </div>
                      {inCart > 0 ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="h-8 w-8 rounded-lg border border-slate-200 text-sm"
                            onClick={() => setQty(p.id, inCart - 1)}
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{inCart}</span>
                          <button
                            type="button"
                            className="h-8 w-8 rounded-lg border border-slate-200 text-sm"
                            onClick={() => setQty(p.id, inCart + 1)}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToCart(p.id, par ?? 1)}
                          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                        >
                          {par ? `Add par (${par})` : 'Add'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Order history trend">
            {history.length === 0 ? (
              <p className="text-sm text-slate-500">No order history for this account yet.</p>
            ) : (
              <>
                <div className="flex h-28 items-end gap-1.5">
                  {history.map((h) => (
                    <div key={h.week} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-brand-500"
                        style={{ height: `${(h.cases / maxHist) * 100}%`, minHeight: 4 }}
                        title={`${h.cases} cases`}
                      />
                      <span className="text-[9px] text-slate-400">{h.week}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">Weekly cases — from order_history</p>
              </>
            )}
          </Card>

          <Card
            title="Cart"
            action={
              <button
                type="button"
                disabled={lines.length === 0 || saving}
                onClick={() => void submit()}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
              >
                {saving ? 'Submitting…' : 'Submit order'}
              </button>
            }
          >
            {lines.length === 0 ? (
              <p className="text-sm text-slate-500">Cart is empty</p>
            ) : (
              <ul className="space-y-2">
                {lines.map((l) => {
                  const p = products.find((x) => x.id === l.productId)
                  return (
                    <li key={l.productId} className="flex justify-between text-sm">
                      <span>
                        {p?.sku} × {l.qty}
                      </span>
                      <span className="font-medium">${(l.qty * l.unitPrice).toFixed(2)}</span>
                    </li>
                  )
                })}
                <li className="flex justify-between border-t border-slate-100 pt-2 text-sm font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </li>
              </ul>
            )}
          </Card>

          {salesOrders.length > 0 && (
            <Card title="Submitted">
              <ul className="space-y-2 text-xs">
                {salesOrders.slice(0, 5).map((o) => (
                  <li key={o.id} className="rounded-lg bg-slate-50 px-2 py-1.5">
                    <span className="font-mono font-medium">{o.id.slice(0, 8)}</span>
                    <span className="float-right font-semibold">${o.total.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
