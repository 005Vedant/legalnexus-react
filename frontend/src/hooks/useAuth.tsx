import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string>('client')
  const [loading, setLoading] = useState(true)

  const syncUserAndRole = async (u: any) => {
    setUser(u)
    if (!u) {
      setRole('client')
      setLoading(false)
      return
    }

    // 1. Check user_metadata for role
    let foundRole = u.user_metadata?.role

    // 2. Fetch role from profiles table
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', u.id)
        .maybeSingle()
      if (data?.role) {
        foundRole = data.role
      }
    } catch (err) {
      console.error('Error fetching user role:', err)
    }

    setRole(foundRole || 'client')
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      syncUserAndRole(data.session?.user || null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUserAndRole(session?.user || null)
    })

    return () => subscription.unsubscribe()
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

  const signOut = () => {
    setUser(null)
    setRole('client')
    return supabase.auth.signOut()
  }

  return { user, role, loading, signUp, signIn, signOut }
}