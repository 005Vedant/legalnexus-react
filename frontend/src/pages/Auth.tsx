import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

type AuthMode = 'login' | 'signup'
type Role = 'client' | 'lawyer' | 'admin'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

const signupSchema = z.object({
  full_name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type LoginData = z.infer<typeof loginSchema>
type SignupData = z.infer<typeof signupSchema>

const roles = [
  {
    id: 'client' as Role,
    label: 'Client',
    desc: 'Looking for legal help'
  },
  {
    id: 'lawyer' as Role,
    label: 'Lawyer',
    desc: 'Legal professional'
  },
  {
    id: 'admin' as Role,
    label: 'Admin',
    desc: 'Platform administrator'
  },
]

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [role, setRole] = useState<Role>('client')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) })
  const signupForm = useForm<SignupData>({ resolver: zodResolver(signupSchema) })

  const onLogin = async (data: LoginData) => {
    setMessage(null)
    setError(null)
    const { error } = await signIn(data.email, data.password)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/')
  }

  const onSignup = async (data: SignupData) => {
    setMessage(null)
    setError(null)
    const { error } = await signUp(data.email, data.password, data.full_name, role)
    if (error) {
      setError(error.message)
      return
    }
    setMessage('Account created! You can now sign in.')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">⚖️ LegalNexus</h1>
          <p className="text-gray-500 mt-1 text-sm">Your legal intelligence platform</p>
        </div>

        {/* Login / Signup tabs */}
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1 mb-6">
          {(['login', 'signup'] as AuthMode[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setMode(tab); setError(null); setMessage(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                mode === tab
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              {tab === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Role selector — only on signup */}
        {mode === 'signup' && (
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 mb-2">I am a:</p>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition ${
                    role === r.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  
                  <span className="text-xs font-semibold mt-1">{r.label}</span>
                  <span className="text-xs text-center mt-0.5 opacity-70">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {message && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' ? (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                {...loginForm.register('email')}
                placeholder="you@email.com"
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                {...loginForm.register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition mt-2">
              Sign in
            </button>
          </form>
        ) : (
          /* Signup Form */
          <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                {...signupForm.register('full_name')}
                placeholder="John Smith"
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                {...signupForm.register('email')}
                placeholder="you@email.com"
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                {...signupForm.register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition mt-2">
              Create {role} account
            </button>
          </form>
        )}
      </div>
    </div>
  )
}