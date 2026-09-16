import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/* ── Global in-memory singleton state ────────────────────────────── */
let globalUser: any = null
let globalRole: string = 'client'
let globalLoading = true
let isInitialized = false
const listeners = new Set<() => void>()

// Hydrate immediately from localStorage on startup (0ms delay)
try {
  const cachedUser = localStorage.getItem('ln_auth_user')
  const cachedRole = localStorage.getItem('ln_auth_role')
  if (cachedUser) {
    globalUser = JSON.parse(cachedUser)
    globalRole = cachedRole || 'client'
    globalLoading = false
  }
} catch {}

function notify() {
  listeners.forEach(fn => fn())
}

function initAuth() {
  if (isInitialized) return
  isInitialized = true

  const syncUserAndRole = async (u: any) => {
    globalUser = u
    if (!u) {
      globalRole = 'client'
      globalLoading = false
      try {
        localStorage.removeItem('ln_auth_user')
        localStorage.removeItem('ln_auth_role')
      } catch {}
      notify()
      return
    }

    let foundRole = u.user_metadata?.role
    try {
      localStorage.setItem('ln_auth_user', JSON.stringify(u))
      if (foundRole) localStorage.setItem('ln_auth_role', foundRole)
    } catch {}

    globalRole = foundRole || 'client'
    globalLoading = false
    notify()

    // Non-blocking background check for database profile role
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', u.id)
        .maybeSingle()

      if (data?.role && data.role !== globalRole) {
        globalRole = data.role
        try { localStorage.setItem('ln_auth_role', data.role) } catch {}
        notify()
      }
    } catch (err) {
      console.error('Error fetching user role:', err)
    }
  }

  supabase.auth.getSession().then(({ data }) => {
    syncUserAndRole(data.session?.user || null)
  })

  supabase.auth.onAuthStateChange((_event, session) => {
    syncUserAndRole(session?.user || null)
  })
}

export function useAuth() {
  const [, setTick] = useState(0)

  useEffect(() => {
    initAuth()
    const update = () => setTick(t => t + 1)
    listeners.add(update)
    return () => {
      listeners.delete(update)
    }
  }, [])

  const signUp = async (email: string, password: string, full_name: string, role: string) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, role }
      }
    })
  }

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    globalUser = null
    globalRole = 'client'
    try {
      localStorage.removeItem('ln_auth_user')
      localStorage.removeItem('ln_auth_role')
      sessionStorage.clear()
    } catch {}
    notify()
    return supabase.auth.signOut()
  }

  return {
    user: globalUser,
    role: globalRole,
    loading: globalLoading,
    signUp,
    signIn,
    signOut,
  }
}
