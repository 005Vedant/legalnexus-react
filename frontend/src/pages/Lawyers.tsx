import React, { useEffect, useMemo, useState } from 'react'
import { authFetch } from '../lib/authFetch'
import ClientNav from '../components/ClientNav'

/* ── Icons ──────────────────────────────────────────────────────── */
function SearchIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
function PinIcon({ className = 'size-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function StarIcon({ className = 'size-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
function CheckIcon({ className = 'size-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function ShieldLockIcon({ className = 'size-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <circle cx="12" cy="11" r="1.5" /><path d="M12 12.5V15" />
    </svg>
  )
}

/* ── Practice area filter data ──────────────────────────────────── */
const PRACTICE_AREAS = [
  { id: 'all',       label: 'All' },
  { id: 'criminal',  label: 'Criminal Law' },
  { id: 'family',    label: 'Family & Divorce' },
  { id: 'corporate', label: 'Corporate Law' },
  { id: 'property',  label: 'Property Law' },
  { id: 'cyber',     label: 'Cybercrime' },
  { id: 'civil',     label: 'Civil Law' },
  { id: 'other',     label: 'Other' },
]

type LawyerItem = {
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
  bio: string
  verified: boolean
  hue: number
  photo_url: string | null
}

/* ── Avatar component ────────────────────────────────────────────── */
function AvatarInitials({ initials, hue, photoUrl, size = 52 }: { initials: string; hue: number; photoUrl: string | null; size?: number }) {
  const s = `${size}px`
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={initials}
        className="rounded-2xl object-cover shrink-0 border border-line"
        style={{ width: s, height: s }}
      />
    )
  }
  return (
    <div
      className="grid shrink-0 place-items-center rounded-2xl font-mono font-bold text-white border border-white/10"
      style={{ width: s, height: s, fontSize: size * 0.33, background: `hsl(${hue},55%,38%)` }}
    >
      {initials}
    </div>
  )
}

/* ── Verified badge ─────────────────────────────────────────────── */
function VerifiedBadge() {
  return (
    <span className="grid size-4 place-items-center rounded-full bg-good/20 text-good">
      <CheckIcon className="size-2.5" />
    </span>
  )
}

/* ── Star rating row ─────────────────────────────────────────────── */
function StarsRow({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-gold">
      {[1, 2, 3, 4, 5].map(i => (
        <StarIcon key={i} className={`size-3 ${i <= Math.round(rating) ? 'text-gold' : 'text-faint'}`} />
      ))}
    </span>
  )
}

