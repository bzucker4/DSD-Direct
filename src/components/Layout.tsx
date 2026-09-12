import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { useAppData } from '../lib/DataContext'
import { canAccessField, canAccessWarehouse, useAuth, type AppRole } from '../lib/AuthContext'

const warehouseNav = [
  { to: '/inventory', label: 'Inventory & Lots' },
  { to: '/receiving', label: 'Receiving & Put-away' },
  { to: '/cycle-counting', label: 'Cycle Counting' },
  { to: '/slotting', label: 'Slotting' },
  { to: '/palletization', label: 'Palletization & Loads' },
  { to: '/import', label: 'CSV Import' },
]

const fieldNav = [
  { to: '/catalog', label: 'Digital Catalog' },
  { to: '/surveys', label: 'RED Surveys' },
  { to: '/pos', label: 'POS Management' },
  { to: '/planogram', label: 'Planogram' },
]

function roleLabel(role: AppRole | null): string {
  if (role === 'field_rep') return 'Field Rep'
  if (role === 'warehouse') return 'Warehouse'
  if (role === 'admin') return 'Admin'
  return 'User'
}

function NavItem({ to, label, end }: { to: string; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export function Layout() {
  const [open, setOpen] = useState(false)
  const { loading, error, refresh } = useAppData()
  const { user, role, signOut } = useAuth()
  const showWarehouse = canAccessWarehouse(role)
  const showField = canAccessField(role)
  const isDemo = (user?.email ?? '').endsWith('@dsddirect.demo')

  const sidebar = (
    <>
      <div className="flex items-center gap-2 px-3 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 text-sm font-bold text-white shadow">
          DD
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900">DSD Direct</div>
          <div className="text-[11px] text-slate-500">Wright Beverage · WMS + Field Sales</div>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-2 pb-6">
        <div>
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Home
          </p>
          <div className="space-y-0.5">
            <NavItem to="/" label="Dashboard" end />
            <NavItem to="/settings" label="Account" />
          </div>
        </div>
        {showWarehouse && (
          <div>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Warehouse
            </p>
            <div className="space-y-0.5">
              {warehouseNav.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </div>
          </div>
        )}
        {showField && (
          <div>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Field Sales
            </p>
            <div className="space-y-0.5">
              {fieldNav.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-slate-200 p-3 space-y-2">
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <span className="font-medium text-emerald-700">Live · Authenticated</span>
          <br />
          <span className="text-slate-500">Supabase · Rochester DC</span>
        </div>
        <div className="rounded-lg border border-slate-100 px-3 py-2 text-xs">
          <p className="truncate font-medium text-slate-800">{user?.email}</p>
          <p className="mt-0.5 text-slate-500">Role: {roleLabel(role)}</p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-2 w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex min-h-full">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-50 flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex justify-end p-2">
              <button
                type="button"
                className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="flex flex-1 flex-col" onClick={() => setOpen(false)}>
              {sidebar}
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-slate-700 lg:hidden"
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-slate-500">
              Functional & modern warehouse + field sales for DSD distributors
            </p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              Live · Authenticated
            </span>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-600/20">
              {roleLabel(role)}
            </span>
            <span className="text-xs text-slate-500">Rochester DC · Route 12</span>
          </div>
        </header>
        {isDemo && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900 lg:px-8">
            Demo account — replace before production · Role: {roleLabel(role)} ({user?.email})
          </div>
        )}
        <main className="flex-1 px-4 py-6 lg:px-8">
          {loading ? (
            <p className="text-sm text-slate-500">Loading live warehouse data…</p>
          ) : error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <p className="font-medium">Could not load live data</p>
              <p className="mt-1 text-xs">{error}</p>
              <button
                type="button"
                onClick={() => void refresh()}
                className="mt-3 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-800"
              >
                Retry
              </button>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  )
}
