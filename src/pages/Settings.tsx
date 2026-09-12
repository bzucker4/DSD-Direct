import { useState, type FormEvent } from 'react'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { useAuth, type AppRole } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

function roleLabel(role: AppRole | null): string {
  if (role === 'field_rep') return 'Field Rep'
  if (role === 'warehouse') return 'Warehouse'
  if (role === 'admin') return 'Admin'
  return 'Unknown'
}

export function Settings() {
  const { user, role, signOut } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const isDemo = (user?.email ?? '').endsWith('@dsddirect.demo')

  async function onChangePassword(e: FormEvent) {
    e.preventDefault()
    setMsg('')
    setErr('')
    if (password.length < 8) {
      setErr('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setErr('Passwords do not match')
      return
    }
    setBusy(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw new Error(error.message)
      setPassword('')
      setConfirm('')
      setMsg('Password updated')
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader title="Account" subtitle="Role, password, and sign out" />

      {isDemo && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Demo account</strong> — replace before production. Prefer inviting real users in the
          Supabase dashboard.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Profile">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-medium text-slate-500">Email</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{user?.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Role (app_metadata)</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{roleLabel(role)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">User id</dt>
              <dd className="mt-0.5 truncate font-mono text-xs text-slate-600">{user?.id ?? '—'}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </Card>

        <Card title="Change password">
          <form onSubmit={(e) => void onChangePassword(e)} className="space-y-3">
            <p className="text-xs text-slate-500">
              Uses <code className="rounded bg-slate-100 px-1">supabase.auth.updateUser</code>. Admins
              invite users in{' '}
              <a
                className="font-medium text-brand-700 underline"
                href="https://supabase.com/dashboard/project/jdtdtuioenznqyipngvw/auth/users"
                target="_blank"
                rel="noreferrer"
              >
                Supabase Auth → Users
              </a>
              .
            </p>
            <label className="block text-xs font-medium text-slate-600">New password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <label className="block text-xs font-medium text-slate-600">Confirm</label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            {err && <p className="text-xs font-medium text-rose-700">{err}</p>}
            {msg && <p className="text-xs font-medium text-emerald-700">{msg}</p>}
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
            >
              {busy ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  )
}
