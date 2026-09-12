import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type AppRole = 'admin' | 'warehouse' | 'field_rep'

export interface AuthState {
  session: Session | null
  user: User | null
  role: AppRole | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

function roleFromUser(user: User | null): AppRole | null {
  const raw = user?.app_metadata?.role
  if (raw === 'admin' || raw === 'warehouse' || raw === 'field_rep') return raw
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setLoading(false)
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  }, [])

  const user = session?.user ?? null
  const role = roleFromUser(user)

  const value = useMemo<AuthState>(
    () => ({ session, user, role, loading, signIn, signOut }),
    [session, user, role, loading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function canAccessWarehouse(role: AppRole | null): boolean {
  return role === 'admin' || role === 'warehouse'
}

export function canAccessField(role: AppRole | null): boolean {
  return role === 'admin' || role === 'field_rep' || role === 'warehouse'
}