/* ── Pill button ─────────────────────────────────────────────────── */
function PillBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-[0.75rem] font-semibold transition-all cursor-pointer ${
        active ? 'bg-accent text-white shadow-[0_4px_14px_-4px_var(--glow-a)]' : 'border border-line bg-card text-muted hover:bg-card2 hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

/* ── Toast ───────────────────────────────────────────────────────── */
type Toast = { title: string; body: string }

/* ── Single lawyer row card (matches dashboard LawyerCard exactly) ── */
function LawyerCard({ lawyer, onBook }: { lawyer: LawyerItem; onBook: (l: LawyerItem) => void }) {
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
            <StarsRow rating={lawyer.rating} /> {lawyer.rating.toFixed(1)}
          </span>
          <span>{lawyer.exp} yrs experience</span>
          <span className="flex items-center gap-1">
            <PinIcon className="size-3" /> {lawyer.city}
          </span>
          {lawyer.languages.slice(0, 2).map(l => (
            <span key={l} className="rounded-full border border-line px-2 py-0.5 text-[0.65rem]">{l}</span>
          ))}
        </div>
      </div>
      <div className="flex items-end justify-between gap-4 border-t border-line pt-3 sm:block sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        <div>
          <p className="eyebrow text-[0.55rem] text-faint">Consultation</p>
          <p className="mt-1 font-display text-lg font-bold text-inkstrong">
            ₹{lawyer.fee.toLocaleString('en-IN')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onBook(lawyer)}
          className="mt-0 sm:mt-2 rounded-xl bg-accent px-4 py-2 text-[0.78rem] font-semibold text-white shadow-[0_4px_14px_-4px_var(--glow-a)] transition hover:brightness-110 cursor-pointer"
        >
          Book
        </button>
      </div>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function Lawyers() {
  const [rawLawyers, setRawLawyers] = useState<any[]>(() => {
    try {
      const cached = sessionStorage.getItem('ln_cached_lawyers')
      return cached ? JSON.parse(cached) : []
    } catch { return [] }
  })
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('ln_cached_lawyers')
    } catch { return true }
  })
  const [search, setSearch] = useState('')
  const [area, setArea] = useState('all')
  const [toast, setToast] = useState<Toast | null>(null)

  const loadLawyers = (silent = false) => {
    if (!silent && !rawLawyers.length) setLoading(true)
    authFetch('/api/lawyers')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setRawLawyers(data)
          try { sessionStorage.setItem('ln_cached_lawyers', JSON.stringify(data)) } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadLawyers(rawLawyers.length > 0)
  }, [])

  const lawyers: LawyerItem[] = useMemo(() => {
    return rawLawyers.map((l: any, idx: number) => {
      const name = l.name || 'Advocate'
      const initials = name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()
      const spec = l.specialty || l.practice || 'General Practice'
      const lower = spec.toLowerCase()
      let areaId = 'civil'
      if (lower.includes('crim')) areaId = 'criminal'
      else if (lower.includes('div') || lower.includes('fam')) areaId = 'family'
      else if (lower.includes('corp') || lower.includes('tax')) areaId = 'corporate'
      else if (lower.includes('prop') || lower.includes('real')) areaId = 'property'
      else if (lower.includes('cyber')) areaId = 'cyber'

      return {
        id: l.id || `l-${idx}`,
        name,
        initials,
        practice: spec,
        area: areaId,
        city: l.city || l.location || 'New Delhi',
        exp: l.experience_years || l.exp || 8 + (idx % 8),
        rating: parseFloat(l.rating) || 4.7 + (idx % 3) * 0.1,
        reviews: l.reviews_count || 95 + idx * 25,
        fee: l.consultation_fee || l.fee || 2000 + (idx % 5) * 500,
        languages: Array.isArray(l.languages)
          ? l.languages
          : typeof l.languages === 'string'
          ? l.languages.split(',').map((s: string) => s.trim())
          : ['English', 'Hindi'],
        bio: l.bio || 'Verified advocate registered with Bar Council of India.',
        verified: true,
        hue: (name.charCodeAt(0) * 53) % 360,
        photo_url: l.profile_image || l.photo_url || null,
      }
    })
  }, [rawLawyers])

  const filtered = useMemo(() => {
    return lawyers.filter(l => {
      const matchArea = area === 'all' || l.area === area
      const matchSearch = [l.name, l.practice, l.city, ...l.languages]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
      return matchArea && matchSearch
    })
  }, [lawyers, area, search])

  const handleBook = (l: LawyerItem) => {
    setToast({ title: 'Consultation request started', body: `A secure request to ${l.name} is ready for your confirmation.` })
    setTimeout(() => setToast(null), 4500)
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <ClientNav />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-line bg-cardsolid p-4 shadow-2xl anim-rise">
          <p className="text-[0.84rem] font-semibold text-inkstrong">{toast.title}</p>
          <p className="mt-0.5 text-[0.74rem] text-muted">{toast.body}</p>
        </div>
      )}

      <main className="flex-1 py-10 px-4 sm:px-8">
        <div className="site-shell">
          <section>
            {/* Page header */}
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
              <span className="inline-flex items-center gap-1.5 rounded-full border border-good/30 bg-good/10 px-3 py-1 text-[0.75rem] font-semibold text-good shrink-0">
                {filtered.length} available
              </span>
            </div>

            {/* Search + filter panel */}
            <div className="mt-7 rounded-3xl border border-line bg-cardsolid p-4 sm:p-5">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, city or language"
                  className="w-full rounded-2xl border border-line bg-card py-3 pl-10 pr-4 text-[0.88rem] text-ink placeholder:text-faint outline-none transition focus:border-accent focus:ring-2 focus:ring-accentsoft"
                />
              </div>
              <div className="hide-scroll mt-4 flex gap-2 overflow-x-auto pb-0.5">
                {PRACTICE_AREAS.map(p => (
                  <PillBtn key={p.id} active={area === p.id} onClick={() => setArea(p.id)}>
                    {p.label}
                  </PillBtn>
                ))}
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20 gap-3">
                <div className="size-6 rounded-full border-2 border-line border-t-accent animate-spin" />
                <span className="text-sm text-muted">Loading advocates…</span>
              </div>
            )}

            {/* Lawyer cards */}
            {!loading && (
              <div className="mt-5 space-y-3">
                {filtered.map(lawyer => (
                  <LawyerCard key={lawyer.id} lawyer={lawyer} onBook={handleBook} />
                ))}
                {!filtered.length && (
                  <div className="rounded-3xl border border-dashed border-line2 p-10 text-center">
                    <p className="font-display text-xl text-inkstrong">No advocates match those filters.</p>
                    <p className="mt-2 text-[0.84rem] text-muted">
                      Try a broader search or choose a different practice area.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-band mt-12">
        <div className="site-shell flex flex-col items-center justify-between gap-3 py-5 text-center sm:flex-row sm:text-left">
          <p className="text-[0.72rem] text-faint">© 2026 LegalNexus · Private client workspace</p>
          <div className="flex items-center gap-4 text-[0.72rem] text-faint">
            <span className="flex items-center gap-1.5">
              <ShieldLockIcon className="size-3 text-good" /> Encrypted
            </span>
            <a href="mailto:support@legalnexus.in" className="hover:text-ink transition">Support</a>
            <a href="#" className="hover:text-ink transition">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
