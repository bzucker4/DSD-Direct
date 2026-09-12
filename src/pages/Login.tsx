import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

const DEMO_ACCOUNTS = [
  { email: 'warehouse@dsddirect.demo', role: 'warehouse' },
  { email: 'field@dsddirect.demo', role: 'field_rep' },
  { email: 'admin@dsddirect.demo', role: 'admin' },
] as const

export function Login() {
  const { session, loading, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-slate-50 via-brand-50 to-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-lg font-bold text-white shadow-lg">
            DD
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">DSD Direct</h1>
          <p className="mt-1 text-sm text-slate-500">
            Wright Beverage · Warehouse & Field Sales
          </p>
        </div>

        <form
          onSubmit={(e) => void onSubmit(e)}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">Sign in</h2>
          <p className="mt-1 text-xs text-slate-500">
            Use your invited email and password. Roles come from JWT{' '}
            <code className="rounded bg-slate-100 px-1">app_metadata.role</code>.
          </p>

          <label className="mt-5 block text-xs font-medium text-slate-600">Email</label>
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none ring-brand-500 focus:ring-2"
          />

          <label className="mt-4 block text-xs font-medium text-slate-600">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none ring-brand-500 focus:ring-2"
          />

          {error && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || loading}
            className="mt-5 w-full rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
            <strong className="text-slate-700">Invite note:</strong> Admins invite users in the{' '}
            <a
              className="font-medium text-brand-700 underline"
              href="https://supabase.com/dashboard/project/jdtdtuioenznqyipngvw/auth/users"
              target="_blank"
              rel="noreferrer"
            >
              Supabase Auth dashboard
            </a>{' '}
            and set <code className="rounded bg-slate-100 px-1">app_metadata.role</code> to{' '}
            <code className="rounded bg-slate-100 px-1">admin</code>,{' '}
            <code className="rounded bg-slate-100 px-1">warehouse</code>, or{' '}
            <code className="rounded bg-slate-100 px-1">field_rep</code>.
          </p>
        </form>

        <details className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4 text-xs text-slate-600">
          <summary className="cursor-pointer font-semibold text-slate-800">
            Pilot mode — demo accounts
          </summary>
          <p className="mt-2 text-slate-500">
            For UAT only. Password for all:{' '}
            <span className="font-mono">DemoPass123!</span>. Replace before production.
          </p>
          <ul className="mt-3 space-y-2">
            {DEMO_ACCOUNTS.map((a) => (
              <li key={a.email}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(a.email)
                    setPassword('DemoPass123!')
                  }}
                  className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-left hover:border-brand-200 hover:bg-brand-50"
                >
                  <span className="font-mono text-[11px] text-slate-800">{a.email}</span>
                  <span className="float-right rounded-full bg-white px-2 py-0.5 text-[10px] font-medium uppercase text-brand-700 ring-1 ring-brand-100">
                    {a.role}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  )
}
