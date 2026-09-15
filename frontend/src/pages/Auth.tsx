import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

type AuthMode = "login" | "signup"
type Role = "client" | "lawyer"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})
const signupSchema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string().min(6, "Confirm your password"),
  bar_enrollment: z.string().optional(),
}).refine(d => d.password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
})

type LoginData = z.infer<typeof loginSchema>
type SignupData = z.infer<typeof signupSchema>

const FEATURES = [
  { icon: "🛡️", title: "Bar-verified network", desc: "Every advocate is checked against state Bar Council records." },
  { icon: "🔒", title: "Private by design", desc: "Your identity, documents and messages stay encrypted." },
  { icon: "📋", title: "One legal workspace", desc: "Manage advocates, files, payments and hearing dates together." },
]

function InputField({ label, error, icon, children }: { label: string; error?: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-mono font-bold uppercase tracking-[0.12em] text-[#7a8ab0]">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a6a90] text-sm">{icon}</span>
        {children}
      </div>
      {error && <p className="text-[11px] text-red-400 font-medium">⚠ {error}</p>}
    </div>
  )
}

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login")
  const [role, setRole] = useState<Role>("client")
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) })
  const signupForm = useForm<SignupData>({ resolver: zodResolver(signupSchema) })

  const onLogin = async (data: LoginData) => {
    setMessage(null); setAuthError(null); setSubmitting(true)
    const { error } = await signIn(data.email, data.password)
    setSubmitting(false)
    if (error) { setAuthError(error.message); return }
    navigate("/")
  }

  const onSignup = async (data: SignupData) => {
    setMessage(null); setAuthError(null); setSubmitting(true)
    const { error } = await signUp(data.email, data.password, data.full_name, role)
    setSubmitting(false)
    if (error) { setAuthError(error.message); return }
    setMessage("Account created! You can now sign in.")
    setMode("login")
  }

  const inputCls = "w-full pl-10 pr-4 py-3 bg-[#131c2e] border border-[#1e2d47] rounded-lg text-sm text-white placeholder:text-[#3d4f6e] focus:outline-none focus:border-[#5b86ff] focus:ring-1 focus:ring-[#5b86ff]/30 transition-all"

  return (
    <div className="min-h-screen bg-[#07090f] flex flex-col font-sans antialiased">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <Link to="/" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111827] border border-white/10 text-[#93a1c2] hover:text-white text-xs font-semibold transition-colors">
          <span>←</span><span>Back to home</span>
        </Link>
      </div>

      {/* Main card */}
      <div className="flex-1 flex items-start justify-center px-4 pb-8">
        <div className="w-full max-w-5xl rounded-2xl overflow-hidden border border-[#1a2540] shadow-2xl flex min-h-[680px]" style={{ background: "#0c1221" }}>

          {/* ── LEFT PANEL ── */}
          <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-10 relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0d1630 0%,#0a1020 60%,#060e1c 100%)" }}>
            <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-[#5b86ff]/10 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-10 right-0 w-60 h-60 rounded-full bg-[#3a5fd9]/8 blur-[60px] pointer-events-none" />

            {/* Logo */}
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5b86ff] to-[#3050d0] flex items-center justify-center shadow-[0_0_20px_rgba(91,134,255,0.4)]">
                <img src="/logo.jpg" alt="LegalNexus" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div>
                <p className="text-white font-bold text-base leading-tight">LegalNexus</p>
                <p className="text-[#4a5a80] text-[9px] font-mono uppercase tracking-[0.15em]">India&apos;s Legal Intelligence Platform</p>
              </div>
            </div>

            {/* Hero text */}
            <div className="relative z-10 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px w-6 bg-[#efb75a]" />
                  <span className="text-[#efb75a] text-[11px] font-mono uppercase tracking-[0.15em]">Secure Legal Access</span>
                </div>
                <h1 className="text-4xl font-extrabold text-white leading-[1.1] tracking-tight font-display">
                  Your case<br />deserves<br />clarity.
                </h1>
                <p className="mt-4 text-[#5a6f90] text-sm leading-relaxed">
                  Sign in to follow your matters, or create an account to connect with a verified advocate in one confidential workspace.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {FEATURES.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#111e35] border border-[#1e3050] flex items-center justify-center text-sm shrink-0 mt-0.5">{f.icon}</div>
                    <div>
                      <p className="text-white text-sm font-semibold">{f.title}</p>
                      <p className="text-[#4a5a80] text-xs mt-0.5 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom badges */}
            <div className="relative z-10 flex flex-wrap gap-2">
              {["AES-256 Encrypted", "Bar-Verified", "No Data Resale"].map(b => (
                <span key={b} className="px-3 py-1 rounded-full border border-[#1e3050] text-[#4a6090] text-[10px] font-mono uppercase tracking-[0.1em]">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10 overflow-y-auto" style={{ background: "#0c1221" }}>
            <div className="max-w-md w-full mx-auto">

              {/* Section label */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px w-5 bg-[#5b86ff]" />
                <span className="text-[#5b86ff] text-[11px] font-mono uppercase tracking-[0.15em]">
                  {mode === "login" ? "Welcome Back" : "Join LegalNexus"}
                </span>
              </div>

              {/* Heading */}
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1 font-display">
                {mode === "login" ? "Sign in to your workspace" : "Create your account"}
              </h2>
              <p className="text-[#4a5a7a] text-sm mb-6">
                {mode === "login"
                  ? "Use the email linked to your LegalNexus account."
                  : "Choose your account type and enter your details below."}
              </p>

              {/* Tab switcher */}
              <div className="flex gap-0 p-1 rounded-xl bg-[#080e1a] border border-[#1a2540] mb-6">
                {(["login", "signup"] as AuthMode[]).map(tab => (
                  <button key={tab} type="button" onClick={() => { setMode(tab); setAuthError(null); setMessage(null) }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      mode === tab
                        ? "bg-[#131c2e] text-white border border-[#253555] shadow-sm"
                        : "text-[#4a5a7a] hover:text-[#7a8ab0]"
                    }`}>
                    {tab === "login" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              {/* Feedback */}
              {message && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium mb-5">
                  <span>✅</span><span>{message}</span>
                </div>
              )}
              {authError && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium mb-5">
                  <span>⚠️</span><span>{authError}</span>
                </div>
              )}

              {/* ── LOGIN FORM ── */}
              {mode === "login" ? (
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <InputField label="Email Address" icon="✉" error={loginForm.formState.errors.email?.message}>
                    <input {...loginForm.register("email")} type="email" placeholder="you@example.com" className={inputCls} />
                  </InputField>

                  <InputField label="Password" icon="🔒" error={loginForm.formState.errors.password?.message}>
                    <input {...loginForm.register("password")} type={showPass ? "text" : "password"} placeholder="Enter your password" className={`${inputCls} pr-16`} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a6090] text-xs font-semibold hover:text-white transition-colors">
                      {showPass ? "Hide" : "Show"}
                    </button>
                  </InputField>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-[#253555] bg-[#131c2e] accent-[#5b86ff]" />
                      <span className="text-xs text-[#4a5a7a]">Remember me</span>
                    </label>
                    <button type="button" className="text-xs text-[#5b86ff] hover:text-[#7ba3ff] font-semibold transition-colors">
                      Forgot password?
                    </button>
                  </div>

                  <button type="submit" disabled={submitting}
                    className="w-full py-3.5 rounded-full bg-[#4f7eff] hover:bg-[#5b86ff] text-white text-sm font-bold shadow-[0_0_24px_rgba(91,134,255,0.4)] hover:shadow-[0_0_32px_rgba(91,134,255,0.5)] active:scale-[0.98] disabled:opacity-60 transition-all mt-2 flex items-center justify-center gap-2">
                    {submitting ? "Signing in…" : <><span>Sign In</span><span>→</span></>}
                  </button>

                  <p className="text-center text-xs text-[#4a5a7a] pt-1">
                    New to LegalNexus?{" "}
                    <button type="button" onClick={() => setMode("signup")} className="text-[#5b86ff] hover:text-[#7ba3ff] font-semibold transition-colors">
                      Create an account
                    </button>
                  </p>
                </form>
              ) : (
                /* ── SIGNUP FORM ── */
                <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">

                  {/* Role selector */}
                  <div>
                    <p className="text-[11px] font-mono font-bold uppercase tracking-[0.12em] text-[#7a8ab0] mb-2.5">I Am Joining As</p>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { id: "client" as Role, label: "Client", desc: "I need legal help", icon: "👤" },
                        { id: "lawyer" as Role, label: "Advocate", desc: "I provide legal help", icon: "👨‍⚖️" },
                      ]).map(r => (
                        <button key={r.id} type="button" onClick={() => setRole(r.id)}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                            role === r.id
                              ? "border-[#5b86ff] bg-[#0d1a35]"
                              : "border-[#1a2540] bg-[#0a1020] hover:border-[#253555]"
                          }`}>
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 ${role === r.id ? "bg-[#5b86ff]/20" : "bg-[#111e35]"}`}>
                            {r.icon}
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${role === r.id ? "text-white" : "text-[#7a8ab0]"}`}>{r.label}</p>
                            <p className="text-[10px] text-[#3d4f6e]">{r.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <InputField label="Full Name" icon="👤" error={signupForm.formState.errors.full_name?.message}>
                    <input {...signupForm.register("full_name")} placeholder="Enter your full name" className={inputCls} />
                  </InputField>

                  <InputField label="Email Address" icon="✉" error={signupForm.formState.errors.email?.message}>
                    <input {...signupForm.register("email")} type="email" placeholder="you@example.com" className={inputCls} />
                  </InputField>

                  {role === "lawyer" && (
                    <InputField label="Bar Council Enrollment" icon="📋" error={undefined}>
                      <input {...signupForm.register("bar_enrollment")} placeholder="e.g. D/1234/2018" className={inputCls} />
                    </InputField>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Password" icon="🔒" error={signupForm.formState.errors.password?.message}>
                      <input {...signupForm.register("password")} type={showPass ? "text" : "password"} placeholder="Enter your password" className={`${inputCls} pr-14`} />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a6090] text-[11px] font-semibold hover:text-white transition-colors">
                        {showPass ? "Hide" : "Show"}
                      </button>
                    </InputField>
                    <InputField label="Confirm Password" icon="🔒" error={signupForm.formState.errors.confirm_password?.message}>
                      <input {...signupForm.register("confirm_password")} type={showConfirmPass ? "text" : "password"} placeholder="Enter your password" className={`${inputCls} pr-14`} />
                      <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a6090] text-[11px] font-semibold hover:text-white transition-colors">
                        {showConfirmPass ? "Hide" : "Show"}
                      </button>
                    </InputField>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                    <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-[#253555] bg-[#131c2e] accent-[#5b86ff] shrink-0" />
                    <span className="text-xs text-[#4a5a7a] leading-relaxed">
                      I agree to the{" "}
                      <span className="text-[#5b86ff] hover:underline cursor-pointer">Terms of Service</span>
                      {" "}and{" "}
                      <span className="text-[#5b86ff] hover:underline cursor-pointer">Privacy Policy</span>.
                    </span>
                  </label>

                  <button type="submit" disabled={submitting || !agreedTerms}
                    className="w-full py-3.5 rounded-full bg-[#4f7eff] hover:bg-[#5b86ff] text-white text-sm font-bold shadow-[0_0_24px_rgba(91,134,255,0.4)] hover:shadow-[0_0_32px_rgba(91,134,255,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                    {submitting ? "Creating account…" : <><span>Create {role === "client" ? "Client" : "Advocate"} Account</span><span>→</span></>}
                  </button>

                  <p className="text-center text-xs text-[#4a5a7a] pt-1">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setMode("login")} className="text-[#5b86ff] hover:text-[#7ba3ff] font-semibold transition-colors">
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
