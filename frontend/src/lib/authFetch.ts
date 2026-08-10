import { supabase } from './supabase'

/**
 * Drop-in replacement for fetch() that automatically attaches the
 * Supabase session Bearer token to every backend API request.
 *
 * Usage:
 *   const data = await authFetch('/api/cases').then(r => r.json())
 *   const res  = await authFetch('/api/cases', { method: 'POST', body: JSON.stringify({...}) })
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(url, { ...options, headers })
}
