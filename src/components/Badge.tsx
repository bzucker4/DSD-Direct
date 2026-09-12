import type { ReactNode } from 'react'

const styles: Record<string, string> = {
  ok: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  prefer: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  expiring: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  expired: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  open: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  picking: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  staged: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  loaded: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  pending: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  in_progress: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  complete: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  partial: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  received: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  requested: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  approved: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  in_transit: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  installed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  retired: 'bg-slate-100 text-slate-500 ring-slate-400/20',
  default: 'bg-slate-100 text-slate-700 ring-slate-500/20',
}

export function Badge({
  tone = 'default',
  children,
}: {
  tone?: string
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[tone] ?? styles.default}`}
    >
      {children}
    </span>
  )
}
