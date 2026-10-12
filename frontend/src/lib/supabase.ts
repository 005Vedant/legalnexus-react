/**
 * LegalNexus Client SDK — Powered by MongoDB (Database & Auth) + Cloudflare R2 (Object Storage)
 * Replaces @supabase/supabase-js with zero external DNS dependencies on *.supabase.co
 */

const API_BASE = import.meta.env.VITE_API_URL || '';
const SESSION_KEY = 'ln_auth_session';

type AuthChangeCallback = (event: string, session: any) => void;
const authListeners = new Set<AuthChangeCallback>();
const uploadedUrlsCache = new Map<string, string>();

// Clean up any legacy Supabase tokens from localStorage
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        localStorage.removeItem(key);
      }
    }
  } catch {}
}

function getStoredSession(): any | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.expires_at && parsed.expires_at * 1000 <= Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function setStoredSession(session: any | null) {
  try {
    if (!session) {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem('ln_auth_user');
      localStorage.removeItem('ln_auth_role');
    } else {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      if (session.user) {
        localStorage.setItem('ln_auth_user', JSON.stringify(session.user));
        const role = session.user.role || session.user.user_metadata?.role || 'client';
        localStorage.setItem('ln_auth_role', role);
      }
    }
  } catch {}
}

function notifyAuthListeners(event: string, session: any | null) {
  authListeners.forEach((cb) => {
    try {
      cb(event, session);
    } catch (err) {
      console.error('Auth listener error:', err);
    }
  });
}

class ClientQueryBuilder {
  private collection: string;
  private operation: string = 'select';
  private filters: Array<{ type: string; field: string; value?: any; values?: any[] }> = [];
  private sortField: string | null = null;
  private sortAsc: boolean = true;
  private payload: any = null;
  private expectSingle: boolean = false;
  private expectMaybeSingle: boolean = false;

  constructor(collection: string) {
    this.collection = collection;
  }

  select(_columns: string = '*') {
    if (this.operation === 'select') {
      this.operation = 'select';
    }
    return this;
  }

  insert(data: any) {
    this.operation = 'insert';
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.operation = 'update';
    this.payload = data;
    return this;
  }

  upsert(data: any) {
    this.operation = 'upsert';
    this.payload = data;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ type: 'eq', field, value });
    return this;
  }

  in(field: string, values: any[]) {
    this.filters.push({ type: 'in', field, values });
    return this;
  }

  order(field: string, options: { ascending?: boolean } = { ascending: true }) {
    this.sortField = field;
    this.sortAsc = options?.ascending !== false;
    return this;
  }

  single() {
    this.expectSingle = true;
    return this;
  }

  maybeSingle() {
    this.expectMaybeSingle = true;
    return this;
  }

  async execute(): Promise<{ data: any; error: any }> {
    try {
      const session = getStoredSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`${API_BASE}/api/db/${this.collection}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          operation: this.operation,
          filters: this.filters,
          sortField: this.sortField,
          sortAsc: this.sortAsc,
          payload: this.payload,
          expectSingle: this.expectSingle,
          expectMaybeSingle: this.expectMaybeSingle,
        }),
      });

      const json = await res.json();
      return { data: json.data ?? null, error: json.error ?? null };
    } catch (err: any) {
      return { data: null, error: { message: err?.message || 'Network error' } };
    }
  }

  then<TResult1 = { data: any; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const supabase = {
  from: (collection: string) => new ClientQueryBuilder(collection),

  auth: {
    async getSession() {
      const localSession = getStoredSession();
      if (!localSession?.access_token) {
        return { data: { session: null }, error: null };
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/session`, {
          headers: {
            Authorization: `Bearer ${localSession.access_token}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.session) {
            const merged = { ...localSession, ...json.data.session };
            setStoredSession(merged);
            return { data: { session: merged }, error: null };
          }
        }
      } catch {
        // Return cached session if offline
        return { data: { session: localSession }, error: null };
      }

      return { data: { session: localSession }, error: null };
    },

    onAuthStateChange(callback: AuthChangeCallback) {
      authListeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback);
            },
          },
        },
      };
    },

    async signUp({
      email,
      password,
      options,
    }: {
      email: string;
      password: string;
      options?: { data?: { full_name?: string; role?: string; bar_enrollment?: string } };
    }) {
      try {
        const res = await fetch(`${API_BASE}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, options }),
        });
        const json = await res.json();
        if (!res.ok || json.error) {
          return { data: { user: null, session: null }, error: json.error || { message: 'Signup failed' } };
        }

        if (json.data?.session) {
          setStoredSession(json.data.session);
          notifyAuthListeners('SIGNED_IN', json.data.session);
        }

        return { data: json.data, error: null };
      } catch (err: any) {
        return { data: { user: null, session: null }, error: { message: err?.message || 'Failed to connect to server' } };
      }
    },

    async signInWithPassword({ email, password }: { email: string; password: string }) {
      try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok || json.error) {
          return { data: { user: null, session: null }, error: json.error || { message: 'Invalid login credentials' } };
        }

        if (json.data?.session) {
          setStoredSession(json.data.session);
          notifyAuthListeners('SIGNED_IN', json.data.session);
        }

        return { data: json.data, error: null };
      } catch (err: any) {
        return { data: { user: null, session: null }, error: { message: err?.message || 'Failed to connect to server' } };
      }
    },

    async signOut(_opts?: any) {
      setStoredSession(null);
      notifyAuthListeners('SIGNED_OUT', null);
      try {
        await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
      } catch {}
      return { error: null };
    },
  },

  storage: {
    from(bucket: string) {
      return {
        async upload(filePath: string, file: File, _options?: any) {
          try {
            const formData = new FormData();
            formData.append('bucket', bucket);
            formData.append('path', filePath);
            formData.append('file', file);

            const session = getStoredSession();
            const headers: Record<string, string> = {};
            if (session?.access_token) {
              headers['Authorization'] = `Bearer ${session.access_token}`;
            }

            const res = await fetch(`${API_BASE}/api/storage/upload`, {
              method: 'POST',
              headers,
              body: formData,
            });
            const json = await res.json();
            if (!res.ok || json.error) {
              return { data: null, error: json.error || { message: 'Upload failed' } };
            }

            if (json.data?.publicUrl) {
              uploadedUrlsCache.set(`${bucket}/${filePath}`, json.data.publicUrl);
            }

            return { data: json.data, error: null };
          } catch (err: any) {
            return { data: null, error: { message: err?.message || 'Storage upload failed' } };
          }
        },

        getPublicUrl(filePath: string) {
          const cleanPath = String(filePath).replace(/^\/+/, '');
          const cached = uploadedUrlsCache.get(`${bucket}/${filePath}`) || uploadedUrlsCache.get(`${bucket}/${cleanPath}`);
          const publicUrl = cached || `/uploads/${bucket}/${cleanPath}`;
          return { data: { publicUrl } };
        },
      };
    },
  },
};
