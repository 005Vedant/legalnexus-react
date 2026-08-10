import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

type AuthMode = 'login' | 'signup'
type Role = 'client' | 'lawyer'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signupSchema = z.object({
  full_name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginData = z.infer<typeof loginSchema>
type SignupData = z.infer<typeof signupSchema>

const roles: { id: Role; label: string; desc: string; icon: string }[] = [
  { id: 'client', label: 'Client',  desc: 'Seeking legal help',  icon: '👤' },
  { id: 'lawyer', label: 'Lawyer',  desc: 'Legal professional',   icon: '👨‍⚖️' },
]

const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #1e3a5f 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: 440,
    background: '#ffffff',
    borderRadius: 20,
    boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
    overflow: 'hidden',
  },
  cardTop: {
    background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)',
    padding: '32px 36px 28px',
    textAlign: 'center' as const,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 6,
  },
  logoIcon: {
    width: 40, height: 40,
    background: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20,
    backdropFilter: 'blur(4px)',
  },
  logoText: {
    fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px',
  },
  tagline: {
    fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2,
  },
  cardBody: {
    padding: '28px 36px 36px',
  },
  tabRow: {
    display: 'flex',
    background: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },
  tab: (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '9px 0',
    borderRadius: 9,
    fontSize: 13, fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.18s',
    background: active ? '#fff' : 'transparent',
    color: active ? '#0F172A' : '#64748B',
    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
  }),
  label: {
    fontSize: 12, fontWeight: 600, color: '#475569',
    letterSpacing: '0.04em', textTransform: 'uppercase' as const,
    display: 'block', marginBottom: 6,
  },
  input: {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #E2E8F0',
    borderRadius: 10, fontSize: 14, color: '#0F172A',
    outline: 'none', background: '#F8FAFC',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  fieldWrap: {
    marginBottom: 14,
  },
  roleGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
    marginBottom: 20,
  },
  roleBtn: (active: boolean): React.CSSProperties => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '12px 8px', borderRadius: 12,
    border: active ? '2px solid #2563EB' : '2px solid #E2E8F0',
    background: active ? '#EFF6FF' : '#F8FAFC',
    cursor: 'pointer', transition: 'all 0.15s',
    gap: 4,
  }),
  roleIcon: {
    fontSize: 20, lineHeight: 1,
  },
  roleLabel: (active: boolean): React.CSSProperties => ({
    fontSize: 12, fontWeight: 700,
    color: active ? '#2563EB' : '#374151',
  }),
  roleDesc: (active: boolean): React.CSSProperties => ({
    fontSize: 10, color: active ? '#3B82F6' : '#9CA3AF',
    textAlign: 'center' as const, lineHeight: 1.3,
  }),
  submitBtn: {
    width: '100%', padding: '13px 0',
    background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)',
    color: '#fff', border: 'none', borderRadius: 11,
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
    marginTop: 6, letterSpacing: '0.02em',
    boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
    transition: 'opacity 0.15s, transform 0.1s',
  },
  successBox: {
    background: '#F0FDF4', border: '1px solid #BBF7D0',
    borderRadius: 10, padding: '11px 14px',
    fontSize: 13, color: '#15803D', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  errorBox: {
    background: '#FFF1F2', border: '1px solid #FECDD3',
    borderRadius: 10, padding: '11px 14px',
    fontSize: 13, color: '#BE123C', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: 600, color: '#94A3B8',
    textTransform: 'uppercase' as const, letterSpacing: '0.06em',
    marginBottom: 10, display: 'block',
  },
  divider: {
    borderTop: '1px solid #F1F5F9', marginBottom: 20,
  },
}

function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={S.fieldWrap}>
      <label style={S.label}>{label}</label>
      {children}
      {error && (
        <p style={{ fontSize: 11, color: '#DC2626', marginTop: 5, fontWeight: 500 }}>
          ⚠ {error}
        </p>
      )}
    </div>
  )
}

const StyledInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => {
    const [focused, setFocused] = useState(false)
    return (
      <input
        ref={ref}
        {...props}
        style={{
          ...S.input,
          borderColor: focused ? '#2563EB' : '#E2E8F0',
          boxShadow: focused ? '0 0 0 3px rgba(37,99,235,0.10)' : 'none',
          background: focused ? '#fff' : '#F8FAFC',
        }}
        onFocus={(e: React.FocusEvent<HTMLInputElement>) => { setFocused(true); props.onFocus?.(e) }}
        onBlur={(e: React.FocusEvent<HTMLInputElement>) => { setFocused(false); props.onBlur?.(e) }}
      />
    )
  }
)

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [role, setRole] = useState<Role>('client')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) })
  const signupForm = useForm<SignupData>({ resolver: zodResolver(signupSchema) })

  const onLogin = async (data: LoginData) => {
    setMessage(null); setError(null); setSubmitting(true)
    const { error } = await signIn(data.email, data.password)
    setSubmitting(false)
    if (error) { setError(error.message); return }
    navigate('/')
  }

  const onSignup = async (data: SignupData) => {
    setMessage(null); setError(null); setSubmitting(true)
    const { error } = await signUp(data.email, data.password, data.full_name, role)
    setSubmitting(false)
    if (error) { setError(error.message); return }
    setMessage('Account created! You can now sign in.')
  }

  const switchMode = (m: AuthMode) => {
    setMode(m); setError(null); setMessage(null)
  }

  return (
    <div style={S.page}>
      <div style={S.card}>

        {/* Card top / brand */}
        <div style={S.cardTop}>
          <div style={S.logoRow}>
            <div style={S.logoIcon}>⚖️</div>
            <span style={S.logoText}>LegalNexus</span>
          </div>
          <p style={S.tagline}>Your legal intelligence platform</p>
        </div>

        {/* Card body */}
        <div style={S.cardBody}>

          {/* Tabs */}
          <div style={S.tabRow}>
            {(['login', 'signup'] as AuthMode[]).map(tab => (
              <button key={tab} style={S.tab(mode === tab)} onClick={() => switchMode(tab)}>
                {tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Role selector — signup only */}
          {mode === 'signup' && (
            <>
              <span style={S.sectionLabel}>I am a</span>
              <div style={S.roleGrid}>
                {roles.map(r => (
                  <button
                    key={r.id} type="button"
                    style={S.roleBtn(role === r.id)}
                    onClick={() => setRole(r.id)}
                  >
                    <span style={S.roleIcon}>{r.icon}</span>
                    <span style={S.roleLabel(role === r.id)}>{r.label}</span>
                    <span style={S.roleDesc(role === r.id)}>{r.desc}</span>
                  </button>
                ))}
              </div>
              <div style={S.divider} />
            </>
          )}

          {/* Feedback */}
          {message && (
            <div style={S.successBox}>
              <span>✅</span> {message}
            </div>
          )}
          {error && (
            <div style={S.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(onLogin)}>
              <Field label="Email" error={loginForm.formState.errors.email?.message}>
                <StyledInput
                  {...loginForm.register('email')}
                  placeholder="you@example.com"
                  type="email"
                />
              </Field>
              <Field label="Password" error={loginForm.formState.errors.password?.message}>
                <StyledInput
                  {...loginForm.register('password')}
                  type="password"
                  placeholder="••••••••"
                />
              </Field>
              <button
                type="submit"
                disabled={submitting}
                style={{ ...S.submitBtn, opacity: submitting ? 0.7 : 1 }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.opacity = submitting ? '0.7' : '1')}
              >
                {submitting ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          ) : (
            /* Signup Form */
            <form onSubmit={signupForm.handleSubmit(onSignup)}>
              <Field label="Full Name" error={signupForm.formState.errors.full_name?.message}>
                <StyledInput
                  {...signupForm.register('full_name')}
                  placeholder="John Smith"
                />
              </Field>
              <Field label="Email" error={signupForm.formState.errors.email?.message}>
                <StyledInput
                  {...signupForm.register('email')}
                  placeholder="you@example.com"
                  type="email"
                />
              </Field>
              <Field label="Password" error={signupForm.formState.errors.password?.message}>
                <StyledInput
                  {...signupForm.register('password')}
                  type="password"
                  placeholder="••••••••"
                />
              </Field>
              <button
                type="submit"
                disabled={submitting}
                style={{ ...S.submitBtn, opacity: submitting ? 0.7 : 1 }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.opacity = submitting ? '0.7' : '1')}
              >
                {submitting ? 'Creating account…' : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}