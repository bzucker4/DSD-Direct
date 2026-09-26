// The app's single brand object. Values come from VITE_BRAND_* env vars at build time
// (defaults = the original DSD Direct / Wright Beverage branding). See brand.core.ts.
import { resolveBrand, type BrandConfig } from './brand.core'

export type { BrandConfig } from './brand.core'

export const brand: BrandConfig = resolveBrand(import.meta.env)

/** True for the seeded demo accounts (e.g. admin@dsddirect.demo). */
export function isDemoEmail(email: string | null | undefined): boolean {
  return (email ?? '').toLowerCase().endsWith(`@${brand.demoEmailDomain.toLowerCase()}`)
}

/** Supabase dashboard link for inviting users, derived from VITE_SUPABASE_URL. */
export function supabaseAuthUsersUrl(): string {
  const url = import.meta.env.VITE_SUPABASE_URL ?? ''
  const ref = /^https:\/\/([a-z0-9]+)\.supabase\.co/i.exec(url)?.[1]
  return ref
    ? `https://supabase.com/dashboard/project/${ref}/auth/users`
    : 'https://supabase.com/dashboard/projects'
}
