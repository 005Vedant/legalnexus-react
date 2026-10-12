import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../lib/supabase'
import { authFetch } from '../lib/authFetch'
import DocumentViewerModal, { CaseDocModalItem } from '../components/DocumentViewerModal'

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

function PenToolIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19 7-7 3 3-7 7-3-3z" />
      <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="m2 2 7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  )
}

function CopyIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

function DownloadIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function PhoneIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
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

function ArrowRightIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function CreditCardIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}

function SparklesIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}

// ─── Data Models & Defaults ──────────────────────────────────────────────────

interface MatterItem {
  id: string
  rawId: string
  title: string
  client: string
  initials: string
  hue: number
  type: string
  court: string
  next: string
  status: 'In progress' | 'Hearing scheduled' | 'Pending' | 'Order reserved' | 'Resolved' | 'Closed'
  progress: number
  note: string
  fee: string
  document_url?: string | null
  hearing_date?: string | null
  created_at?: string
  description?: string
}

interface DraftTemplate {
  id: string
  name: string
  court: string
  description: string
}

const DRAFT_TEMPLATES: DraftTemplate[] = [
  {
    id: 'written-statement',
    name: 'Written statement',
    court: 'Civil and commercial matters',
    description: 'Prepare a structured response with preliminary objections, paragraph-wise reply and prayer.',
  },
  {
    id: 'legal-notice',
    name: 'Legal notice',
    court: 'Consumer and commercial disputes',
    description: 'Issue a concise demand notice based on the record, timeline and relief sought.',
  },
  {
    id: 'evidence-affidavit',
    name: 'Evidence affidavit',
    court: 'District courts and tribunals',
    description: "Convert the client's verified facts and documents into a clean affidavit of evidence.",
  },
  {
    id: 'bail-application',
    name: 'Bail application',
    court: 'Criminal courts',
    description: 'Structure grounds, factual context, undertaking and prayer for interim or regular bail.',
  },
  {
    id: 'vakalatnama-note',
    name: 'Vakalatnama cover note',
    court: 'Any court or forum',
    description: 'Create an engagement and filing note with a case-specific document checklist.',
  },
]

const DEFAULT_MATTERS: MatterItem[] = [
  {
    id: 'LN-2026-04871',
    rawId: 'mock-1',
    title: 'Sharma Traders v. Anand Enterprises',
    client: 'Vedant Sathe',
    initials: 'VS',
    hue: 220,
    type: 'Cheque Bounce - S.138 NI Act',
    court: 'Saket District Court, New Delhi',
    next: '14 Mar 2026, 10:30 AM',
    status: 'Hearing scheduled',
    progress: 62,
    note: 'Evidence list is ready. Client has approved the affidavit bundle.',
    fee: 'Milestone 3 of 4',
  },
  {
    id: 'LN-2026-04506',
    rawId: 'mock-2',
    title: 'Kapoor v. Kapoor',
    client: 'Rohan Kapoor',
    initials: 'RK',
    hue: 332,
    type: 'Family and Divorce',
    court: 'Family Court, Bandra, Mumbai',
    next: '16 Mar 2026, 2:00 PM',
    status: 'In progress',
    progress: 43,
    note: 'Need bank statements and the latest school-fee receipts before finalising maintenance submissions.',
    fee: 'Advance cleared',
  },
  {
    id: 'LN-2026-05233',
    rawId: 'mock-3',
    title: 'Nova Retail v. Singh',
    client: 'Priyansh Singh',
    initials: 'PS',
    hue: 168,
    type: 'Consumer Complaint',
    court: 'Delhi State Consumer Commission',
    next: 'Draft due tomorrow',
    status: 'In progress',
    progress: 24,
    note: 'Legal notice is being prepared from the order confirmation, invoices and correspondence.',
    fee: 'Fixed fee retainer',
  },
  {
    id: 'LN-2026-05890',
    rawId: 'mock-4',
    title: 'Mehta Property Title Resolution',
    client: 'Aarav Mehta',
    initials: 'AM',
    hue: 45,
    type: 'Property & Real Estate',
    court: 'City Civil Court, Bengaluru',
    next: '22 Mar 2026, 11:00 AM',
    status: 'Order reserved',
    progress: 88,
    note: 'Final argument submissions filed. Awaiting judgment pronouncement.',
    fee: 'Fully settled',
  },
]

const STATUS_BADGES: Record<string, string> = {
  Pending: 'border-gold/30 bg-goldsoft text-gold',
  'Hearing scheduled': 'border-accent/30 bg-accentsoft text-accent',
  'In progress': 'border-good/30 bg-good/10 text-good',
  'Order reserved': 'border-line bg-card2 text-muted',
  Resolved: 'border-good/30 bg-good/10 text-good',
  Closed: 'border-line bg-card2 text-faint',
}

const NAV_TABS = [
  { id: 'overview', label: 'Overview', icon: OverviewIcon },
  { id: 'matters', label: 'My matters', icon: ScaleIcon },
  { id: 'drafts', label: 'Draft studio', icon: PenToolIcon },
  { id: 'hearings', label: 'Hearing planner', icon: CalendarIcon },
]

// ─── Legal Draft Generator ────────────────────────────────────────────────────

function generateLegalDraft(template: DraftTemplate, matter: MatterItem, directions: string) {
  const dirText = directions.trim() || 'No additional drafting directions were supplied. Review every factual assertion against the case file before use.'
  const courtHeader = `IN THE ${matter.court.toUpperCase()}\n\nIN THE MATTER OF:\n${matter.title}\n\nCase reference: ${matter.id}\nClient: ${matter.client}\n\n`

  const bodies: Record<string, string> = {
    'written-statement': `WRITTEN STATEMENT ON BEHALF OF THE RESPONDENT

MOST RESPECTFULLY SHOWETH:

1. That the respondent submits this written statement in reply to the pleadings and denies each allegation not expressly admitted herein.

2. Preliminary objections: the petition is not maintainable on the facts and law presently placed on record, and the claimant must strictly prove every assertion.

3. Without prejudice to the above, the respondent states that the material communications and documents have been preserved and will be produced at the appropriate stage.

PRAYER

It is respectfully prayed that this Hon'ble Court may dismiss the claim with costs and pass such further order as it deems fit in the interests of justice.`,

    'legal-notice': `LEGAL NOTICE

Under instructions from and on behalf of our client, ${matter.client}, this notice is issued concerning the subject matter described above.

1. Our client has repeatedly sought an amicable resolution. The material record demonstrates that the obligations owed to our client remain unfulfilled.

2. You are hereby called upon to remedy the breach, account for the amounts due and provide a written response within 15 days of receipt of this notice.

3. Failing compliance, our client will be constrained to initiate appropriate civil, consumer and other proceedings at your risk as to cost and consequence.

This notice is issued without prejudice to all rights and remedies available to our client.`,

    'evidence-affidavit': `AFFIDAVIT OF EVIDENCE

I, ${matter.client}, do hereby solemnly affirm and state as follows:

1. I am the client in the above matter and am competent to depose to the facts stated herein.

2. The statements contained in this affidavit are true to my knowledge, based on the contemporaneous record and communications maintained in the ordinary course.

3. The documents appended to this affidavit are true copies of their respective originals.

VERIFICATION

Verified at the appropriate jurisdiction on this date that the contents above are true and correct to my knowledge and belief.`,

    'bail-application': `APPLICATION FOR BAIL

MOST RESPECTFULLY SHOWETH:

1. The applicant is entitled to the presumption of innocence and undertakes to cooperate with the investigation and trial.

2. The applicant has deep roots in the community, a fixed place of residence and no likelihood of absconding.

3. Continued custody is not necessary for any further purpose, and appropriate conditions may sufficiently safeguard the process of law.

PRAYER

It is respectfully prayed that this Hon'ble Court may be pleased to grant bail to the applicant on such terms as it considers fit.`,

    'vakalatnama-note': `ENGAGEMENT AND FILING NOTE

Matter: ${matter.title}
Client: ${matter.client}

Please arrange the following before filing:
1. Signed vakalatnama and authority letter.
2. Government photo identification and address proof.
3. Chronology of material events and all relevant correspondence.
4. Complete copies of notices, orders, invoices and proof of service.

Once the above bundle is complete, the filing set will be prepared for your final review and approval.`,
  }

  const templateBody = bodies[template.id] || bodies['written-statement']

  return `${courtHeader}${templateBody}

DRAFTING DIRECTIONS

${dirText}

Prepared in LegalNexus Draft Studio. This is a working draft for advocate review and must be checked for jurisdiction, facts, precedent and court-specific formatting before filing.`
}

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

function ActionButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'gold'
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
    gold: 'bg-gold text-goldink shadow-[0_8px_24px_-10px_var(--glow-b)] hover:brightness-110 font-semibold',
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

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_BADGES[status] || 'border-line bg-card text-muted'
  return (
    <span className={`shrink-0 rounded-full border px-2 py-1 text-[0.59rem] font-semibold ${cls}`}>
      {status.toUpperCase()}
    </span>
  )
}

function AvatarInitials({
  initials,
  hue,
  photoUrl,
  size = 40,
}: {
  initials: string
  hue: number
  photoUrl?: string | null
  size?: number
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
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-2xl font-mono font-semibold text-white ring-1 ring-white/15"
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

// ─── Main Component: LawyerDashboard ──────────────────────────────────────────

export default function LawyerDashboard() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  // Navigation and active states
  const [view, setView] = useState<'overview' | 'matters' | 'drafts' | 'hearings'>('overview')
  const [acceptingMatters, setAcceptingMatters] = useState(true)
  const [selectedMatterId, setSelectedMatterId] = useState<string>('LN-2026-04871')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Real data state
  const [matters, setMatters] = useState<MatterItem[]>(DEFAULT_MATTERS)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Quick action form inputs per matter
  const [hearingInputs, setHearingInputs] = useState<Record<string, string>>({})
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({})

  // Draft studio state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DRAFT_TEMPLATES[1].id)
  const [draftMatterId, setDraftMatterId] = useState<string>(DEFAULT_MATTERS[2].id)
  const [draftDirections, setDraftDirections] = useState<string>(
    'Include a 15-day remedy period and refer to the invoice and order confirmation already in the case files.'
  )
  const [draftText, setDraftText] = useState<string>(() =>
    generateLegalDraft(
      DRAFT_TEMPLATES[1],
      DEFAULT_MATTERS[2],
      'Include a 15-day remedy period and refer to the invoice and order confirmation already in the case files.'
    )
  )
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false)
  const [draftSavedToast, setDraftSavedToast] = useState(false)

  // Modals & toast
  const [docModalItem, setDocModalItem] = useState<CaseDocModalItem | null>(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '',
    specialty: '',
    experience_years: '',
    phone: '',
    email: '',
    bio: '',
    profile_image: '',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')

  // Toast system
  const [toast, setToast] = useState<{ title: string; body: string; tone?: 'info' | 'good' } | null>(null)
  const toastTimeoutRef = useRef<any>(null)

  const showToast = (title: string, body: string, tone: 'info' | 'good' = 'info') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToast({ title, body, tone })
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3800)
  }

  // Account dropdown
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  // ─── Fetch live data from backend & Supabase ──────────────────────────────

  const fetchDashboardData = async () => {
    setLoading(true)
    let liveCases: any[] = []
    let lawyerProfile: any = null

    try {
      // 1. Fetch lawyer profile
      if (user?.id) {
        const { data } = await supabase.from('lawyers').select('*').eq('user_id', user.id).maybeSingle()
        lawyerProfile = data
      }
      if (!lawyerProfile && user?.email) {
        const { data: byEmail } = await supabase.from('lawyers').select('*').eq('email', user.email).maybeSingle()
        if (byEmail) {
          await supabase.from('lawyers').update({ user_id: user.id }).eq('id', byEmail.id)
          lawyerProfile = { ...byEmail, user_id: user.id }
        }
      }

      if (lawyerProfile) {
        setProfile(lawyerProfile)
        setProfileForm({
          name: lawyerProfile.name || '',
          specialty: lawyerProfile.specialty || '',
          experience_years: lawyerProfile.experience_years ? String(lawyerProfile.experience_years) : '',
          phone: lawyerProfile.phone || '',
          email: lawyerProfile.email || user?.email || '',
          bio: lawyerProfile.bio || '',
          profile_image: lawyerProfile.profile_image || '',
        })
      } else {
        setProfileForm(p => ({
          ...p,
          name: user?.user_metadata?.full_name || 'Advocate',
          email: user?.email || '',
        }))
      }

      // 2. Fetch cases from backend
      const res = await authFetch('/api/cases')
      if (res.ok) {
        liveCases = await res.json()
      }
    } catch (err) {
      console.error('Error loading lawyer dashboard data:', err)
    }

    if (Array.isArray(liveCases) && liveCases.length > 0) {
      const formatted: MatterItem[] = liveCases.map((c, idx) => {
        const short = `LN-${c.id.slice(0, 8).toUpperCase()}`
        const hDate = c.hearing_date
          ? new Date(c.hearing_date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Pending schedule'

        let progress = 35
        if (c.status === 'Resolved' || c.status === 'Closed') progress = 100
        else if (c.status === 'Hearing scheduled') progress = 65
        else if (c.status === 'Order reserved') progress = 85
        else if (c.status === 'In progress' || c.status === 'In drafting') progress = 50

        const hues = [220, 332, 168, 45, 280, 195]
        const clientName = c.client_name || c.profiles?.name || 'Verified Client'

        return {
          id: short,
          rawId: c.id,
          title: c.title,
          client: clientName,
          initials: clientName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
          hue: hues[idx % hues.length],
          type: c.case_type || 'General Legal Matter',
          court: c.case_location || 'District Court, New Delhi',
          next: hDate,
          status: c.status || 'Pending',
          progress,
          note: c.notes || 'Matter assigned for review and preparation.',
          fee: 'Active Retainer',
          document_url: c.document_url,
          hearing_date: c.hearing_date,
          created_at: c.created_at,
          description: c.description,
        }
      })

      setMatters(formatted)
      if (!selectedMatterId || !formatted.some(m => m.id === selectedMatterId)) {
        setSelectedMatterId(formatted[0].id)
      }
    } else {
      // Fallback default matters
      setMatters(DEFAULT_MATTERS)
      setSelectedMatterId(DEFAULT_MATTERS[0].id)
    }

    setLoading(false)
  }

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  // ─── Interactive actions ──────────────────────────────────────────────────

  const handleToggleAccepting = () => {
    const next = !acceptingMatters
    setAcceptingMatters(next)
    showToast(
      next ? 'Accepting new matters' : 'New matter intake paused',
      next
        ? 'Your profile is now visible to suitable client briefs.'
        : 'You will not receive new client matches until you resume intake.'
    )
  }

  const handleUpdateStatus = async (matter: MatterItem, newStatus: string) => {
    try {
      if (matter.rawId && !matter.rawId.startsWith('mock-')) {
        await authFetch(`/api/cases/${matter.rawId}`, {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus }),
        })
      }
      setMatters(prev =>
        prev.map(m => (m.id === matter.id ? { ...m, status: newStatus as any } : m))
      )
      showToast('Status updated', `${matter.title} is now marked as ${newStatus}.`, 'good')
    } catch (e) {
      console.error('Status update failed:', e)
    }
  }

  const handleSaveHearing = async (matter: MatterItem) => {
    const dateVal = hearingInputs[matter.id]
    if (!dateVal) {
      showToast('Select a date', 'Please pick a hearing date and time before saving.')
      return
    }

    try {
      const iso = new Date(dateVal).toISOString()
      if (matter.rawId && !matter.rawId.startsWith('mock-')) {
        await authFetch(`/api/cases/${matter.rawId}`, {
          method: 'PUT',
          body: JSON.stringify({
            hearing_date: iso,
            status: 'Hearing scheduled',
          }),
        })
        await authFetch('/api/hearings', {
          method: 'POST',
          body: JSON.stringify({
            case_id: matter.rawId,
            hearing_date: iso,
            created_by: user?.id,
          }),
        })
      }

      const formattedDate = new Date(dateVal).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      setMatters(prev =>
        prev.map(m =>
          m.id === matter.id
            ? { ...m, next: formattedDate, status: 'Hearing scheduled', hearing_date: iso }
            : m
        )
      )
      setHearingInputs(p => ({ ...p, [matter.id]: '' }))
      showToast('Hearing scheduled', `Court appearance listed for ${formattedDate}.`, 'good')
    } catch (e) {
      console.error('Schedule hearing error:', e)
    }
  }

  const handleSaveNote = async (matter: MatterItem) => {
    const note = noteInputs[matter.id]
    if (!note || !note.trim()) return

    try {
      if (matter.rawId && !matter.rawId.startsWith('mock-')) {
        await authFetch(`/api/cases/${matter.rawId}`, {
          method: 'PUT',
          body: JSON.stringify({ notes: note.trim() }),
        })
      }
      setMatters(prev =>
        prev.map(m => (m.id === matter.id ? { ...m, note: note.trim() } : m))
      )
      setNoteInputs(p => ({ ...p, [matter.id]: '' }))
      showToast('Client note saved', 'The case note has been updated and shared with the client.', 'good')
    } catch (e) {
      console.error('Save note error:', e)
    }
  }

  const handleGenerateDraft = () => {
    setIsGeneratingDraft(true)
    const tpl = DRAFT_TEMPLATES.find(t => t.id === selectedTemplateId) || DRAFT_TEMPLATES[0]
    const mtr = matters.find(m => m.id === draftMatterId) || matters[0]

    setTimeout(() => {
      const generated = generateLegalDraft(tpl, mtr, draftDirections)
      setDraftText(generated)
      setIsGeneratingDraft(false)
      setDraftSavedToast(false)
      showToast('Draft generated', 'The case-aware draft is ready for your legal review.')
    }, 650)
  }

  const handleCopyDraft = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(draftText)
        showToast('Draft copied', 'The working text is copied to your clipboard.')
      }
    } catch {
      showToast('Copy unavailable', 'Select the text manually to copy.')
    }
  }

  const handleExportDraft = () => {
    const blob = new Blob([draftText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `LegalNexus_Draft_${selectedTemplateId}_${draftMatterId}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast('Draft exported', 'A text copy of the legal draft has been downloaded.')
  }

  const handleSaveDraftToCase = async () => {
    const mtr = matters.find(m => m.id === draftMatterId)
    if (mtr && mtr.rawId && !mtr.rawId.startsWith('mock-')) {
      await authFetch(`/api/cases/${mtr.rawId}`, {
        method: 'PUT',
        body: JSON.stringify({ notes: `[Draft Generated]: ${draftText.slice(0, 300)}...` }),
      })
    }
    setDraftSavedToast(true)
    showToast('Draft saved to case file', `The working draft has been preserved in ${mtr?.client || 'client'}'s matter file.`, 'good')
  }

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) {
      setProfileMessage('❌ Full name is required.')
      return
    }
    setSavingProfile(true)
    setProfileMessage('')

    try {
      const payload = {
        name: profileForm.name,
        specialty: profileForm.specialty,
        experience_years: profileForm.experience_years ? Number(profileForm.experience_years) : null,
        phone: profileForm.phone,
        email: user?.email,
        bio: profileForm.bio,
        profile_image: profileForm.profile_image || null,
        user_id: user?.id,
      }

      const res = await authFetch('/api/lawyers', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setProfileMessage('✅ Profile updated successfully!')
        showToast('Profile updated', 'Your chamber and advocate profile is live.', 'good')
        setTimeout(() => {
          setProfileModalOpen(false)
          setProfileMessage('')
        }, 1500)
      } else {
        setProfileMessage('❌ Failed to update profile. Please try again.')
      }
    } catch (e: any) {
      setProfileMessage('❌ Error: ' + e.message)
    } finally {
      setSavingProfile(false)
    }
  }

  // Active selected matter
  const selectedMatter = useMemo(() => {
    return matters.find(m => m.id === selectedMatterId) || matters[0]
  }, [matters, selectedMatterId])

  // Filtered matters for "My matters" tab
  const filteredMatters = useMemo(() => {
    return matters.filter(m => {
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter
      const matchesSearch = [m.title, m.client, m.type, m.court, m.id]
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [matters, statusFilter, searchQuery])

  // Advocate display name
  const advocateName = profile?.name || user?.user_metadata?.full_name || 'Adv. Priya Narayanan'
  const advocateFirst = advocateName.replace(/^Adv\.?\s*/i, '').split(' ')[0] || 'Counsel'
  const advocateInitials = advocateName
    .replace(/^Adv\.?\s*/i, '')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'PN'

  // Hearing list items
  const upcomingHearings = useMemo(() => {
    return matters.filter(m => m.status === 'Hearing scheduled' || m.status === 'Order reserved')
  }, [matters])

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col md:flex-row antialiased selection:bg-accent/20">
      
      {/* ── Floating Toast Alert ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-line bg-cardsolid px-4 py-3 shadow-2xl backdrop-blur-xl anim-rise max-w-sm">
          <span
            className={`grid size-8 shrink-0 place-items-center rounded-xl text-sm ${
              toast.tone === 'good' ? 'bg-good/20 text-good' : 'bg-accentsoft text-accent'
            }`}
          >
            {toast.tone === 'good' ? '✓' : 'ℹ'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.82rem] font-bold text-inkstrong">{toast.title}</p>
            <p className="mt-0.5 text-[0.73rem] text-muted leading-tight">{toast.body}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-faint hover:text-ink text-xs font-bold px-1.5 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Document Viewer Modal ── */}
      {docModalItem && (
        <DocumentViewerModal
          item={docModalItem}
          onClose={() => setDocModalItem(null)}
          onToast={showToast}
          onDocUpdated={newUrl => {
            setMatters(prev =>
              prev.map(m => (m.id === docModalItem.id ? { ...m, document_url: newUrl } : m))
            )
          }}
        />
      )}

      {/* ── Left Sidebar Navigation (`Pb`) ── */}
      <aside className="sticky top-0 z-40 flex w-full md:h-screen md:w-64 shrink-0 flex-col justify-between border-b md:border-b-0 md:border-r border-line bg-cardsolid/95 p-4 backdrop-blur-xl">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-between px-2 pt-1">
            <button
              onClick={() => setView('overview')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-[#2a3f9e] text-white shadow-[0_8px_22px_-11px_var(--glow-a)]">
                <ScaleIcon className="size-[17px]" />
                <span className="absolute -inset-px rounded-xl ring-1 ring-inset ring-white/25" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-[1.06rem] font-semibold tracking-tight text-inkstrong">
                  LegalNexus
                </span>
                <span className="eyebrow mt-1 text-[0.48rem] text-gold tracking-widest uppercase">
                  Advocate Portal
                </span>
              </span>
            </button>
          </div>

          {/* Vertical Navigation Tabs */}
          <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
            <p className="hidden md:block px-3 pb-1 text-[0.62rem] font-mono uppercase tracking-[0.14em] text-faint">
              Workspace Menu
            </p>
            {NAV_TABS.map(tab => {
              const Icon = tab.icon
              const isActive = view === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id as any)}
                  className={`flex shrink-0 md:w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[0.82rem] font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-accentsoft text-accent border border-accent/30 shadow-xs'
                      : 'text-muted hover:bg-card hover:text-ink border border-transparent'
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="hidden md:block border-t border-line pt-3 px-2">
          <p className="text-[0.65rem] font-mono text-faint flex items-center gap-1.5">
            <ShieldLockIcon className="size-3 text-good" /> Bar Council Verified
          </p>
        </div>
      </aside>

      {/* ── Main Content Wrapper ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* ── Top-Right Controls Bar ── */}
        <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-xl">
          <div className="site-shell flex h-16 items-center justify-end gap-2.5 sm:gap-3">
            {/* Intake toggle switch */}
            <button
              onClick={handleToggleAccepting}
              title={acceptingMatters ? 'Accepting new client matters' : 'Matter intake is paused'}
              className={`hidden sm:inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.75rem] font-semibold transition-all duration-300 cursor-pointer ${
                acceptingMatters
                  ? 'border-good/30 bg-good/10 text-good'
                  : 'border-line bg-card text-muted hover:border-line2'
              }`}
            >
              <span
                className={`size-2 rounded-full ${
                  acceptingMatters ? 'bg-good anim-pulse' : 'bg-faint'
                }`}
              />
              <span>{acceptingMatters ? 'Accepting matters' : 'Intake paused'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title="Toggle theme"
              className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-line bg-card text-xs font-medium text-muted transition-all hover:border-accent hover:text-accent cursor-pointer"
            >
              {theme === 'midnight' ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
              <span className="hidden sm:inline">Theme</span>
            </button>

            {/* Notifications Button */}
            <button
              onClick={() =>
                showToast('Court diary up to date', 'Next appearance: Sharma Traders v. Anand Enterprises (Saket Court).')
              }
              aria-label="Notifications"
              title="Notifications"
              className="relative inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-line bg-card text-xs font-medium text-muted transition-all hover:border-accent hover:text-accent cursor-pointer"
            >
              <BellIcon className="size-4" />
              <span className="hidden sm:inline">Alerts</span>
              <span className="size-1.5 rounded-full bg-gold" />
            </button>

            {/* Advocate Account Dropdown */}
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountMenuOpen(prev => !prev)}
                className="flex items-center gap-2.5 rounded-xl border border-line bg-card p-1.5 pl-2 pr-2.5 transition hover:border-line2 hover:bg-card2 cursor-pointer"
              >
                {profile?.profile_image ? (
                  <img
                    src={profile.profile_image}
                    alt={advocateName}
                    className="size-7 rounded-lg object-cover ring-1 ring-white/20"
                  />
                ) : (
                  <div className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-accent to-[#2a3f9e] font-mono text-xs font-bold text-white shadow-xs">
                    {advocateInitials}
                  </div>
                )}
                <div className="hidden text-left sm:block">
                  <p className="text-[0.78rem] font-semibold leading-tight text-ink">{advocateName}</p>
                  <span className="block text-[0.63rem] text-gold font-medium">Advocate · Bar Council</span>
                </div>
                <ChevronDownIcon
                  className={`size-3.5 text-faint transition-transform ${
                    accountMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {accountMenuOpen && (
                <div className="anim-rise absolute right-0 top-[calc(100%+0.6rem)] z-50 w-60 rounded-2xl border border-line bg-cardsolid p-1.5 shadow-[var(--shadow)]">
                  <div className="border-b border-line px-3 py-2.5">
                    <p className="text-[0.8rem] font-semibold text-ink">{advocateName}</p>
                    <p className="truncate text-[0.68rem] text-muted">{user?.email || profile?.email || ''}</p>
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accentsoft px-2 py-0.5 text-[0.62rem] font-semibold text-accent">
                      ✓ Bar Council Verified
                    </span>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileModalOpen(true)
                        setAccountMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.78rem] text-muted transition hover:bg-card hover:text-ink cursor-pointer text-left"
                    >
                      <span>⚖️</span> Chamber & Profile Settings
                    </button>
                    <button
                      onClick={() => {
                        setView('matters')
                        setAccountMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.78rem] text-muted transition hover:bg-card hover:text-ink cursor-pointer text-left"
                    >
                      <span>📋</span> My Matters ({matters.length})
                    </button>
                    <button
                      onClick={() => {
                        setView('drafts')
                        setAccountMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.78rem] text-muted transition hover:bg-card hover:text-ink cursor-pointer text-left"
                    >
                      <span>✍️</span> Draft Studio
                    </button>
                    <button
                      onClick={() => {
                        setView('hearings')
                        setAccountMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.78rem] text-muted transition hover:bg-card hover:text-ink cursor-pointer text-left"
                    >
                      <span>📅</span> Hearing Planner
                    </button>
                  </div>
                  <div className="border-t border-line pt-1">
                    <button
                      onClick={async () => {
                        await signOut()
                        navigate('/auth')
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.78rem] text-red-400 transition hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                    >
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 py-7 sm:py-10">
        <div className="site-shell space-y-8">
          
          {/* ═══════════════════════════════════════════════════════════════════
              VIEW 1: OVERVIEW (`nv`)
          ══════════════════════════════════════════════════════════════════════ */}
          {view === 'overview' && (
            <div className="space-y-7 anim-rise">
              
              {/* Hero Banner (`ev`) */}
              <section className="relative overflow-hidden rounded-3xl border border-line bg-cardsolid px-6 py-7 shadow-[var(--shadow)] sm:px-8 sm:py-8">
                <div aria-hidden className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
                <div
                  aria-hidden
                  className="absolute -right-28 -top-28 size-80 rounded-full bg-[radial-gradient(circle,var(--glow-a),transparent_65%)] opacity-80 blur-xl anim-drift pointer-events-none"
                />
                
                <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <span className="eyebrow flex items-center gap-2 text-gold">
                      <span className="h-px w-6 bg-gold/60" /> LegalNexus · Advocate workspace
                    </span>
                    <h1 className="mt-4 text-[clamp(2rem,4.3vw,3.35rem)] font-display font-bold leading-[1.02] text-inkstrong">
                      Your practice, in clear view.
                    </h1>
                    <p className="mt-3 max-w-xl text-[0.9rem] leading-relaxed text-muted">
                      Good morning, {advocateFirst}. One hearing is scheduled, two client actions need a reply, and a legal notice is ready to draft.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <ActionButton onClick={() => setView('drafts')} size="lg">
                      <PenToolIcon className="size-4" /> Open Draft Studio
                    </ActionButton>
                    <ActionButton onClick={() => setView('hearings')} size="lg" variant="outline">
                      <CalendarIcon className="size-4" /> View Diary
                    </ActionButton>
                  </div>
                </div>

                {/* 4-Stat Strip */}
                <div className="relative mt-8 grid grid-cols-2 divide-x divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card/70 sm:grid-cols-4 sm:divide-y-0">
                  {[
                    { value: `${matters.length}`, label: 'Assigned matters', tone: 'text-inkstrong' },
                    { value: '2', label: 'Client replies due', tone: 'text-gold' },
                    { value: '1', label: 'Hearing this week', tone: 'text-accent' },
                    {
                      value: acceptingMatters ? 'Live' : 'Paused',
                      label: 'New matters',
                      tone: acceptingMatters ? 'text-good' : 'text-faint',
                    },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 sm:px-5 sm:py-4">
                      <p className={`font-display text-2xl font-bold leading-none ${stat.tone}`}>{stat.value}</p>
                      <p className="mt-1.5 text-[0.7rem] text-muted">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Practice Pulse & Agenda Row (`lv` & `tv`) */}
              <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,.85fr)]">
                
                {/* Practice Pulse summary card */}
                <div className="rounded-3xl border border-line bg-card p-5 sm:p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <span className="eyebrow text-accent">Practice pulse</span>
                        <h2 className="mt-2 font-display text-[1.35rem] font-bold text-inkstrong">
                          A focused week ahead
                        </h2>
                      </div>
                      <span className="grid size-10 place-items-center rounded-xl bg-accentsoft text-accent">
                        <SparklesIcon className="size-5" />
                      </span>
                    </div>
                    <p className="mt-3 text-[0.82rem] leading-relaxed text-muted">
                      Your hearings are concentrated on Saket District Court and Mumbai Family Court. All client identity records are Bar Council verified and cryptographically stored.
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4 text-center">
                    <div>
                      <p className="font-mono text-lg font-bold text-inkstrong">100%</p>
                      <p className="text-[0.66rem] text-faint uppercase mt-0.5">Verified filings</p>
                    </div>
                    <div>
                      <p className="font-mono text-lg font-bold text-good">24h</p>
                      <p className="text-[0.66rem] text-faint uppercase mt-0.5">Avg turnaround</p>
                    </div>
                    <div>
                      <p className="font-mono text-lg font-bold text-gold">4.9 ★</p>
                      <p className="text-[0.66rem] text-faint uppercase mt-0.5">Client rating</p>
                    </div>
                  </div>
                </div>

                {/* Today's Agenda timeline (`tv`) */}
                <div className="rounded-3xl border border-line bg-cardsolid p-5 sm:p-6 shadow-[var(--shadow)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="eyebrow text-gold">Today's schedule</span>
                      <h3 className="mt-1 font-display text-[1.1rem] font-bold text-inkstrong">
                        Court & Consultation Diary
                      </h3>
                    </div>
                    <Badge tone="accent">March 2026</Badge>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      {
                        time: '10:30',
                        title: 'Evidence hearing',
                        detail: 'Sharma Traders v. Anand Enterprises (Saket Court)',
                        tone: 'text-gold',
                        active: true,
                      },
                      {
                        time: '12:15',
                        title: 'Client consultation',
                        detail: 'Rohan Kapoor - maintenance document checklist',
                        tone: 'text-accent',
                        active: false,
                      },
                      {
                        time: '15:00',
                        title: 'Draft deadline',
                        detail: 'Nova Retail legal notice review',
                        tone: 'text-good',
                        active: false,
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 rounded-2xl border p-3 transition ${
                          item.active
                            ? 'border-accent/40 bg-accentsoft/30'
                            : 'border-line bg-card/60'
                        }`}
                      >
                        <span className="font-mono text-[0.75rem] font-bold text-faint mt-0.5 w-12 shrink-0">
                          {item.time}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[0.82rem] font-bold ${item.tone}`}>{item.title}</p>
                          <p className="text-[0.72rem] text-muted truncate mt-0.5">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Matters Overview: Split view (`yx` + `sv`) */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="eyebrow text-accent">Active caseload</span>
                    <h2 className="mt-1 font-display text-[1.4rem] font-bold text-inkstrong">
                      Recent Assigned Matters
                    </h2>
                  </div>
                  <ActionButton onClick={() => setView('matters')} variant="outline" size="sm">
                    View all {matters.length} matters →
                  </ActionButton>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,.85fr)]">
                  
                  {/* Left Column: Matter Cards List (`yx`) */}
                  <div className="space-y-3">
                    {matters.slice(0, 4).map(matter => {
                      const isSelected = selectedMatter.id === matter.id
                      return (
                        <button
                          key={matter.id}
                          onClick={() => setSelectedMatterId(matter.id)}
                          className={`group w-full rounded-2xl border p-4 text-left transition-all duration-300 cursor-pointer ${
                            isSelected
                              ? 'border-accent bg-accentsoft/40 shadow-[0_10px_26px_-20px_var(--glow-a)]'
                              : 'border-line bg-card hover:border-line2 hover:bg-card2'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <AvatarInitials
                              initials={matter.initials}
                              hue={matter.hue}
                              size={44}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-[0.63rem] uppercase tracking-wider text-faint">
                                  {matter.id}
                                </span>
                                <StatusBadge status={matter.status} />
                              </div>
                              <h4 className="mt-1 truncate text-[0.88rem] font-bold text-inkstrong">
                                {matter.title}
                              </h4>
                              <p className="mt-0.5 truncate text-[0.73rem] text-muted">
                                {matter.client} · {matter.type}
                              </p>
                              
                              {/* Progress bar */}
                              <div className="mt-3 h-1 overflow-hidden rounded-full bg-card2">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-accent to-gold transition-all duration-700"
                                  style={{ width: `${matter.progress}%` }}
                                />
                              </div>
                              <div className="mt-2 flex items-center justify-between text-[0.68rem] text-faint">
                                <span className="flex items-center gap-1.5 truncate">
                                  <CalendarIcon className="size-3 text-gold" /> {matter.next}
                                </span>
                                <span className="font-mono">{matter.progress}%</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Right Column: Matter File Detail Pane (`sv`) */}
                  <div className="rounded-3xl border border-line bg-cardsolid p-5 sm:p-6 shadow-[var(--shadow)] flex flex-col justify-between">
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <span className="eyebrow text-accent">Matter file</span>
                          <h3 className="mt-2 font-display text-[1.3rem] font-bold leading-snug text-inkstrong">
                            {selectedMatter.title}
                          </h3>
                          <p className="mt-1 flex items-center gap-1.5 text-[0.76rem] text-muted">
                            <PinIcon className="size-3.5 text-gold" /> {selectedMatter.court}
                          </p>
                        </div>
                        <StatusBadge status={selectedMatter.status} />
                      </div>

                      {/* 3 Detail Badges */}
                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="rounded-2xl border border-line bg-card p-3">
                          <span className="eyebrow text-[0.6rem] text-faint">Next action</span>
                          <p className="mt-1 truncate text-[0.78rem] font-bold text-gold">
                            {selectedMatter.next}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-line bg-card p-3">
                          <span className="eyebrow text-[0.6rem] text-faint">Client</span>
                          <p className="mt-1 truncate text-[0.78rem] font-bold text-ink">
                            {selectedMatter.client}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-line bg-card p-3">
                          <span className="eyebrow text-[0.6rem] text-faint">Fee status</span>
                          <p className="mt-1 truncate text-[0.78rem] font-bold text-good">
                            {selectedMatter.fee}
                          </p>
                        </div>
                      </div>

                      {/* Current Note Box */}
                      {selectedMatter.note && (
                        <div className="rounded-2xl border border-gold/25 bg-goldsoft/50 p-4">
                          <p className="eyebrow text-[0.65rem] text-gold font-bold">Current Case Memo</p>
                          <p className="mt-1 text-[0.78rem] text-ink leading-relaxed">
                            {selectedMatter.note}
                          </p>
                        </div>
                      )}

                      {/* Quick Interactive Actions */}
                      <div className="space-y-3 rounded-2xl border border-line bg-card/60 p-4">
                        <p className="eyebrow text-[0.65rem] text-faint uppercase font-bold">
                          Advocate Quick Actions
                        </p>

                        {/* Status Change dropdown */}
                        <div className="flex items-center gap-2">
                          <span className="text-[0.74rem] text-muted shrink-0 w-24">Set Status:</span>
                          <select
                            value={selectedMatter.status}
                            onChange={e => handleUpdateStatus(selectedMatter, e.target.value)}
                            className="flex-1 rounded-xl border border-line bg-card2 px-3 py-1.5 text-[0.76rem] font-medium text-ink outline-none cursor-pointer focus:border-accent"
                          >
                            {['Pending', 'In progress', 'Hearing scheduled', 'Order reserved', 'Resolved', 'Closed'].map(st => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Schedule Hearing Picker */}
                        <div className="flex items-center gap-2">
                          <span className="text-[0.74rem] text-muted shrink-0 w-24">Hearing date:</span>
                          <input
                            type="datetime-local"
                            value={hearingInputs[selectedMatter.id] || ''}
                            onChange={e =>
                              setHearingInputs(p => ({ ...p, [selectedMatter.id]: e.target.value }))
                            }
                            className="flex-1 rounded-xl border border-line bg-card2 px-3 py-1.5 text-[0.76rem] text-ink outline-none focus:border-accent"
                          />
                          <button
                            onClick={() => handleSaveHearing(selectedMatter)}
                            className="rounded-xl bg-accent px-3 py-1.5 text-[0.74rem] font-bold text-white hover:brightness-110 cursor-pointer shrink-0"
                          >
                            Set
                          </button>
                        </div>

                        {/* Note for client */}
                        <div className="flex items-center gap-2">
                          <span className="text-[0.74rem] text-muted shrink-0 w-24">Client Note:</span>
                          <input
                            type="text"
                            placeholder="Add note for client..."
                            value={noteInputs[selectedMatter.id] || ''}
                            onChange={e =>
                              setNoteInputs(p => ({ ...p, [selectedMatter.id]: e.target.value }))
                            }
                            className="flex-1 rounded-xl border border-line bg-card2 px-3 py-1.5 text-[0.76rem] text-ink outline-none focus:border-accent"
                          />
                          <button
                            onClick={() => handleSaveNote(selectedMatter)}
                            className="rounded-xl bg-gold px-3 py-1.5 text-[0.74rem] font-bold text-goldink hover:brightness-110 cursor-pointer shrink-0"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-line">
                      <ActionButton
                        onClick={() => {
                          setDraftMatterId(selectedMatter.id)
                          setView('drafts')
                        }}
                        className="flex-1"
                        size="sm"
                      >
                        <PenToolIcon className="size-3.5" /> Draft in Studio
                      </ActionButton>

                      <ActionButton
                        onClick={() => {
                          setDocModalItem({
                            id: selectedMatter.rawId || selectedMatter.id,
                            shortId: selectedMatter.id,
                            title: selectedMatter.title,
                            type: selectedMatter.type,
                            stage: selectedMatter.status,
                            status: selectedMatter.status,
                            progress: selectedMatter.progress,
                            court: selectedMatter.court,
                            next: selectedMatter.next,
                            advocate: advocateName,
                            last: selectedMatter.note,
                            document_url: selectedMatter.document_url,
                          })
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <DocIcon className="size-3.5" /> Case Document Vault
                      </ActionButton>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              VIEW 2: MY MATTERS (`iv`)
          ══════════════════════════════════════════════════════════════════════ */}
          {view === 'matters' && (
            <div className="space-y-6 anim-rise">
              
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="eyebrow text-accent">Active portfolio</span>
                  <h1 className="mt-3 font-display text-[clamp(2rem,4vw,2.8rem)] font-bold leading-tight text-inkstrong">
                    My Matters & Case Files
                  </h1>
                  <p className="mt-2 text-[0.88rem] text-muted">
                    Search, track stages, update hearing schedules and review client documents.
                  </p>
                </div>
                <ActionButton onClick={() => setView('drafts')} size="md">
                  <PenToolIcon className="size-4" /> Open Draft Studio
                </ActionButton>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col gap-3 rounded-2xl border border-line bg-cardsolid p-4 sm:flex-row sm:items-center sm:justify-between">
                
                {/* Search input */}
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-faint" />
                  <input
                    type="text"
                    placeholder="Search by case title, client, court, or case ID..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-line bg-card2 pl-10 pr-4 py-2 text-[0.82rem] text-ink placeholder:text-faint outline-none focus:border-accent focus:bg-card"
                  />
                </div>

                {/* Filter Pills */}
                <div className="hide-scroll flex items-center gap-1.5 overflow-x-auto">
                  {['All', 'Hearing scheduled', 'In progress', 'Pending', 'Order reserved', 'Resolved'].map(st => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`shrink-0 rounded-full border px-3 py-1 text-[0.74rem] font-semibold transition cursor-pointer ${
                        statusFilter === st
                          ? 'border-accent bg-accent text-accentink shadow-[0_4px_14px_-4px_var(--glow-a)]'
                          : 'border-line bg-card text-muted hover:border-line2 hover:text-ink'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Matters List Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMatters.length === 0 ? (
                  <div className="col-span-full rounded-3xl border border-dashed border-line2 p-12 text-center bg-card/40">
                    <ScaleIcon className="size-10 text-faint mx-auto mb-2 opacity-60" />
                    <p className="font-semibold text-[0.95rem] text-inkstrong">No matters found</p>
                    <p className="mt-1 text-[0.78rem] text-muted">
                      Try adjusting your search query or filter tags.
                    </p>
                  </div>
                ) : (
                  filteredMatters.map(matter => {
                    const isSelected = selectedMatterId === matter.id
                    return (
                      <div
                        key={matter.id}
                        className={`group flex flex-col justify-between rounded-3xl border p-5 transition-all duration-300 ${
                          isSelected
                            ? 'border-accent bg-cardsolid shadow-[0_12px_32px_-16px_var(--glow-a)] ring-1 ring-accent/30'
                            : 'border-line bg-cardsolid hover:border-line2 hover:shadow-lg'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <AvatarInitials
                              initials={matter.initials}
                              hue={matter.hue}
                              size={42}
                            />
                            <StatusBadge status={matter.status} />
                          </div>

                          <span className="font-mono text-[0.62rem] uppercase tracking-wider text-faint mt-3 block">
                            {matter.id}
                          </span>
                          <h3 className="mt-1 font-display text-[1.05rem] font-bold text-inkstrong line-clamp-2">
                            {matter.title}
                          </h3>
                          <p className="mt-1 text-[0.75rem] text-muted font-medium">
                            {matter.client} · {matter.type}
                          </p>
                          <p className="mt-2 flex items-center gap-1.5 text-[0.72rem] text-faint">
                            <PinIcon className="size-3 text-gold shrink-0" /> {matter.court}
                          </p>

                          {matter.note && (
                            <p className="mt-3 line-clamp-2 text-[0.72rem] text-muted bg-card2 p-2.5 rounded-xl border border-line">
                              {matter.note}
                            </p>
                          )}
                        </div>

                        <div className="mt-5 border-t border-line pt-4 space-y-3">
                          <div className="flex items-center justify-between text-[0.72rem]">
                            <span className="text-faint">Next date:</span>
                            <span className="font-semibold text-gold truncate max-w-[140px]">
                              {matter.next}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                setSelectedMatterId(matter.id)
                                setDocModalItem({
                                  id: matter.rawId || matter.id,
                                  shortId: matter.id,
                                  title: matter.title,
                                  type: matter.type,
                                  stage: matter.status,
                                  status: matter.status,
                                  progress: matter.progress,
                                  court: matter.court,
                                  next: matter.next,
                                  advocate: advocateName,
                                  last: matter.note,
                                  document_url: matter.document_url,
                                })
                              }}
                              className="rounded-xl border border-line bg-card2 py-2 text-[0.74rem] font-semibold text-ink hover:border-accent hover:text-accent transition cursor-pointer"
                            >
                              Documents
                            </button>
                            <button
                              onClick={() => {
                                setSelectedMatterId(matter.id)
                                setDraftMatterId(matter.id)
                                setView('drafts')
                              }}
                              className="rounded-xl bg-accent py-2 text-[0.74rem] font-bold text-white shadow hover:brightness-110 transition cursor-pointer"
                            >
                              Draft Studio
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              VIEW 3: DRAFT STUDIO (`rv` + `Pm`)
          ══════════════════════════════════════════════════════════════════════ */}
          {view === 'drafts' && (
            <div className="space-y-6 anim-rise">
              
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="eyebrow text-gold">Advocate drafting workspace</span>
                  <h1 className="mt-3 font-display text-[clamp(2rem,4vw,2.8rem)] font-bold leading-tight text-inkstrong">
                    Draft documents with a head start.
                  </h1>
                  <p className="mt-2 max-w-2xl text-[0.88rem] leading-relaxed text-muted">
                    Start from the facts already in a matter, then take full editorial control. Generated drafts are private, editable and never sent without your approval.
                  </p>
                </div>
                <Badge tone="good">
                  <ShieldLockIcon className="size-3.5 inline mr-1" /> Private to your practice
                </Badge>
              </div>

              <div className="grid items-start gap-6 xl:grid-cols-[minmax(19rem,.72fr)_minmax(0,1.28fr)]">
                
                {/* Left Sidebar: Setup & Template choice */}
                <aside className="space-y-4 xl:sticky xl:top-24">
                  
                  <div className="rounded-3xl border border-line bg-cardsolid p-5 sm:p-6 shadow-[var(--shadow)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="eyebrow text-accent">Draft setup</span>
                        <h2 className="mt-1 font-display text-[1.25rem] font-bold text-inkstrong">
                          Choose your context
                        </h2>
                      </div>
                      <span className="grid size-10 place-items-center rounded-xl bg-accentsoft text-accent">
                        <PenToolIcon className="size-5" />
                      </span>
                    </div>

                    <div className="mt-6 space-y-5">
                      
                      {/* Document Type Dropdown */}
                      <div>
                        <label className="eyebrow text-faint block mb-2">Document type</label>
                        <select
                          value={selectedTemplateId}
                          onChange={e => {
                            setSelectedTemplateId(e.target.value)
                            const tpl = DRAFT_TEMPLATES.find(t => t.id === e.target.value) || DRAFT_TEMPLATES[0]
                            const mtr = matters.find(m => m.id === draftMatterId) || matters[0]
                            setDraftText(generateLegalDraft(tpl, mtr, draftDirections))
                          }}
                          className="w-full rounded-xl border border-line bg-card2 px-3.5 py-2.5 text-[0.85rem] text-ink outline-none cursor-pointer focus:border-accent"
                        >
                          {DRAFT_TEMPLATES.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Matter Dropdown */}
                      <div>
                        <label className="eyebrow text-faint block mb-2">Matter context</label>
                        <select
                          value={draftMatterId}
                          onChange={e => {
                            setDraftMatterId(e.target.value)
                            const tpl = DRAFT_TEMPLATES.find(t => t.id === selectedTemplateId) || DRAFT_TEMPLATES[0]
                            const mtr = matters.find(m => m.id === e.target.value) || matters[0]
                            setDraftText(generateLegalDraft(tpl, mtr, draftDirections))
                          }}
                          className="w-full rounded-xl border border-line bg-card2 px-3.5 py-2.5 text-[0.85rem] text-ink outline-none cursor-pointer focus:border-accent"
                        >
                          {matters.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.client} — {m.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Template Intent Card */}
                      {(() => {
                        const curTpl = DRAFT_TEMPLATES.find(t => t.id === selectedTemplateId) || DRAFT_TEMPLATES[0]
                        return (
                          <div className="rounded-2xl border border-line bg-card p-4">
                            <p className="eyebrow text-faint">Template intent</p>
                            <p className="mt-2 text-[0.78rem] leading-relaxed text-muted">
                              {curTpl.description}
                            </p>
                            <p className="mt-3 flex items-center gap-1.5 text-[0.7rem] text-gold font-medium">
                              <ScaleIcon className="size-3.5" /> {curTpl.court}
                            </p>
                          </div>
                        )
                      })()}

                      {/* Drafting Directions input */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="eyebrow text-faint">Drafting directions</label>
                          <span className="text-[0.68rem] text-faint">Optional</span>
                        </div>
                        <textarea
                          rows={4}
                          value={draftDirections}
                          onChange={e => setDraftDirections(e.target.value)}
                          placeholder="Include facts, remedy period, penalty clauses, citations, or tone that matter to this draft."
                          className="w-full rounded-xl border border-line bg-card2 p-3 text-[0.82rem] text-ink placeholder:text-faint outline-none resize-none leading-relaxed focus:border-accent"
                        />
                      </div>

                      {/* Generate Draft Button */}
                      <button
                        type="button"
                        onClick={handleGenerateDraft}
                        disabled={isGeneratingDraft}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-[0.85rem] font-bold text-white shadow-[0_8px_24px_-10px_var(--glow-a)] hover:brightness-110 transition cursor-pointer disabled:opacity-50"
                      >
                        {isGeneratingDraft ? (
                          <>
                            <span className="size-4 rounded-full border-2 border-white/35 border-t-white animate-spin" />
                            <span>Building draft...</span>
                          </>
                        ) : (
                          <>
                            <PenToolIcon className="size-4" />
                            <span>Generate working draft</span>
                          </>
                        )}
                      </button>

                    </div>
                  </div>

                  {/* Ethical review disclaimer card */}
                  <div className="rounded-3xl border border-gold/25 bg-goldsoft/60 p-5">
                    <ScaleIcon className="size-5 text-gold" />
                    <p className="mt-3 text-[0.85rem] font-bold text-inkstrong">
                      Advocate review stays essential
                    </p>
                    <p className="mt-1.5 text-[0.75rem] leading-relaxed text-muted">
                      Review the facts, jurisdiction, citations, limitation and forum formatting before sending or filing any draft.
                    </p>
                  </div>

                </aside>

                {/* Right Document Editor Workspace */}
                <div className="overflow-hidden rounded-3xl border border-line bg-cardsolid shadow-[var(--shadow)]">
                  
                  {/* Editor Header Bar */}
                  <div className="flex flex-col gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 bg-card">
                    <div>
                      <span className="eyebrow text-accent">Working document</span>
                      <h2 className="mt-1 font-display text-[1.35rem] font-bold text-inkstrong">
                        {DRAFT_TEMPLATES.find(t => t.id === selectedTemplateId)?.name || 'Legal Draft'}
                      </h2>
                      <p className="mt-0.5 text-[0.74rem] text-muted">
                        For {matters.find(m => m.id === draftMatterId)?.client || 'Client'} · {draftMatterId}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <ActionButton size="sm" variant="outline" onClick={handleCopyDraft}>
                        <CopyIcon className="size-3.5" /> Copy
                      </ActionButton>
                      <ActionButton size="sm" variant="outline" onClick={handleExportDraft}>
                        <DownloadIcon className="size-3.5" /> Export (.txt)
                      </ActionButton>
                    </div>
                  </div>

                  {/* Editor Canvas Body */}
                  <div className="p-5 sm:p-7 space-y-4">
                    
                    {/* Status Pill strip */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-good anim-pulse" />
                        <span className="eyebrow text-faint">Secure autosave active</span>
                      </div>
                      <span className="font-mono text-[0.66rem] text-faint">
                        {draftText.length.toLocaleString('en-IN')} characters
                      </span>
                    </div>

                    {/* Editable Monospace Legal Draft Canvas */}
                    <textarea
                      value={draftText}
                      onChange={e => {
                        setDraftText(e.target.value)
                        setDraftSavedToast(false)
                      }}
                      spellCheck={true}
                      className="min-h-[34rem] w-full resize-y rounded-2xl border border-line bg-card p-5 font-mono text-[0.78rem] leading-7 text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-[var(--accent-soft)]"
                    />

                    {/* Bottom Action Footer */}
                    <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="flex items-center gap-2 text-[0.73rem] text-muted">
                        <CheckIcon className="size-3.5 text-good" />
                        {draftSavedToast ? 'Saved to matter files' : 'Edits are kept in this secure session'}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <ActionButton variant="outline" onClick={handleGenerateDraft}>
                          Regenerate
                        </ActionButton>
                        <ActionButton onClick={handleSaveDraftToCase}>
                          <DocIcon className="size-4" /> Save to matter
                        </ActionButton>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              VIEW 4: HEARING PLANNER / COURT DIARY (`cv`)
          ══════════════════════════════════════════════════════════════════════ */}
          {view === 'hearings' && (
            <div className="space-y-6 anim-rise">
              
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="eyebrow text-accent">Court diary</span>
                  <h1 className="mt-3 font-display text-[clamp(2rem,4vw,2.8rem)] font-bold leading-tight text-inkstrong">
                    Plan each hearing with less friction.
                  </h1>
                  <p className="mt-2 max-w-xl text-[0.88rem] leading-relaxed text-muted">
                    Keep court dates, client preparation and filing tasks in one concise, matter-linked schedule.
                  </p>
                </div>
                <ActionButton onClick={() => setView('drafts')}>
                  <PenToolIcon className="size-4" /> Draft for a matter
                </ActionButton>
              </div>

              <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,.9fr)]">
                
                {/* Left: Upcoming Court Dates list */}
                <div className="rounded-3xl border border-line bg-cardsolid p-5 sm:p-7 shadow-[var(--shadow)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="eyebrow text-gold">March 2026</span>
                      <h2 className="mt-1 font-display text-[1.4rem] font-bold text-inkstrong">
                        Upcoming court dates
                      </h2>
                    </div>
                    <span className="grid size-10 place-items-center rounded-xl bg-goldsoft text-gold">
                      <CalendarIcon className="size-5" />
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    {upcomingHearings.length === 0 ? (
                      <p className="text-sm text-muted py-6 text-center">No upcoming hearings scheduled yet.</p>
                    ) : (
                      upcomingHearings.map(matter => (
                        <div
                          key={matter.id}
                          className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-4 sm:flex-row sm:items-center justify-between"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-accentsoft">
                              <span className="font-display text-xl font-bold leading-none text-accent">
                                14
                              </span>
                              <span className="mt-1 font-mono text-[0.58rem] font-bold text-accent">
                                MAR
                              </span>
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-[0.88rem] font-bold text-inkstrong">{matter.title}</p>
                                <StatusBadge status={matter.status} />
                              </div>
                              <p className="mt-1 flex items-center gap-1.5 text-[0.72rem] text-muted">
                                <PinIcon className="size-3 text-gold" /> {matter.court}
                              </p>
                              <p className="mt-2 text-[0.72rem] text-faint">{matter.next}</p>
                            </div>
                          </div>

                          <ActionButton
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              showToast('Hearing prep added', `Checklist and reminder created for ${matter.client}.`)
                            }
                          >
                            Prepare
                          </ActionButton>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right: Hearing Checklist & Reminders */}
                <div className="space-y-4">
                  
                  {/* Hearing Checklist Box */}
                  <div className="rounded-3xl border border-line bg-card p-5 sm:p-6">
                    <span className="eyebrow text-accent">Hearing checklist</span>
                    <h3 className="mt-2 font-display text-[1.3rem] font-bold text-inkstrong">
                      Sharma Traders v. Anand
                    </h3>

                    <div className="mt-5 space-y-3">
                      {[
                        { text: 'Evidence affidavit reviewed', done: true },
                        { text: 'Original invoice bundle packed', done: true },
                        { text: 'Client attendance confirmed', done: false },
                        { text: 'Written submissions printed (3 copies)', done: false },
                      ].map((item, idx) => (
                        <label
                          key={idx}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-card2 p-3 transition hover:border-accent/40"
                        >
                          <input
                            type="checkbox"
                            defaultChecked={item.done}
                            className="size-4 accent-[var(--accent)]"
                          />
                          <span
                            className={`text-[0.78rem] font-medium ${
                              item.done ? 'text-muted line-through' : 'text-ink'
                            }`}
                          >
                            {item.text}
                          </span>
                        </label>
                      ))}
                    </div>

                    <button
                      onClick={() =>
                        showToast('Checklist saved', 'The hearing preparation checklist is updated for this matter.')
                      }
                      className="mt-5 inline-flex items-center gap-1 text-[0.76rem] font-bold text-accent transition hover:text-ink cursor-pointer"
                    >
                      <span>Save checklist</span> →
                    </button>
                  </div>

                  {/* Notification reminder card */}
                  <div className="rounded-3xl border border-line bg-card p-5">
                    <p className="flex items-center gap-2 text-[0.85rem] font-bold text-inkstrong">
                      <BellIcon className="size-4 text-gold" /> One hearing this week
                    </p>
                    <p className="mt-2 text-[0.75rem] leading-relaxed text-muted">
                      The workspace will remind you and the client 48 hours before the Saket District Court listing.
                    </p>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-line bg-bg/85">
        <div className="site-shell flex flex-col items-center justify-between gap-3 py-6 text-center sm:flex-row sm:text-left">
          <p className="text-[0.72rem] text-faint">
            © 2026 LegalNexus · Private advocate workspace
          </p>
          <div className="flex items-center gap-4 text-[0.72rem] text-faint">
            <span className="flex items-center gap-1.5">
              <ShieldLockIcon className="size-3 text-good" /> Privileged workspace
            </span>
            <Link to="/faq" className="hover:text-ink">Support</Link>
            <a href="#top" className="hover:text-ink">Privacy</a>
          </div>
        </div>
      </footer>
      </div>

      {/* ── Chamber & Profile Settings Modal ── */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md anim-rise">
          <div className="relative flex flex-col w-full max-w-lg max-h-[90vh] rounded-3xl border border-line bg-cardsolid shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-card">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-xl bg-accentsoft text-accent">
                  <ScaleIcon className="size-4" />
                </span>
                <h3 className="font-display text-[1.1rem] font-bold text-inkstrong">
                  Advocate Chamber Profile
                </h3>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="grid size-8 place-items-center rounded-xl border border-line text-muted hover:text-ink cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 hide-scroll">
              <div>
                <label className="eyebrow text-faint block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Adv. Priya Narayanan"
                  className="w-full rounded-xl border border-line bg-card2 px-3.5 py-2 text-[0.85rem] text-ink outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="eyebrow text-faint block mb-1.5">Specialization / Practice Area</label>
                <select
                  value={profileForm.specialty}
                  onChange={e => setProfileForm({ ...profileForm, specialty: e.target.value })}
                  className="w-full rounded-xl border border-line bg-card2 px-3.5 py-2 text-[0.85rem] text-ink outline-none focus:border-accent cursor-pointer"
                >
                  <option value="">Select primary practice</option>
                  {[
                    'Criminal Law',
                    'Family & Divorce',
                    'Corporate & Tax',
                    'Property & Real Estate',
                    'Cyber Crime',
                    'Civil & Consumer',
                  ].map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="eyebrow text-faint block mb-1.5">Experience (Years)</label>
                  <input
                    type="number"
                    value={profileForm.experience_years}
                    onChange={e => setProfileForm({ ...profileForm, experience_years: e.target.value })}
                    placeholder="e.g. 12"
                    className="w-full rounded-xl border border-line bg-card2 px-3.5 py-2 text-[0.85rem] text-ink outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="eyebrow text-faint block mb-1.5">Phone</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-line bg-card2 px-3.5 py-2 text-[0.85rem] text-ink outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="eyebrow text-faint block mb-1.5">Chamber Bio & Credentials</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Senior advocate practicing before High Court and District Forums with expertise in commercial arbitration..."
                  className="w-full rounded-xl border border-line bg-card2 p-3 text-[0.82rem] text-ink outline-none resize-none focus:border-accent leading-relaxed"
                />
              </div>

              {profileMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    profileMessage.startsWith('✅') ? 'bg-good/10 text-good border border-good/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}
                >
                  {profileMessage}
                </div>
              )}
            </div>

            <div className="border-t border-line px-6 py-4 bg-card flex items-center justify-end gap-2">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="rounded-xl border border-line px-4 py-2 text-[0.8rem] font-semibold text-muted hover:text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="rounded-xl bg-accent px-5 py-2 text-[0.8rem] font-bold text-white shadow hover:brightness-110 cursor-pointer disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Chamber Profile'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}