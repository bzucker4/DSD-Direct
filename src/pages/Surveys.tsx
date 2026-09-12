import { useState } from 'react'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { useAppData } from '../lib/DataContext'

export function Surveys() {
  const { customers, surveyQuestions, surveyResults, getCustomer, saveSurvey } = useAppData()
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? 'c1')
  const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({})
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const categories = [...new Set(surveyQuestions.map((q) => q.category))]

  function setAnswer(id: string, value: string | number | boolean) {
    setAnswers((a) => ({ ...a, [id]: value }))
    setSaved(false)
  }

  async function save() {
    setBusy(true)
    setError('')
    try {
      await saveSurvey(customerId, { ...answers })
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save survey')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Retail Execution / RED Surveys"
        subtitle="Shelf compliance, cooler space, tap handles — results persist to Supabase"
      />

      <div className="mb-4">
        <select
          value={customerId}
          onChange={(e) => {
            setCustomerId(e.target.value)
            setAnswers({})
            setSaved(false)
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {c.type.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          {categories.map((cat) => (
            <Card key={cat} title={cat}>
              <div className="space-y-4">
                {surveyQuestions
                  .filter((q) => q.category === cat)
                  .map((q) => (
                    <div key={q.id}>
                      <label className="block text-sm font-medium text-slate-800">{q.label}</label>
                      {q.type === 'yes_no' && (
                        <div className="mt-1.5 flex gap-2">
                          {[true, false].map((v) => (
                            <button
                              key={String(v)}
                              type="button"
                              onClick={() => setAnswer(q.id, v)}
                              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                                answers[q.id] === v
                                  ? 'bg-brand-600 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {v ? 'Yes' : 'No'}
                            </button>
                          ))}
                        </div>
                      )}
                      {q.type === 'number' && (
                        <input
                          type="number"
                          value={(answers[q.id] as number | undefined) ?? ''}
                          onChange={(e) => setAnswer(q.id, Number(e.target.value))}
                          className="mt-1.5 w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                      )}
                      {q.type === 'select' && (
                        <select
                          value={(answers[q.id] as string) ?? ''}
                          onChange={(e) => setAnswer(q.id, e.target.value)}
                          className="mt-1.5 w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        >
                          <option value="">Select…</option>
                          {q.options?.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      )}
                      {q.type === 'text' && (
                        <textarea
                          rows={2}
                          value={(answers[q.id] as string) ?? ''}
                          onChange={(e) => setAnswer(q.id, e.target.value)}
                          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                      )}
                    </div>
                  ))}
              </div>
            </Card>
          ))}

          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40 sm:w-auto"
          >
            {busy ? 'Saving…' : 'Save survey results'}
          </button>
          {saved && (
            <p className="text-sm font-medium text-emerald-700">Survey saved.</p>
          )}
          {error && <p className="text-sm font-medium text-rose-700">{error}</p>}
        </div>

        <Card title="Saved surveys" className="lg:col-span-2">
          <ul className="space-y-3">
            {surveyResults.map((r) => {
              const c = getCustomer(r.customerId)
              return (
                <li key={r.id} className="rounded-lg border border-slate-100 p-3">
                  <p className="text-sm font-semibold text-slate-900">{c?.name}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(r.completedAt).toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {Object.keys(r.answers).length} answers · score{' '}
                    {String(r.answers.q9 ?? '—')}
                  </p>
                </li>
              )
            })}
            {surveyResults.length === 0 && (
              <li className="text-sm text-slate-500">No surveys saved yet.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  )
}
