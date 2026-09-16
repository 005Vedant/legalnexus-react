import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authFetch } from '../lib/authFetch'
import ClientNav from '../components/ClientNav'
import DocumentViewerModal from '../components/DocumentViewerModal'

/* ── Icons ──────────────────────────────────────────────────────── */
function ScaleIcon({ className = 'size-4' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" /></svg>
}
function CalendarIcon({ className = 'size-4' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}
function PinIcon({ className = 'size-4' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
}
function DocIcon({ className = 'size-4' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
}
function MessageIcon({ className = 'size-4' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
}
function AdvocateIcon({ className = 'size-4' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
}
function ShieldLockIcon({ className = 'size-3' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><circle cx="12" cy="11" r="1.5" /><path d="M12 12.5V15" /></svg>
}
function ArrowRightIcon({ className = 'size-4' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
}

/* ── Status config ──────────────────────────────────────────────── */
const STATUS_BADGES: Record<string, string> = {
  'Pending': 'border-gold/30 bg-goldsoft text-gold',
  'Hearing scheduled': 'border-accent/30 bg-accentsoft text-accent',
  'In progress': 'border-good/30 bg-good/10 text-good',
  'Order reserved': 'border-line bg-card2 text-muted',
}

type CaseStatus = 'Pending' | 'In progress' | 'Hearing scheduled' | 'Order reserved'

type CaseItem = {
  id: string
  shortId: string
  title: string
  type: string
  stage: string
  status: CaseStatus
  progress: number
  court: string
  next: string
  advocate: string
  last: string
  document_url?: string | null
}

/* ── Badge primitive ────────────────────────────────────────────── */
function Badge({ children, tone = 'line' }: { children: React.ReactNode; tone?: 'line' | 'accent' | 'gold' | 'good' }) {
  const tones = {
    line: 'border-line bg-card2 text-faint',
    accent: 'border-accent/30 bg-accentsoft text-accent',
    gold: 'border-gold/30 bg-goldsoft text-gold',
    good: 'border-good/30 bg-good/10 text-good',
  }
  return <span className={`eyebrow rounded-full border px-2.5 py-1 ${tones[tone]}`}>{children}</span>
}

/* ── Action button ──────────────────────────────────────────────── */
function ActionButton({ children, variant = 'primary', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' }) {
  const v = {
    primary: 'bg-accent text-accentink shadow-[0_8px_24px_-10px_var(--glow-a)] hover:brightness-110 font-semibold',
    outline: 'border border-line bg-card text-ink hover:border-accent hover:text-accent',
  }
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-[0.82rem] transition-all duration-200 cursor-pointer ${v[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

/* ── Pill filter button ─────────────────────────────────────────── */
function PillButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.78rem] font-medium transition-all duration-300 cursor-pointer ${
        active
          ? 'border-accent bg-accent text-accentink shadow-[0_8px_22px_-12px_var(--glow-a)] font-semibold'
          : 'border-line bg-card text-muted hover:border-line2 hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

/* ── Case card list ─────────────────────────────────────────────── */
function CaseCardsList({ cases, selected, onSelect }: { cases: CaseItem[]; selected: string; onSelect: (id: string) => void }) {
  if (cases.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line2 p-8 text-center bg-card/40">
        <ScaleIcon className="size-8 text-faint mx-auto mb-2 opacity-60" />
        <p className="font-semibold text-[0.95rem] text-inkstrong">No cases submitted yet</p>
        <p className="mt-1 text-[0.78rem] text-muted">Click "Submit a case" to brief your matter with verified legal counsel.</p>
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
                <p className="font-mono text-[0.63rem] uppercase tracking-[0.14em] text-faint">{item.shortId}</p>
                <p className="mt-1 truncate text-[0.88rem] font-semibold text-inkstrong">{item.title}</p>
                <p className="mt-1 truncate text-[0.72rem] text-muted">{item.type} · {item.stage}</p>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-1 text-[0.59rem] font-semibold ${STATUS_BADGES[item.status] || 'border-line bg-card text-muted'}`}>
                {item.status.toUpperCase()}
              </span>
            </div>
            {/* Progress bar */}
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
          </button>
        )
      })}
    </div>
  )
}

/* ── Case detail pane ───────────────────────────────────────────── */
function CaseDetailPane({
  item,
  onToast,
  onViewDocs,
}: {
  item: CaseItem
  onToast: (t: string, b: string) => void
  onViewDocs: (item: CaseItem) => void
}) {
  const steps = ['Case brief submitted', 'Advocate engaged', 'Documents reviewed', item.stage, 'Final order']
  const currentStep = Math.max(1, Math.ceil(item.progress / 24))

  return (
    <div className="rounded-3xl border border-line bg-cardsolid p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-accent">Selected matter</p>
          <h2 className="mt-2 font-display text-[1.35rem] font-bold leading-snug text-inkstrong">{item.title}</h2>
          <p className="mt-1.5 flex items-center gap-1.5 text-[0.76rem] text-muted">
            <PinIcon className="size-3.5 text-gold" /> {item.court}
          </p>
        </div>
        <Badge tone={item.status === 'In progress' ? 'good' : item.status === 'Pending' ? 'gold' : 'accent'}>
          {item.status}
        </Badge>
      </div>

      {/* Meta tiles */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { k: 'Next date', v: item.next, Icon: CalendarIcon },
          { k: 'Stage', v: item.stage, Icon: ScaleIcon },
          { k: 'Your advocate', v: item.advocate, Icon: AdvocateIcon },
        ].map(detail => (
          <div key={detail.k} className="rounded-2xl border border-line bg-card2 p-3 last:col-span-2 sm:last:col-span-1">
            <detail.Icon className="size-4 text-gold" />
            <p className="mt-2 text-[0.63rem] text-faint">{detail.k}</p>
            <p className="mt-1 text-[0.77rem] font-semibold leading-snug text-ink">{detail.v}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
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
                <p className={`text-[0.82rem] font-medium ${idx <= currentStep ? 'text-ink' : 'text-faint'}`}>{step}</p>
                <p className="mt-0.5 text-[0.68rem] text-faint">
                  {idx < currentStep ? 'Completed' : idx === currentStep ? 'Current stage' : 'Upcoming'}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div className="mt-6 grid gap-2 border-t border-line pt-5 sm:grid-cols-2">
        <ActionButton
          variant="outline"
          onClick={() => onViewDocs(item)}
        >
          <DocIcon className="size-4" /> {item.document_url ? 'View attached document' : 'View documents vault'}
        </ActionButton>
        <ActionButton onClick={() => onToast('Message thread opened', `A secure message thread with ${item.advocate} is ready.`)}>
          <MessageIcon className="size-4" /> Message advocate
        </ActionButton>
      </div>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────── */
const STATUS_FILTERS = ['All', 'Pending', 'Hearing scheduled', 'In progress', 'Order reserved']

export default function Cases() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [rawCases, setRawCases] = useState<any[]>(() => {
    try {
      const cached = sessionStorage.getItem('ln_cached_cases')
      return cached ? JSON.parse(cached) : []
    } catch { return [] }
  })
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('ln_cached_cases')
    } catch { return true }
  })
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState('')
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null)
  const [viewDocModalCase, setViewDocModalCase] = useState<CaseItem | null>(null)

  const showToast = (title: string, body: string) => {
    setToast({ title, body })
    setTimeout(() => setToast(null), 4500)
  }

  const loadCases = (silent = false) => {
    if (!silent && !rawCases.length) setLoading(true)
    authFetch('/api/cases')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setRawCases(data)
          try { sessionStorage.setItem('ln_cached_cases', JSON.stringify(data)) } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCases(rawCases.length > 0)
  }, [])

  const cases: CaseItem[] = useMemo(() => {
    return rawCases.map((c: any) => {
      const shortId = `LN-${String(c.id).slice(0, 8).toUpperCase()}`
      const rawStatus = (c.status || 'Pending').toLowerCase()
      let status: CaseStatus = 'Pending'
      let progress = 15
      let stage = 'Brief submitted'

      if (rawStatus.includes('prog')) { status = 'In progress'; progress = 62; stage = 'Evidence stage' }
      else if (rawStatus.includes('hear')) { status = 'Hearing scheduled'; progress = 85; stage = 'Hearing scheduled' }
      else if (rawStatus.includes('reserv') || rawStatus.includes('resolv') || rawStatus.includes('clos')) { status = 'Order reserved'; progress = 100; stage = 'Order reserved' }

      let next = 'Advocate confirmation pending'
      if (c.hearing_date) {
        try {
          next = new Date(c.hearing_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        } catch {}
      }

      return {
        id: String(c.id),
        shortId,
        title: c.title || c.case_type || 'Untitled matter',
        type: [c.case_type, c.court].filter(Boolean).join(' · ') || 'General',
        stage,
        status,
        progress,
        court: c.court || 'District Court',
        next,
        advocate: 'Matching in progress',
        last: c.description || c.summary || 'No additional details.',
        document_url: c.document_url || null,
      }
    })
  }, [rawCases])

  // Set first case as selected when data loads
  useEffect(() => {
    if (cases.length > 0 && !selected) setSelected(cases[0].id)
  }, [cases])

  const filtered = filter === 'All' ? cases : cases.filter(c => c.status === filter)
  const activeCase = cases.find(c => c.id === selected) ?? cases[0]

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <ClientNav />

      {/* Document Viewer Modal */}
      {viewDocModalCase && (
        <DocumentViewerModal
          item={viewDocModalCase}
          onClose={() => setViewDocModalCase(null)}
          onDocUpdated={(newUrl) => {
            setRawCases(prev => prev.map(c => String(c.id) === viewDocModalCase.id ? { ...c, document_url: newUrl } : c))
            setViewDocModalCase(prev => prev ? { ...prev, document_url: newUrl } : null)
          }}
          onToast={showToast}
        />
      )}

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
                <span className="eyebrow text-accent">Case management</span>
                <h1 className="mt-3 font-display text-[clamp(2rem,4vw,2.8rem)] font-bold text-inkstrong">
                  Your legal matters
                </h1>
                <p className="mt-3 text-[0.88rem] text-muted">
                  Open a matter to see its document vault, progress and next court date.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge tone="good">{cases.length} cases on file</Badge>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard?view=submit')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-[0.82rem] font-semibold text-white shadow-[0_8px_24px_-10px_var(--glow-a)] hover:brightness-110 transition cursor-pointer"
                >
                  <DocIcon className="size-4" /> Submit new case
                </button>
              </div>
            </div>

            {/* Status filter pills */}
            <div className="hide-scroll mt-7 flex gap-2 overflow-x-auto pb-1">
              {STATUS_FILTERS.map(s => (
                <PillButton key={s} active={filter === s} onClick={() => setFilter(s)}>
                  {s}
                </PillButton>
              ))}
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20 gap-3">
                <div className="size-6 rounded-full border-2 border-line border-t-accent animate-spin" />
                <span className="text-sm text-muted">Loading your cases…</span>
              </div>
            )}

            {/* Two-column layout */}
            {!loading && (
              <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(18rem,.76fr)_minmax(0,1.24fr)]">
                {/* Left: case list */}
                <CaseCardsList cases={filtered} selected={selected} onSelect={setSelected} />

                {/* Right: detail pane */}
                {activeCase && (
                  <CaseDetailPane
                    item={activeCase}
                    onToast={showToast}
                    onViewDocs={(c) => setViewDocModalCase(c)}
                  />
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
