import { supabase } from './supabase'

/**
 * Drop-in replacement for fetch() that automatically attaches the
 * Supabase session Bearer token to every backend API request.
 *
 * Usage:
 *   const data = await authFetch('/api/cases').then(r => r.json())
 *   const res  = await authFetch('/api/cases', { method: 'POST', body: JSON.stringify({...}) })
 */
const API_BASE = import.meta.env.VITE_API_URL || '';

let cachedToken: string | null = null
let tokenExpiresAt = 0

// Listen to auth state changes to invalidate or update token cache immediately
supabase.auth.onAuthStateChange((_event, session) => {
  cachedToken = session?.access_token || null
  tokenExpiresAt = Date.now() + 15 * 1000
})

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token = cachedToken

  if (!token || Date.now() > tokenExpiresAt) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      token = session?.access_token || null
      cachedToken = token
      tokenExpiresAt = Date.now() + 15 * 1000
    } catch {
      token = null
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const targetUrl = url.startsWith('/') && API_BASE ? `${API_BASE}${url}` : url;
  return fetch(targetUrl, { ...options, headers })
}

