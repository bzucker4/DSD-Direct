import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { Badge } from '../components/Badge'
import {
  deleteCustomerPrice,
  fetchCustomerPrices,
  importCustomersCsv,
  importPricesCsv,
  importProductsCsv,
  type CustomerPrice,
  type ImportBatchResult,
  type ImportKind,
  upsertCustomerPrice,
} from '../lib/api'
import { useAppData } from '../lib/DataContext'

const TEMPLATES: { kind: ImportKind; href: string; label: string }[] = [
  { kind: 'products', href: '/templates/products.csv', label: 'products.csv' },
  { kind: 'customers', href: '/templates/customers.csv', label: 'customers.csv' },
  { kind: 'prices', href: '/templates/prices.csv', label: 'prices.csv' },
]

export function ImportPage() {
  const { customers, products, refresh } = useAppData()
  const [kind, setKind] = useState<ImportKind>('products')
  const [fileName, setFileName] = useState('')
  const [csvText, setCsvText] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<ImportBatchResult | null>(null)
  const [error, setError] = useState('')

  // Customer prices admin
  const [priceCustomerId, setPriceCustomerId] = useState(customers[0]?.id ?? '')
  const [prices, setPrices] = useState<CustomerPrice[]>([])
  const [priceProductId, setPriceProductId] = useState(products[0]?.id ?? '')
  const [priceValue, setPriceValue] = useState('')
  const [priceBusy, setPriceBusy] = useState(false)
  const [priceMsg, setPriceMsg] = useState('')

  useEffect(() => {
    if (!priceCustomerId && customers[0]) setPriceCustomerId(customers[0].id)
  }, [customers, priceCustomerId])

  useEffect(() => {
    if (!priceProductId && products[0]) setPriceProductId(products[0].id)
  }, [products, priceProductId])

  const loadPrices = useCallback(async () => {
    if (!priceCustomerId) {
      setPrices([])
      return
    }
    try {
      const rows = await fetchCustomerPrices(priceCustomerId)
      setPrices(rows)
    } catch (err) {
      setPriceMsg(err instanceof Error ? err.message : 'Failed to load prices')
    }
  }, [priceCustomerId])

  useEffect(() => {
    void loadPrices()
  }, [loadPrices])

  const productName = useMemo(() => {
    const map = new Map(products.map((p) => [p.id, p]))
    return (id: string) => {
      const p = map.get(id)
      return p ? `${p.sku} · ${p.name}` : id
    }
  }, [products])

  async function onFile(file: File | null) {
    setResult(null)
    setError('')
    if (!file) {
      setFileName('')
      setCsvText('')
      return
    }
    setFileName(file.name)
    const text = await file.text()
    setCsvText(text)
  }

  async function runImport() {
    if (!csvText.trim()) {
      setError('Choose a CSV file first')
      return
    }
    setBusy(true)
    setError('')
    setResult(null)
    try {
      let res: ImportBatchResult
      if (kind === 'products') res = await importProductsCsv(csvText)
      else if (kind === 'customers') res = await importCustomersCsv(csvText)
      else res = await importPricesCsv(csvText)
      setResult(res)
      await refresh()
      if (kind === 'prices') await loadPrices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setBusy(false)
    }
  }

  async function savePrice() {
    const unitPrice = Number(priceValue)
    if (!priceCustomerId || !priceProductId || !Number.isFinite(unitPrice)) {
      setPriceMsg('Select account, product, and a valid unit price')
      return
    }
    setPriceBusy(true)
    setPriceMsg('')
    try {
      await upsertCustomerPrice({
        customerId: priceCustomerId,
        productId: priceProductId,
        unitPrice,
      })
      setPriceValue('')
      setPriceMsg('Saved account-specific price')
      await loadPrices()
    } catch (err) {
      setPriceMsg(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setPriceBusy(false)
    }
  }

  async function removePrice(id: string | undefined) {
    if (!id) return
    setPriceBusy(true)
    try {
      await deleteCustomerPrice(id)
      await loadPrices()
    } catch (err) {
      setPriceMsg(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setPriceBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="CSV Import"
        subtitle="Upsert products, customers, and account prices — warehouse / admin only"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TEMPLATES.map((t) => (
          <a
            key={t.kind}
            href={t.href}
            download
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
          >
            Template: {t.label}
          </a>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Upload">
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-600">Import type</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as ImportKind)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="products">Products</option>
              <option value="customers">Customers</option>
              <option value="prices">Customer prices</option>
            </select>

            <label className="block text-xs font-medium text-slate-600">CSV file</label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600"
            />
            {fileName && (
              <p className="text-xs text-slate-500">
                Loaded <span className="font-mono">{fileName}</span> ({csvText.split(/\r?\n/).filter(Boolean).length - 1} data rows)
              </p>
            )}

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>
            )}

            <button
              type="button"
              disabled={busy || !csvText}
              onClick={() => void runImport()}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
            >
              {busy ? 'Importing…' : 'Run import'}
            </button>

            {result && (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                <p className="font-semibold text-slate-800">
                  Batch {result.id ? result.id.slice(0, 8) : '(local)'} · {result.kind}
                </p>
                <p className="mt-1 text-slate-600">
                  Inserted {result.inserted} · Updated {result.updated} · Errors {result.errors.length}
                </p>
                {result.errors.length > 0 && (
                  <ul className="mt-2 max-h-32 list-disc space-y-0.5 overflow-y-auto pl-4 text-rose-700">
                    {result.errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card title="Account price overrides">
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-600">Account</label>
            <select
              value={priceCustomerId}
              onChange={(e) => setPriceCustomerId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.accountNumber}) · Tier {c.priceTier}
                </option>
              ))}
            </select>

            <div className="grid gap-2 sm:grid-cols-3">
              <select
                value={priceProductId}
                onChange={(e) => setPriceProductId(e.target.value)}
                className="rounded-lg border border-slate-200 px-2 py-2 text-sm sm:col-span-2"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Unit $"
                value={priceValue}
                onChange={(e) => setPriceValue(e.target.value)}
                className="rounded-lg border border-slate-200 px-2 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              disabled={priceBusy}
              onClick={() => void savePrice()}
              className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-100 disabled:opacity-40"
            >
              Save override
            </button>
            {priceMsg && <p className="text-xs text-slate-600">{priceMsg}</p>}

            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {prices.length === 0 ? (
                <li className="text-sm text-slate-500">No account overrides for this customer.</li>
              ) : (
                prices.map((p) => (
                  <li
                    key={p.id ?? `${p.customerId}-${p.productId}-${p.effectiveFrom}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800">{productName(p.productId)}</p>
                      <p className="text-slate-500">
                        ${p.unitPrice.toFixed(2)}
                        {p.effectiveFrom && ` · from ${p.effectiveFrom}`}
                        {p.effectiveTo && ` → ${p.effectiveTo}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="account">Account</Badge>
                      {p.id && (
                        <button
                          type="button"
                          className="text-rose-600 hover:underline"
                          onClick={() => void removePrice(p.id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}
