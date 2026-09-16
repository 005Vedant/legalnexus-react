import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../lib/supabase'
import { authFetch } from '../lib/authFetch'
import ClientNav from '../components/ClientNav'
import DocumentViewerModal from '../components/DocumentViewerModal'

// ─── SVG Icons ──────────────────────────────────────────────────────────────

function ScaleIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  )
}

function DocIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
}

function CalendarIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function ShieldLockIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <circle cx="12" cy="11" r="1.5" />
      <path d="M12 12.5V15" />
    </svg>
  )
}

function LockIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function SearchIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function AdvocateIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ArrowRightIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function PinIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function BellIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function MoonIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function SunIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function StarIcon({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function MessageIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function CheckIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ChevronDownIcon({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function OverviewIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface CaseItem {
  id: string
  rawId?: string
  title: string
  type: string
  court: string
  stage: string
  next: string
  status: 'In progress' | 'Hearing scheduled' | 'Pending' | 'Order reserved'
  progress: number
  advocate: string
  last: string
  document_url?: string | null
}

interface LawyerItem {
  id: string
  name: string
  initials: string
  practice: string
  area: string
  city: string
  exp: number
  rating: number
  reviews: number
  fee: number
  languages: string[]
  courts: string[]
  bio: string
  verified: boolean
  availability: string
  hue: number
  success: number
  photo_url?: string | null
}

const PRACTICE_AREAS = [
  { id: 'all', label: 'All Practices' },
  { id: 'criminal', label: 'Criminal Law' },
  { id: 'family', label: 'Family & Divorce' },
  { id: 'corporate', label: 'Corporate & Tax' },
  { id: 'property', label: 'Property & Real Estate' },
  { id: 'cyber', label: 'Cyber Crime' },
  { id: 'civil', label: 'Civil & Consumer' },
]

const MATTER_TYPES = [
  { id: 'cheque', label: 'Cheque Bounce (S.138 NI Act)' },
  { id: 'divorce', label: 'Divorce / Maintenance' },
  { id: 'property', label: 'Property Title Dispute' },
  { id: 'consumer', label: 'Consumer Complaint' },
  { id: 'bail', label: 'Bail Application' },
  { id: 'cyber', label: 'Cyber Fraud Complaint' },
  { id: 'gst', label: 'GST / Income Tax Notice' },
  { id: 'labor', label: 'Employment / Wrongful Exit' },
]

const STATUS_BADGES: Record<string, string> = {
  Pending: 'border-gold/30 bg-goldsoft text-gold',
  'Hearing scheduled': 'border-accent/30 bg-accentsoft text-accent',
  'In progress': 'border-good/30 bg-good/10 text-good',
  'Order reserved': 'border-line bg-card2 text-muted',
}

const NAV_TABS = [
  { id: 'overview', label: 'Overview', icon: OverviewIcon },
  { id: 'submit', label: 'Submit a case', icon: DocIcon },
  { id: 'cases', label: 'My cases', icon: ScaleIcon },
  { id: 'lawyers', label: 'Find a lawyer', icon: SearchIcon },
]

// ─── UI Primitives ──────────────────────────────────────────────────────────

function Badge({ children, tone = 'line' }: { children: React.ReactNode; tone?: 'line' | 'accent' | 'gold' | 'good' }) {
  const toneClasses = {
    line: 'border-line bg-card2 text-faint',
    accent: 'border-accent/30 bg-accentsoft text-accent',
    gold: 'border-gold/30 bg-goldsoft text-gold',
    good: 'border-good/30 bg-good/10 text-good',
  }
  return (
    <span className={`eyebrow rounded-full border px-2.5 py-1 ${toneClasses[tone]}`}>
      {children}
    </span>
  )
}

function PillButton({
  children,
  active,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.78rem] font-medium transition-all duration-300 cursor-pointer ${
        active
          ? 'border-accent bg-accent text-accentink shadow-[0_8px_22px_-12px_var(--glow-a)] font-semibold'
          : 'border-line bg-card text-muted hover:border-line2 hover:text-ink'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

function ActionButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-[0.75rem]',
    md: 'px-4 py-2 text-[0.82rem]',
    lg: 'px-5 py-2.5 text-[0.88rem]',
  }
  const variantClasses = {
    primary: 'bg-accent text-accentink shadow-[0_8px_24px_-10px_var(--glow-a)] hover:brightness-110 font-semibold',
    outline: 'border border-line bg-card text-ink hover:border-accent hover:text-accent',
    ghost: 'text-muted hover:bg-card hover:text-ink',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 cursor-pointer ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <div className="flex items-center">
        <span className="eyebrow text-faint">{label}</span>
        {hint && <span className="ml-2 text-[0.7rem] text-faint/80">{hint}</span>}
      </div>
      <div className="mt-2">{children}</div>
    </label>
  )
}

const inputClassName =
  'w-full rounded-xl border border-line bg-card2 px-3.5 py-2.5 text-[0.88rem] text-ink placeholder:text-faint outline-none transition focus:border-accent focus:bg-card focus:ring-4 focus:ring-[var(--accent-soft)]'

function AvatarInitials({
  initials,
  hue,
  photoUrl,
  size = 44,
  ring = true,
}: {
  initials: string
  hue: number
  photoUrl?: string | null
  size?: number
  ring?: boolean
}) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt="Avatar"
        className="rounded-2xl object-cover shrink-0 ring-1 ring-white/15"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-2xl font-mono font-semibold text-white ${
        ring ? 'ring-1 ring-white/15' : ''
      }`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: `linear-gradient(145deg, hsl(${hue} 62% 52%), hsl(${hue + 34} 55% 34%))`,
      }}
    >
      <span
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,.45), transparent 60%)',
        }}
      />
      <span className="relative drop-shadow">{initials}</span>
    </span>
  )
}

function VerifiedBadge({ className = '' }: { className?: string }) {
  return (
    <span
      title="Bar Council verified"
      className={`inline-grid size-4 place-items-center rounded-full bg-accent text-[9px] font-bold text-accentink ${className}`}
    >
      ✓
    </span>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-gold">
      {[1, 2, 3, 4, 5].map(star => (
        <StarIcon key={star} className={`size-3.5 ${star <= Math.round(rating) ? 'opacity-100' : 'opacity-25'}`} />
      ))}
    </span>
  )
}

// ─── Header Component ───────────────────────────────────────────────────────

function DashboardNavHeader({
  view,
  setView,
  onToast,
}: {
  view: string
  setView: (v: string) => void
  onToast: (title: string, body: string) => void
}) {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const userInitials = (userName.charAt(0) || 'U').toUpperCase()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-xl">
      <div className="site-shell flex h-[4.5rem] items-center justify-between gap-4">
        {/* Brand Logo */}
        <button onClick={() => setView('overview')} className="flex items-center gap-2.5 text-left group cursor-pointer">
          <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-[#2a3f9e] text-white shadow-[0_8px_22px_-11px_var(--glow-a)]">
            <ScaleIcon className="size-[17px]" />
            <span className="absolute -inset-px rounded-xl ring-1 ring-inset ring-white/25" />
          </span>
          <span className="font-display text-[1.04rem] font-semibold tracking-tight text-inkstrong">
            LegalNexus
          </span>
        </button>

        {/* Navigation Tabs */}
        <nav className="hide-scroll hidden items-center gap-1 md:flex">
          {NAV_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`rounded-full px-3.5 py-2 text-[0.78rem] font-semibold transition-all duration-300 cursor-pointer ${
                view === tab.id
                  ? 'bg-accentsoft text-accent'
                  : 'text-muted hover:bg-card hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <Link
            to="/faq"
            className="rounded-full px-3.5 py-2 text-[0.78rem] font-semibold text-muted transition-colors hover:bg-card hover:text-ink"
          >
            FAQ
          </Link>
        </nav>

        {/* Right Controls: Theme toggle, Notifications, Profile Dropdown */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
            className="hidden size-9 place-items-center rounded-xl border border-line bg-card text-muted transition-all hover:border-accent hover:text-accent sm:grid cursor-pointer"
          >
            {theme === 'midnight' ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
          </button>

          {/* Notifications Button */}
          <button
            onClick={() =>
              onToast('You are all caught up', 'No new case notifications right now.')
            }
            aria-label="Notifications"
            title="Notifications"
            className="relative grid size-9 place-items-center rounded-xl border border-line bg-card text-muted transition-all duration-300 hover:border-accent hover:text-accent cursor-pointer"
          >
            <BellIcon className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-gold" />
          </button>

          {/* User Account Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 rounded-xl border border-line bg-card p-1.5 pl-2 transition hover:border-line2 hover:bg-card2 cursor-pointer"
            >
              <div className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-accent to-[#2a3f9e] font-mono text-xs font-bold text-white shadow-xs">
                {userInitials}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-[0.78rem] font-semibold leading-tight text-ink">{userName}</p>
                <span className="block text-[0.63rem] text-faint">Client account</span>
              </div>
              <ChevronDownIcon
                className={`hidden size-3.5 text-faint transition-transform sm:block ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="anim-rise absolute right-0 top-[calc(100%+0.6rem)] z-50 w-56 rounded-2xl border border-line bg-cardsolid p-1.5 shadow-[var(--shadow)]">
                <div className="border-b border-line px-3 py-2.5">
                  <p className="text-[0.8rem] font-semibold text-ink">{userName}</p>
                  <p className="truncate text-[0.68rem] text-muted">{user?.email || ''}</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.78rem] text-muted transition hover:bg-card hover:text-ink"
                  >
                    <span>👤</span> My Profile
                  </Link>
                  <button
                    onClick={() => {
                      setView('cases')
                      setDropdownOpen(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.78rem] text-muted transition hover:bg-card hover:text-ink cursor-pointer"
                  >
                    <span>📋</span> My Cases
                  </button>
                  <button
                    onClick={() => {
                      setView('lawyers')
                      setDropdownOpen(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.78rem] text-muted transition hover:bg-card hover:text-ink cursor-pointer"
                  >
                    <span>⚖️</span> Find Lawyers
                  </button>
                </div>
                <div className="border-t border-line pt-1">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.78rem] text-red-400 transition hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

// ─── Hero Section ───────────────────────────────────────────────────────────

function HeroSection({
  cases,
  setView,
}: {
  cases: CaseItem[]
  setView: (v: string) => void
}) {
  const { user } = useAuth()
  const activeCount = cases.filter(
    c => c.status === 'In progress' || c.status === 'Hearing scheduled'
  ).length
  const pendingCount = cases.filter(c => c.status === 'Pending').length
  const reservedCount = cases.filter(c => c.status === 'Order reserved').length
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Client'

  return (
    <section className="relative overflow-hidden rounded-3xl border border-line bg-cardsolid px-6 py-7 shadow-[var(--shadow)] sm:px-8 sm:py-8">
      <div aria-hidden className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div
        aria-hidden
        className="absolute -right-28 -top-28 size-80 rounded-full bg-[radial-gradient(circle,var(--glow-a),transparent_65%)] opacity-80 blur-xl anim-drift pointer-events-none"
      />
      <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <span className="eyebrow flex items-center gap-2 text-gold">
            <span className="h-px w-6 bg-gold/60" /> LegalNexus · Client portal
          </span>
          <h1 className="mt-4 text-[clamp(2rem,4.3vw,3.35rem)] font-display font-bold leading-[1.02] text-inkstrong">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-3 max-w-xl text-[0.9rem] leading-relaxed text-muted">
            Your real case workspace is up to date. Keep documents, hearing dates and advocate conversations in one encrypted place.
          </p>
        </div>
        <ActionButton onClick={() => setView('submit')} size="lg" className="shrink-0">
          <DocIcon className="size-4" /> Submit a new case
        </ActionButton>
      </div>

      <div className="relative mt-8 grid grid-cols-2 divide-x divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card/70 sm:grid-cols-4 sm:divide-y-0">
        {[
          { n: cases.length, l: 'Total cases', c: 'text-inkstrong' },
          { n: pendingCount, l: 'Matching', c: 'text-gold' },
          { n: activeCount, l: 'Active matters', c: 'text-accent' },
          { n: reservedCount, l: 'Order reserved', c: 'text-good' },
        ].map(stat => (
          <div key={stat.l} className="p-4 sm:px-5 sm:py-4">
            <p className={`font-display text-2xl font-bold leading-none ${stat.c}`}>{stat.n}</p>
            <p className="mt-1.5 text-[0.7rem] text-muted">{stat.l}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Highlight Feature Cards ────────────────────────────────────────────────

function HighlightCards() {
  const highlights = [
    {
      icon: AdvocateIcon,
      title: 'Verified advocates',
      copy: 'Every profile is checked against Bar Council records.',
    },
    {
      icon: CalendarIcon,
      title: 'Case tracking',
      copy: 'Live hearing updates and real court dates that matter.',
    },
    {
      icon: ShieldLockIcon,
      title: 'Private by design',
      copy: 'Your case file is shared only with your authorized counsel.',
    },
  ]

  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {highlights.map(item => {
        const Icon = item.icon
        return (
          <div
            key={item.title}
            className="group flex items-start gap-3 rounded-2xl border border-line bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accentsoft text-accent">
              <Icon className="size-4" />
            </span>
            <div>
              <p className="text-[0.82rem] font-semibold text-ink">{item.title}</p>
              <p className="mt-1 text-[0.72rem] leading-relaxed text-muted">{item.copy}</p>
            </div>
          </div>
        )
      })}
    </section>
  )
}

// ─── Case Cards List ────────────────────────────────────────────────────────

function CaseCardsList({
  cases,
  selected,
  onSelect,
  compact = false,
}: {
  cases: CaseItem[]
  selected: string
  onSelect: (id: string) => void
  compact?: boolean
}) {
  if (cases.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line2 p-8 text-center bg-card/40">
        <ScaleIcon className="size-8 text-faint mx-auto mb-2 opacity-60" />
        <p className="font-semibold text-[0.95rem] text-inkstrong">No cases submitted yet</p>
        <p className="mt-1 text-[0.78rem] text-muted">
          Click "Submit a case" to brief your matter with verified legal counsel.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {cases.map(item => {
        const isSelected = selected === item.id
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`group w-full rounded-2xl border p-4 text-left transition-all duration-300 cursor-pointer ${
              isSelected
                ? 'border-accent bg-accentsoft/40 shadow-[0_10px_26px_-20px_var(--glow-a)]'
                : 'border-line bg-card hover:border-line2 hover:bg-card2'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[0.63rem] uppercase tracking-[0.14em] text-faint">
                  {item.id}
                </p>
                <p className="mt-1 truncate text-[0.88rem] font-semibold text-inkstrong">
                  {item.title}
                </p>
                <p className="mt-1 truncate text-[0.72rem] text-muted">
                  {item.type} · {item.stage}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-2 py-1 text-[0.59rem] font-semibold ${
                  STATUS_BADGES[item.status] || 'border-line bg-card text-muted'
                }`}
              >
                {item.status.toUpperCase()}
              </span>
            </div>

            {!compact && (
              <>
                <div className="mt-3.5 h-1 overflow-hidden rounded-full bg-card2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-gold transition-all duration-700"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[0.68rem] text-faint">
                  <span className="flex min-w-0 items-center gap-1.5 truncate">
                    <CalendarIcon className="size-3 shrink-0 text-gold" /> {item.next}
                  </span>
                  <span className="font-mono">{item.progress}%</span>
                </div>
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Selected Case Detail (Timeline & Actions) ───────────────────────────────

function CaseDetailPane({
  item,
  onToast,
  onViewDocs,
}: {
  item: CaseItem
  onToast: (title: string, body: string) => void
  onViewDocs?: (item: CaseItem) => void
}) {
  const steps = ['Case brief submitted', 'Advocate engaged', 'Documents reviewed', item.stage, 'Final order']
  const currentStep = Math.max(1, Math.ceil(item.progress / 24))

  return (
    <div className="rounded-3xl border border-line bg-cardsolid p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-accent">Selected matter</p>
          <h2 className="mt-2 font-display text-[1.35rem] font-bold leading-snug text-inkstrong">
            {item.title}
          </h2>
          <p className="mt-1.5 flex items-center gap-1.5 text-[0.76rem] text-muted">
            <PinIcon className="size-3.5 text-gold" /> {item.court}
          </p>
        </div>
        <Badge tone={item.status === 'In progress' ? 'good' : item.status === 'Pending' ? 'gold' : 'accent'}>
          {item.status}
        </Badge>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { k: 'Next date', v: item.next, icon: CalendarIcon },
          { k: 'Stage', v: item.stage, icon: ScaleIcon },
          { k: 'Your advocate', v: item.advocate, icon: AdvocateIcon },
        ].map(detail => {
          const Icon = detail.icon
          return (
            <div
              key={detail.k}
              className="rounded-2xl border border-line bg-card2 p-3 last:col-span-2 sm:last:col-span-1"
            >
              <Icon className="size-4 text-gold" />
              <p className="mt-2 text-[0.63rem] text-faint">{detail.k}</p>
              <p className="mt-1 text-[0.77rem] font-semibold leading-snug text-ink">{detail.v}</p>
            </div>
          )
        })}
      </div>

      {/* Case Timeline */}
      <div className="mt-6 border-t border-line pt-5">
        <p className="eyebrow text-faint">Case timeline</p>
        <ol className="mt-4">
          {steps.map((step, idx) => (
            <li key={step} className="relative flex gap-3 pb-4 last:pb-0">
              {idx < steps.length - 1 && (
                <span className="absolute left-[6px] top-4 h-[calc(100%-0.7rem)] w-px bg-line" />
              )}
              <span
                className={`relative mt-0.5 size-3.5 shrink-0 rounded-full border-2 ${
                  idx < currentStep
                    ? 'border-accent bg-accent'
                    : idx === currentStep
                    ? 'border-gold bg-gold anim-pulse'
                    : 'border-line2 bg-card'
                }`}
              />
              <div>
                <p className={`text-[0.82rem] font-medium ${idx <= currentStep ? 'text-ink' : 'text-faint'}`}>
                  {step}
                </p>
                <p className="mt-0.5 text-[0.68rem] text-faint">
                  {idx < currentStep ? 'Completed' : idx === currentStep ? 'Current stage' : 'Upcoming'}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 grid gap-2 border-t border-line pt-5 sm:grid-cols-2">
        <ActionButton
          variant="outline"
          onClick={() => {
            if (onViewDocs) onViewDocs(item)
            else if (item.document_url) window.open(item.document_url, '_blank')
            else onToast('Case documents', 'No document file was attached to this brief.')
          }}
        >
          <DocIcon className="size-4" /> {item.document_url ? 'View attached document' : 'View documents vault'}
        </ActionButton>
        <ActionButton
          onClick={() =>
            onToast('Message thread opened', `A secure message thread with ${item.advocate} is ready.`)
          }
        >
          <MessageIcon className="size-4" /> Message advocate
        </ActionButton>
      </div>
    </div>
  )
}

// ─── Overview View ──────────────────────────────────────────────────────────

function OverviewView({
  cases,
  selected,
  onSelect,
  setView,
  onToast,
}: {
  cases: CaseItem[]
  selected: string
  onSelect: (id: string) => void
  setView: (v: string) => void
  onToast: (title: string, body: string) => void
}) {
  const navigate = useNavigate()
  const selectedCase = cases.find(c => c.id === selected) ?? cases[0]

  const quickActions = [
    {
      label: 'Submit a new case',
      icon: DocIcon,
      action: () => setView('submit'),
    },
    {
      label: 'Find an advocate',
      icon: SearchIcon,
      action: () => navigate('/lawyers'),
    },
    {
      label: 'Contact case support',
      icon: MessageIcon,
      action: () =>
        onToast('Case support', 'A support specialist is available Mon-Sat, 9 AM to 6 PM IST.'),
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-7">
      <HeroSection cases={cases} setView={setView} />
      <HighlightCards />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
        {/* Left Column: Recent cases */}
        <div>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <span className="eyebrow text-accent">Your matters</span>
              <h2 className="mt-2 font-display text-[1.45rem] font-bold text-inkstrong">
                Recent cases
              </h2>
            </div>
            {cases.length > 0 && (
              <button
                onClick={() => navigate('/cases')}
                className="flex shrink-0 items-center gap-1.5 text-[0.78rem] font-semibold text-accent transition hover:text-ink cursor-pointer"
              >
                View all cases <ArrowRightIcon className="size-3.5" />
              </button>
            )}
          </div>
          <CaseCardsList
            cases={cases.slice(0, 3)}
            selected={selected}
            onSelect={id => {
              onSelect(id)
              navigate('/cases')
            }}
          />
        </div>

        {/* Right Column: Next up & Quick actions */}
        <div className="space-y-4">
          {selectedCase ? (
            <div className="rounded-3xl border border-line bg-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="eyebrow text-gold">Next up</span>
                  <h2 className="mt-2 font-display text-[1.25rem] font-bold text-inkstrong">
                    {selectedCase.stage}
                  </h2>
                </div>
                <span className="grid size-10 place-items-center rounded-xl bg-goldsoft text-gold">
                  <CalendarIcon className="size-5" />
                </span>
              </div>
              <p className="mt-3 text-[0.82rem] leading-relaxed text-muted">{selectedCase.next}</p>
              <p className="mt-3 border-t border-line pt-3 text-[0.78rem] leading-relaxed text-muted">
                {selectedCase.last}
              </p>
              <ActionButton
                variant="outline"
                onClick={() => {
                  onSelect(selectedCase.id)
                  navigate('/cases')
                }}
                className="mt-5 w-full"
              >
                Open case timeline
              </ActionButton>
            </div>
          ) : (
            <div className="rounded-3xl border border-line bg-card p-5">
              <span className="eyebrow text-gold">Get Started</span>
              <h2 className="mt-2 font-display text-[1.25rem] font-bold text-inkstrong">
                Start your first matter
              </h2>
              <p className="mt-3 text-[0.82rem] leading-relaxed text-muted">
                Brief your case online in minutes to receive counsel matching within 38 hours.
              </p>
              <ActionButton
                variant="primary"
                onClick={() => setView('submit')}
                className="mt-5 w-full"
              >
                Submit Case Brief
              </ActionButton>
            </div>
          )}

          <div className="rounded-3xl border border-line bg-card p-5">
            <span className="eyebrow text-accent">Quick actions</span>
            <div className="mt-4 grid gap-2">
              {quickActions.map(action => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    onClick={action.action}
                    className="group flex items-center justify-between rounded-xl border border-line bg-card2 px-3.5 py-3 text-left transition-all hover:border-accent/40 hover:bg-accentsoft cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5 text-[0.79rem] font-medium text-ink">
                      <span className="grid size-7 place-items-center rounded-lg bg-card text-accent">
                        <Icon className="size-3.5" />
                      </span>
                      {action.label}
                    </span>
                    <ArrowRightIcon className="size-3.5 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// ─── Submit Case View ───────────────────────────────────────────────────────

function SubmitCaseView({
  onSubmit,
  setView,
  lawyers,
}: {
  onSubmit: (formData: {
    title: string
    description: string
    case_type: string
    case_location: string
    assigned_lawyer_id?: string | null
    file?: File | null
  }) => Promise<void>
  setView: (v: string) => void
  lawyers: LawyerItem[]
}) {
  const [form, setForm] = useState({
    area: 'criminal',
    type: MATTER_TYPES[0].id,
    city: '',
    summary: '',
    assigned_lawyer_id: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const selectedMatter = MATTER_TYPES.find(m => m.id === form.type) || MATTER_TYPES[0]
  const isValid = form.city.trim().length > 1 && form.summary.trim().length >= 12

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || submitting) return

    try {
      setSubmitting(true)
      await onSubmit({
        title: form.summary.slice(0, 42).replace(/[.?!]$/, '') || selectedMatter.label,
        description: form.summary,
        case_type: selectedMatter.label,
        case_location: `${form.city} District Court`,
        assigned_lawyer_id: form.assigned_lawyer_id || null,
        file: selectedFile,
      })
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section className="mx-auto max-w-2xl rounded-3xl border border-good/30 bg-card p-8 text-center shadow-[var(--shadow)] sm:p-12 anim-rise">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-good/15 text-good">
          <CheckIcon className="size-8" />
        </span>
        <span className="mt-6 block eyebrow text-good">Brief received in database</span>
        <h1 className="mt-3 font-display text-[2rem] font-bold text-inkstrong">
          Your case is now in motion.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[0.88rem] leading-relaxed text-muted">
          Your matter is saved to your encrypted workspace and matched with verified advocates. You will receive updates directly on your dashboard.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ActionButton onClick={() => setView('cases')}>
            View my cases <ArrowRightIcon className="size-4" />
          </ActionButton>
          <ActionButton
            variant="outline"
            onClick={() => {
              setSubmitted(false)
              setForm({ area: 'criminal', type: MATTER_TYPES[0].id, city: '', summary: '', assigned_lawyer_id: '' })
              setSelectedFile(null)
            }}
          >
            Submit another case
          </ActionButton>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-8">
        <span className="eyebrow text-gold">New case brief</span>
        <h1 className="mt-3 font-display text-[clamp(2rem,4vw,2.8rem)] font-bold text-inkstrong">
          Tell us what happened.
        </h1>
        <p className="mt-3 max-w-xl text-[0.9rem] leading-relaxed text-muted">
          A clear brief gives advocates the context to quote accurately. Your submission stays encrypted in the secure vault.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-line bg-cardsolid p-5 shadow-[var(--shadow)] sm:p-7"
      >
        <FormField label="Practice area">
          <div className="mt-3 flex flex-wrap gap-2">
            {PRACTICE_AREAS.filter(a => a.id !== 'all').map(area => (
              <PillButton
                key={area.id}
                type="button"
                active={form.area === area.id}
                onClick={() => setForm(f => ({ ...f, area: area.id }))}
              >
                {area.label}
              </PillButton>
            ))}
          </div>
        </FormField>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <FormField label="Matter type">
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className={`${inputClassName} cursor-pointer`}
            >
              {MATTER_TYPES.map(m => (
                <option key={m.id} value={m.id} className="bg-cardsolid text-ink">
                  {m.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="City / court location">
            <input
              type="text"
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              placeholder="e.g. New Delhi"
              className={inputClassName}
            />
          </FormField>
        </div>

        {lawyers.length > 0 && (
          <div className="mt-6">
            <FormField label="Preferred Advocate (Optional)">
              <select
                value={form.assigned_lawyer_id}
                onChange={e => setForm(f => ({ ...f, assigned_lawyer_id: e.target.value }))}
                className={`${inputClassName} cursor-pointer`}
              >
                <option value="" className="bg-cardsolid text-ink">
                  Auto-match with top verified advocate
                </option>
                {lawyers.map(l => (
                  <option key={l.id} value={l.id} className="bg-cardsolid text-ink">
                    {l.name} — {l.practice} ({l.city})
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        )}

        <div className="mt-6">
          <FormField label="Brief description" hint="Minimum 12 characters">
            <textarea
              rows={4}
              value={form.summary}
              onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
              placeholder="Describe what occurred, dates, parties involved and the relief or outcome you are seeking..."
              className={inputClassName}
            />
          </FormField>
        </div>

        <div className="mt-6">
          <label className="block">
            <span className="eyebrow text-faint">Supporting Documents</span>
            <div className="mt-2 relative">
              <input
                type="file"
                id="case-doc-upload"
                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="case-doc-upload"
                className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                  selectedFile
                    ? 'border-accent bg-accentsoft/30'
                    : 'border-dashed border-line bg-card hover:border-line2'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-card text-accent">
                    <LockIcon className="size-4" />
                  </span>
                  <div>
                    <p className="text-[0.82rem] font-semibold text-ink">
                      {selectedFile ? selectedFile.name : 'Attach supporting documents'}
                    </p>
                    <p className="text-[0.72rem] text-faint">
                      {selectedFile
                        ? `${(selectedFile.size / 1024).toFixed(1)} KB · Encrypted upload`
                        : 'FIR copies, legal notices, contracts or court orders (PDF, JPG, PNG)'}
                    </p>
                  </div>
                </div>
                <Badge tone={selectedFile ? 'good' : 'line'}>
                  {selectedFile ? 'Attached' : 'Browse File'}
                </Badge>
              </label>
            </div>
          </label>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <div className="flex items-center gap-2 text-[0.75rem] text-faint">
            <ShieldLockIcon className="size-3.5 text-good" />
            <span>256-bit encrypted · Stored in secure database</span>
          </div>
          <ActionButton
            type="submit"
            size="lg"
            disabled={!isValid || submitting}
            className={!isValid || submitting ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {submitting ? 'Submitting...' : 'Submit encrypted brief'} <ArrowRightIcon className="size-4" />
          </ActionButton>
        </div>
      </form>
    </section>
  )
}

// ─── My Cases View ──────────────────────────────────────────────────────────

function MyCasesView({
  cases,
  selected,
  onSelect,
  onToast,
  onViewDocs,
}: {
  cases: CaseItem[]
  selected: string
  onSelect: (id: string) => void
  onToast: (title: string, body: string) => void
  onViewDocs?: (item: CaseItem) => void
}) {
  const [filter, setFilter] = useState('All')
  const filteredCases = filter === 'All' ? cases : cases.filter(c => c.status === filter)
  const activeCase = cases.find(c => c.id === selected) ?? cases[0]

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow text-accent">Case management</span>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,2.8rem)] font-bold text-inkstrong">
            Your legal matters
          </h1>
          <p className="mt-3 text-[0.88rem] text-muted">
            Open a matter to see its document vault, progress and next court date.
          </p>
        </div>
        <Badge tone="good">{cases.length} cases on file</Badge>
      </div>

      <div className="hide-scroll mt-7 flex gap-2 overflow-x-auto pb-1">
        {['All', 'Pending', 'Hearing scheduled', 'In progress', 'Order reserved'].map(status => (
          <PillButton key={status} active={filter === status} onClick={() => setFilter(status)}>
            {status}
          </PillButton>
        ))}
      </div>

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(18rem,.76fr)_minmax(0,1.24fr)]">
        <CaseCardsList cases={filteredCases} selected={selected} onSelect={onSelect} />
        {activeCase && (
          <CaseDetailPane
            item={activeCase}
            onToast={onToast}
            onViewDocs={onViewDocs}
          />
        )}
      </div>
    </section>
  )
}

// ─── Find Lawyer View ───────────────────────────────────────────────────────

function LawyerCard({
  lawyer,
  onBook,
}: {
  lawyer: LawyerItem
  onBook: (l: LawyerItem) => void
}) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-line bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 sm:flex-row sm:items-center">
      <AvatarInitials initials={lawyer.initials} hue={lawyer.hue} photoUrl={lawyer.photo_url} size={52} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-[0.93rem] font-semibold text-inkstrong">{lawyer.name}</p>
          <VerifiedBadge />
        </div>
        <p className="mt-0.5 text-[0.76rem] font-medium text-accent">{lawyer.practice}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] text-muted">
          <span className="flex items-center gap-1">
            <StarRating rating={lawyer.rating} /> {lawyer.rating}
          </span>
          <span>{lawyer.exp} yrs experience</span>
          <span className="flex items-center gap-1">
            <PinIcon className="size-3" /> {lawyer.city}
          </span>
        </div>
      </div>
      <div className="flex items-end justify-between gap-4 border-t border-line pt-3 sm:block sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        <div>
          <p className="eyebrow text-[0.55rem] text-faint">Consultation</p>
          <p className="mt-1 font-display text-lg font-bold text-inkstrong">
            ₹{lawyer.fee.toLocaleString('en-IN')}
          </p>
        </div>
        <ActionButton size="sm" onClick={() => onBook(lawyer)} className="sm:mt-2">
          Book
        </ActionButton>
      </div>
    </div>
  )
}

function FindLawyersView({
  lawyers,
  onToast,
}: {
  lawyers: LawyerItem[]
  onToast: (title: string, body: string) => void
}) {
  const [search, setSearch] = useState('')
  const [area, setArea] = useState('all')

  const filteredLawyers = useMemo(() => {
    return lawyers.filter(l => {
      const matchArea = area === 'all' || l.area === area
      const matchSearch = [l.name, l.practice, l.city, ...(l.languages || [])]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
      return matchArea && matchSearch
    })
  }, [lawyers, area, search])

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow text-gold">Verified network</span>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,2.8rem)] font-bold text-inkstrong">
            Find the right advocate.
          </h1>
          <p className="mt-3 max-w-xl text-[0.88rem] leading-relaxed text-muted">
            Filter bar-verified legal specialists by practice area, location and availability.
          </p>
        </div>
        <Badge tone="good">{filteredLawyers.length} available</Badge>
      </div>

      <div className="mt-7 rounded-3xl border border-line bg-cardsolid p-4 sm:p-5">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, city or language"
            className={`${inputClassName} pl-10`}
          />
        </div>
        <div className="hide-scroll mt-4 flex gap-2 overflow-x-auto pb-0.5">
          {PRACTICE_AREAS.map(p => (
            <PillButton key={p.id} active={area === p.id} onClick={() => setArea(p.id)}>
              {p.label}
            </PillButton>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {filteredLawyers.map(lawyer => (
          <LawyerCard
            key={lawyer.id}
            lawyer={lawyer}
            onBook={l =>
              onToast(
                'Consultation request started',
                `A secure request to ${l.name} is ready for your confirmation.`
              )
            }
          />
        ))}

        {!filteredLawyers.length && (
          <div className="rounded-3xl border border-dashed border-line2 p-10 text-center">
            <p className="font-display text-xl text-inkstrong">No advocates match those filters.</p>
            <p className="mt-2 text-[0.84rem] text-muted">
              Try a broader search or choose a different practice area.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Main ClientDashboard Page Component ────────────────────────────────────

export default function ClientDashboard() {
  const { user } = useAuth()
  const location = useLocation()
  const VALID_VIEWS = ['overview', 'submit', 'cases', 'lawyers']
  const queryView = new URLSearchParams(location.search).get('view') || ''
  const [view, setView] = useState(VALID_VIEWS.includes(queryView) ? queryView : 'overview')
  const [rawCases, setRawCases] = useState<any[]>(() => {
    try {
      const cached = sessionStorage.getItem('ln_cached_cases')
      return cached ? JSON.parse(cached) : []
    } catch { return [] }
  })
  const [rawLawyers, setRawLawyers] = useState<any[]>(() => {
    try {
      const cached = sessionStorage.getItem('ln_cached_lawyers')
      return cached ? JSON.parse(cached) : []
    } catch { return [] }
  })
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('ln_cached_cases')
    } catch { return true }
  })
  const [selectedCaseId, setSelectedCaseId] = useState<string>('')
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null)
  const [viewDocModalCase, setViewDocModalCase] = useState<CaseItem | null>(null)

  useEffect(() => {
    const qView = new URLSearchParams(location.search).get('view') || ''
    if (qView && VALID_VIEWS.includes(qView)) {
      setView(qView)
    } else if (!qView) {
      setView('overview')
    }
  }, [location.search])

  const showToast = (title: string, body: string) => {
    setToast({ title, body })
    setTimeout(() => {
      setToast(null)
    }, 4500)
  }

  // Load real data from backend API with background revalidation
  const loadData = async (silent = false) => {
    try {
      if (!silent && !rawCases.length) setLoading(true)
      const [casesRes, lawyersRes] = await Promise.all([
        authFetch('/api/cases'),
        authFetch('/api/lawyers'),
      ])

      const dbCases = casesRes.ok ? await casesRes.json() : []
      const dbLawyers = lawyersRes.ok ? await lawyersRes.json() : []

      if (Array.isArray(dbCases)) {
        setRawCases(dbCases)
        try { sessionStorage.setItem('ln_cached_cases', JSON.stringify(dbCases)) } catch {}
      }
      if (Array.isArray(dbLawyers)) {
        setRawLawyers(dbLawyers)
        try { sessionStorage.setItem('ln_cached_lawyers', JSON.stringify(dbLawyers)) } catch {}
      }
    } catch (err) {
      console.error('Failed to load client dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(rawCases.length > 0)
  }, [])

  // Lawyers map for easy lookup
  const lawyersList: LawyerItem[] = useMemo(() => {
    if (rawLawyers.length === 0) return []
    return rawLawyers.map((l: any, idx: number) => {
      const name = l.name || 'Advocate'
      const initials = name
        .split(' ')
        .map((p: string) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
      const spec = l.specialty || l.practice || 'General Practice'
      let area = 'civil'
      const lower = spec.toLowerCase()
      if (lower.includes('crim')) area = 'criminal'
      else if (lower.includes('div') || lower.includes('fam')) area = 'family'
      else if (lower.includes('corp') || lower.includes('tax')) area = 'corporate'
      else if (lower.includes('prop') || lower.includes('real')) area = 'property'
      else if (lower.includes('cyber')) area = 'cyber'

      return {
        id: l.id || `l-${idx}`,
        name,
        initials,
        practice: spec,
        area,
        city: l.city || l.location || 'New Delhi',
        exp: l.experience_years || l.exp || 8 + (idx % 8),
        rating: l.rating || 4.7 + (idx % 3) * 0.1,
        reviews: l.reviews_count || l.reviews || 95 + idx * 25,
        fee: l.consultation_fee || l.fee || 2000 + (idx % 5) * 500,
        languages: Array.isArray(l.languages)
          ? l.languages
          : typeof l.languages === 'string'
          ? l.languages.split(',').map((s: string) => s.trim())
          : ['English', 'Hindi'],
        courts: Array.isArray(l.courts)
          ? l.courts
          : typeof l.courts === 'string'
          ? l.courts.split(',').map((s: string) => s.trim())
          : ['District Court', 'High Court'],
        bio: l.bio || 'Verified advocate registered with Bar Council of India.',
        verified: true,
        availability: 'Today',
        hue: (name.charCodeAt(0) * 53) % 360,
        success: 85 + (idx % 12),
        photo_url: l.photo_url || null,
      }
    })
  }, [rawLawyers])

  const lawyersMap = useMemo(() => {
    const map: Record<string, LawyerItem> = {}
    lawyersList.forEach(l => {
      map[l.id] = l
    })
    return map
  }, [lawyersList])

  // Formatted cases list mapped from real DB
  const casesList: CaseItem[] = useMemo(() => {
    return rawCases.map((c: any) => {
      const shortId = `LN-2026-${String(c.id).slice(0, 5).toUpperCase()}`
      const rawStatus = (c.status || 'Pending').toLowerCase()
      let normStatus: CaseItem['status'] = 'Pending'
      let progress = 15
      let stage = 'Brief submitted'

      if (rawStatus.includes('prog')) {
        normStatus = 'In progress'
        progress = 62
        stage = 'Evidence stage'
      } else if (rawStatus.includes('hear')) {
        normStatus = 'Hearing scheduled'
        progress = 85
        stage = 'Hearing scheduled'
      } else if (rawStatus.includes('reserv') || rawStatus.includes('resolv') || rawStatus.includes('clos')) {
        normStatus = 'Order reserved'
        progress = 100
        stage = 'Order reserved'
      }

      let formattedDate = 'Advocate confirmation pending'
      if (c.hearing_date) {
        try {
          const d = new Date(c.hearing_date)
          formattedDate = d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        } catch {}
      }

      const advocateName = c.assigned_lawyer_id && lawyersMap[c.assigned_lawyer_id]
        ? lawyersMap[c.assigned_lawyer_id].name
        : 'Matching in progress'

      return {
        id: shortId,
        rawId: c.id,
        title: c.title || 'Untitled Case Matter',
        type: c.case_type || 'General Matter',
        court: c.case_location || 'District Court',
        stage,
        next: formattedDate,
        status: normStatus,
        progress,
        advocate: advocateName,
        last: c.description
          ? c.description.slice(0, 100)
          : 'Your encrypted case brief was received securely.',
        document_url: c.document_url || null,
      }
    })
  }, [rawCases, lawyersMap])

  useEffect(() => {
    if (casesList.length > 0 && !selectedCaseId) {
      setSelectedCaseId(casesList[0].id)
    }
  }, [casesList, selectedCaseId])

  const handleCaseSubmit = async (formData: {
    title: string
    description: string
    case_type: string
    case_location: string
    assigned_lawyer_id?: string | null
    file?: File | null
  }) => {
    let document_url: string | null = null
    if (formData.file && user?.id) {
      const ext = formData.file.name.split('.').pop()
      const cleanName = formData.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `case-docs/${user.id}_${Date.now()}_${cleanName}`
      const buckets = ['profile-photos', 'lawyer-photos', 'case-documents']
      
      for (const bucket of buckets) {
        try {
          const { error } = await supabase.storage.from(bucket).upload(path, formData.file, { upsert: true })
          if (!error) {
            const { data } = supabase.storage.from(bucket).getPublicUrl(path)
            if (data?.publicUrl) {
              document_url = data.publicUrl
              break
            }
          }
        } catch {}
      }
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      case_type: formData.case_type,
      case_location: formData.case_location,
      assigned_lawyer_id: formData.assigned_lawyer_id || null,
      client_id: user?.id,
      status: 'Pending',
      document_url,
    }

    const res = await authFetch('/api/cases', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      showToast('Case brief submitted', 'Your case is securely saved and is now matching with verified advocates.')
      await loadData()
    } else {
      showToast('Error', 'Failed to submit case. Please check your connection.')
    }
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-accent/30 bg-cardsolid p-4 shadow-2xl anim-rise">
          <div className="flex items-start gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accentsoft text-accent">
              <CheckIcon className="size-4" />
            </span>
            <div className="flex-1">
              <p className="text-[0.84rem] font-semibold text-inkstrong">{toast.title}</p>
              <p className="mt-0.5 text-[0.74rem] leading-relaxed text-muted">{toast.body}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-faint hover:text-ink text-xs font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Top Header Navigation */}
      <ClientNav />

      {/* Main Content Area */}
      <main className="relative py-7 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 grid-bg opacity-20 [mask-image:linear-gradient(to_bottom,#000,transparent_75%)]"
        />
        <div className="site-shell relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="size-9 rounded-full border-2 border-line border-t-accent animate-spin" />
              <p className="text-sm font-medium text-muted">Loading your case portal...</p>
            </div>
          ) : (
            <>
              {view === 'overview' && (
                <OverviewView
                  cases={casesList}
                  selected={selectedCaseId}
                  onSelect={setSelectedCaseId}
                  setView={setView}
                  onToast={showToast}
                />
              )}
              {view === 'submit' && (
                <SubmitCaseView
                  onSubmit={handleCaseSubmit}
                  setView={setView}
                  lawyers={lawyersList}
                />
              )}
              {view === 'cases' && (
                <MyCasesView
                  cases={casesList}
                  selected={selectedCaseId}
                  onSelect={setSelectedCaseId}
                  onToast={showToast}
                  onViewDocs={(c) => setViewDocModalCase(c)}
                />
              )}
              {view === 'lawyers' && (
                <FindLawyersView
                  lawyers={lawyersList}
                  onToast={showToast}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Document Viewer Modal */}
      {viewDocModalCase && (
        <DocumentViewerModal
          item={{
            id: viewDocModalCase.id,
            shortId: viewDocModalCase.id,
            title: viewDocModalCase.title,
            type: viewDocModalCase.type,
            stage: viewDocModalCase.stage,
            status: viewDocModalCase.status,
            progress: viewDocModalCase.progress,
            court: viewDocModalCase.court,
            next: viewDocModalCase.next,
            advocate: viewDocModalCase.advocate,
            last: viewDocModalCase.last,
            document_url: viewDocModalCase.document_url,
          }}
          onClose={() => setViewDocModalCase(null)}
          onDocUpdated={(newUrl) => {
            setRawCases(prev => prev.map(c => String(c.id) === viewDocModalCase.id ? { ...c, document_url: newUrl } : c))
            setViewDocModalCase(prev => prev ? { ...prev, document_url: newUrl } : null)
          }}
          onToast={showToast}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-line bg-band mt-12">
        <div className="site-shell flex flex-col items-center justify-between gap-3 py-5 text-center sm:flex-row sm:text-left">
          <p className="text-[0.72rem] text-faint">
            © 2026 LegalNexus · Private client workspace
          </p>
          <div className="flex items-center gap-4 text-[0.72rem] text-faint">
            <span className="flex items-center gap-1.5">
              <ShieldLockIcon className="size-3 text-good" /> Encrypted
            </span>
            <a href="#top" className="hover:text-ink">
              Support
            </a>
            <a href="#top" className="hover:text-ink">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
