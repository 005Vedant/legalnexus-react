import React, { useRef, useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useTheme } from '../contexts/ThemeContext'

function LegalNexusLogoIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10.5L12 5l6 5.5" />
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="6.5" y1="14.5" x2="17.5" y2="14.5" />
      <line x1="6.5" y1="19" x2="17.5" y2="19" />
    </svg>
  )
}
function SunIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
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
function BellIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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

/* ── nav link map: what tab to highlight for each route ─────────── */
const ROUTE_TO_TAB: Record<string, string> = {
  '/dashboard': 'overview',
  '/': 'overview',
  '/cases': 'cases',
  '/lawyers': 'lawyers',
  '/faq': 'faq',
  '/profile': '',
}

export default function ClientNav() {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [dropOpen, setDropOpen] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('photo_url').eq('id', user.id).maybeSingle()
      .then(({ data }) => { if (data?.photo_url) setPhotoUrl(data.photo_url) })
  }, [user])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = displayName.split(/\s+/).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  // Determine active tab — handle ?view= query param for dashboard sub-views
  const searchParams = new URLSearchParams(location.search)
  const viewParam = searchParams.get('view')
  let activeTab = ROUTE_TO_TAB[location.pathname] ?? ''
  if (location.pathname === '/dashboard' && viewParam === 'submit') activeTab = 'submit'

  const navLinks = [
    { id: 'overview',  label: 'Overview',       href: '/dashboard' },
    { id: 'submit',    label: 'Submit a case',   href: '/dashboard?view=submit' },
    { id: 'cases',     label: 'My cases',        href: '/cases' },
    { id: 'lawyers',   label: 'Find a lawyer',   href: '/lawyers' },
    { id: 'faq',       label: 'FAQ',             href: '/faq' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-xl">
      <div className="site-shell flex h-[4.5rem] items-center justify-between gap-4">

        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 text-left group cursor-pointer shrink-0"
        >
          <img
            src="/logo.jpg"
            alt="LegalNexus Logo"
            className="size-10 rounded-2xl object-cover shadow-[0_8px_22px_-6px_rgba(91,134,255,0.65)] ring-1 ring-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_10px_28px_-4px_rgba(91,134,255,0.8)]"
          />
          <span className="font-display text-[1.28rem] font-bold tracking-tight bg-gradient-to-r from-[#5b86ff] via-[#c084fc] to-[#efb75a] bg-clip-text text-transparent drop-shadow-sm">
            LegalNexus
          </span>
        </button>

        {/* Nav Tabs — pill style identical to dashboard */}
        <nav className="hide-scroll hidden items-center gap-1 md:flex">
          {navLinks.map(link => (
            <Link
              key={link.id}
              to={link.href}
              className={`rounded-full px-3.5 py-2 text-[0.78rem] font-semibold transition-all duration-300 ${
                activeTab === link.id
                  ? 'bg-accentsoft text-accent'
                  : 'text-muted hover:bg-card hover:text-ink'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="hidden size-9 place-items-center rounded-xl border border-line bg-card text-muted transition-all hover:border-accent hover:text-accent sm:grid cursor-pointer"
          >
            {theme === 'midnight' ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
          </button>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative grid size-9 place-items-center rounded-xl border border-line bg-card text-muted transition-all duration-300 hover:border-accent hover:text-accent cursor-pointer"
          >
            <BellIcon className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-gold" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropRef}>
            <button
              type="button"
              onClick={() => setDropOpen(o => !o)}
              className="flex items-center gap-2 rounded-xl border border-line bg-card p-1.5 pl-2 transition hover:border-line2 hover:bg-card2 cursor-pointer"
            >
              {photoUrl ? (
                <img src={photoUrl} alt="" className="size-7 rounded-lg object-cover" />
              ) : (
                <div className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-accent to-[#2a3f9e] font-mono text-xs font-bold text-white shadow-xs">
                  {initials}
                </div>
              )}
              <div className="hidden text-left sm:block">
                <p className="text-[0.78rem] font-semibold leading-tight text-ink">{displayName}</p>
                <span className="block text-[0.63rem] text-faint">Client account</span>
              </div>
              <ChevronDownIcon className={`hidden size-3.5 text-faint transition-transform sm:block ${dropOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropOpen && (
              <div className="anim-rise absolute right-0 top-[calc(100%+0.6rem)] z-50 w-56 rounded-2xl border border-line bg-cardsolid p-1.5 shadow-[var(--shadow)]">
                <div className="border-b border-line px-3 py-2.5">
                  <p className="text-[0.8rem] font-semibold text-ink">{displayName}</p>
                  <p className="truncate text-[0.68rem] text-muted">{user?.email || ''}</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setDropOpen(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.78rem] text-muted transition hover:bg-card hover:text-ink"
                  >
                    <span>👤</span> My Profile
                  </Link>
                  <Link
                    to="/cases"
                    onClick={() => setDropOpen(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.78rem] text-muted transition hover:bg-card hover:text-ink"
                  >
                    <span>📋</span> My Cases
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setDropOpen(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.78rem] text-muted transition hover:bg-card hover:text-ink"
                  >
                    <span>🏠</span> Dashboard
                  </Link>
                </div>
                <div className="border-t border-line pt-1">
                  <button
                    type="button"
                    onClick={() => { signOut(); setDropOpen(false) }}
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
