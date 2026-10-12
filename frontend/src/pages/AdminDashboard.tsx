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

function UsersIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ActivityIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
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

function PinIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
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

function AlertTriangleIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
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

function PlusIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
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

function MailIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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

function ChevronUpIcon({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  )
}

// ─── Data Types & Initial Constants ──────────────────────────────────────────

export interface AdminCaseItem {
  id: string
  ref: string
  title: string
  description?: string
  area: string
  city: string
  court: string
  clientId: string
  clientName: string
  clientPhone?: string
  clientEmail?: string
  lawyerId: string | null
  lawyerName?: string | null
  status: 'Pending' | 'In Progress' | 'Hearing Scheduled' | 'Resolved' | 'Closed'
  priority: 'High' | 'Normal' | 'Low'
  filed: string
  hearing: string | null
  note: string
  document_url?: string | null
}

export interface AdminLawyerItem {
  id: string
  name: string
  initials: string
  hue: number
  specialization: string
  areas: string[]
  phone: string
  email: string
  city: string
  exp: number
  capacity: number
  available: boolean
  rating?: number
  verified?: boolean
  profile_image?: string | null
}

export interface AdminApplicantItem {
  id: string
  name: string
  initials: string
  hue: number
  specialization: string
  areas: string[]
  phone: string
  email: string
  city: string
  exp: number
  appliedAt: string
  barEnrollment: string
}

export interface AdminClientItem {
  id: string
  name: string
  email: string
  phone: string
  gender?: string
  age?: number | string
  city: string
  joined: string
}

export interface AdminLogItem {
  id: string | number
  at: number
  category: 'assignment' | 'status' | 'hearing' | 'note' | 'lawyer' | 'system'
  title: string
  body: string
  actor?: string
}

const PRACTICE_AREAS = [
  'Criminal Law',
  'Family & Divorce',
  'Corporate Law',
  'Property Law',
  'Cybercrime',
  'Cheque Bounce (S.138 NI Act)',
  'Civil & Consumer',
]

const STATUS_CHIPS: Record<string, { chip: string; dot: string }> = {
  Pending: { chip: 'border-gold/30 bg-goldsoft text-gold', dot: 'bg-gold' },
  'In Progress': { chip: 'border-accent/30 bg-accentsoft text-accent', dot: 'bg-accent' },
  'Hearing Scheduled': { chip: 'border-purple-500/30 bg-purple-500/10 text-purple-400', dot: 'bg-purple-400' },
  Resolved: { chip: 'border-good/30 bg-good/10 text-good', dot: 'bg-good' },
  Closed: { chip: 'border-line bg-card2 text-muted', dot: 'bg-faint' },
}

const CATEGORY_META: Record<string, { cls: string; label: string }> = {
  assignment: { cls: 'text-accent', label: 'Assignments' },
  status: { cls: 'text-purple-400', label: 'Status' },
  hearing: { cls: 'text-gold', label: 'Hearings' },
  note: { cls: 'text-muted', label: 'Notes' },
  lawyer: { cls: 'text-good', label: 'Lawyers' },
  system: { cls: 'text-accent', label: 'System' },
}

const NAV_TABS = [
  { id: 'overview', label: 'Overview', icon: OverviewIcon },
  { id: 'cases', label: 'Cases', icon: DocIcon },
  { id: 'lawyers', label: 'Lawyers', icon: AdvocateIcon },
  { id: 'clients', label: 'Clients', icon: UsersIcon },
  { id: 'activity', label: 'Activity', icon: ActivityIcon },
]

// ─── UI Helpers & Primitives ────────────────────────────────────────────────

function formatRelativeTime(timestamp: number) {
  const diffMinutes = Math.floor((Date.now() - timestamp) / (60 * 1000))
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

function parseHearingBadge(dateStr: string | null) {
  if (!dateStr) return { day: '—', month: 'TBD' }
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return { day: '—', month: 'TBD' }
  return {
    day: d.getDate(),
    month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
  }
}

function Badge({
  children,
  tone = 'default',
  className = '',
}: {
  children: React.ReactNode
  tone?: 'gold' | 'good' | 'warn' | 'faint' | 'accent' | 'default'
  className?: string
}) {
  const tones = {
    gold: 'border-gold/30 bg-goldsoft text-gold',
    good: 'border-good/30 bg-good/10 text-good',
    warn: 'border-red-500/30 bg-red-500/10 text-red-400',
    faint: 'border-line bg-card2 text-muted',
    accent: 'border-accent/30 bg-accentsoft text-accent',
    default: 'border-line bg-card text-ink',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.68rem] font-bold tracking-wide uppercase ${
        tones[tone] || tones.default
      } ${className}`}
    >
      {children}
    </span>
  )
}

function HighPriorityBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[0.62rem] font-bold text-red-400 uppercase tracking-wide">
      <AlertTriangleIcon className="size-2.5" /> High
    </span>
  )
}

function StatusPill({ status }: { status: string }) {
  const meta = STATUS_CHIPS[status] || STATUS_CHIPS['Pending']
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold ${meta.chip}`}>
      <span className={`size-1.5 rounded-full ${meta.dot}`} />
      {status}
    </span>
  )
}

function AvatarInitials({
  initials,
  hue = 42,
  size = 36,
  photoUrl,
}: {
  initials: string
  hue?: number
  size?: number
  photoUrl?: string | null
}) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={initials}
        className="rounded-2xl object-cover ring-1 ring-white/15 shrink-0"
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
        fontSize: size * 0.35,
        background: `linear-gradient(145deg, hsl(${hue} 65% 48%), hsl(${hue + 32} 55% 32%))`,
      }}
    >
      <span
        className="absolute inset-0 opacity-40"
        style={{ background: 'radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,.45), transparent 60%)' }}
      />
      <span className="relative drop-shadow">{initials}</span>
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
    sm: 'px-3 py-1.5 text-[0.74rem]',
    md: 'px-4 py-2 text-[0.82rem]',
    lg: 'px-5 py-2.5 text-[0.88rem]',
  }
  const variantClasses = {
    primary: 'bg-accent text-accentink shadow-[0_8px_24px_-10px_var(--glow-a)] hover:brightness-110 font-semibold',
    outline: 'border border-line bg-card text-ink hover:border-gold hover:text-gold',
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

function SectionHeading({
  eyebrow,
  title,
  sub,
  tone = 'accent',
  right,
}: {
  eyebrow: string
  title: string
  sub?: string
  tone?: 'accent' | 'gold' | 'good'
  right?: React.ReactNode
}) {
  const toneClasses = {
    accent: 'text-accent',
    gold: 'text-gold',
    good: 'text-good',
  }
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className={`eyebrow ${toneClasses[tone]}`}>{eyebrow}</span>
        <h1 className="mt-2 font-display text-[clamp(1.8rem,3.8vw,2.6rem)] font-bold leading-tight text-inkstrong">
          {title}
        </h1>
        {sub && <p className="mt-2 max-w-2xl text-[0.88rem] leading-relaxed text-muted">{sub}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}

// ─── Main Admin Dashboard Component ──────────────────────────────────────────

export default function AdminDashboard() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  // Navigation tabs
  const [view, setView] = useState<'overview' | 'cases' | 'lawyers' | 'clients' | 'activity'>('overview')

  // Real Database state
  const [cases, setCases] = useState<AdminCaseItem[]>([])
  const [lawyers, setLawyers] = useState<AdminLawyerItem[]>([])
  const [clients, setClients] = useState<AdminClientItem[]>([])
  const [applicants, setApplicants] = useState<AdminApplicantItem[]>([
    {
      id: 'app-1',
      name: 'Adv. Kavya Iyer',
      initials: 'KI',
      hue: 280,
      specialization: 'Cybercrime & Corporate Compliance',
      areas: ['Cybercrime', 'Corporate Law'],
      phone: '+91 98234 11002',
      email: 'kavya.iyer@legalnexus.in',
      city: 'Nagpur',
      exp: 7,
      appliedAt: '2 hours ago',
      barEnrollment: 'MAH/5821/2019',
    },
    {
      id: 'app-2',
      name: 'Adv. Sameer Deshmukh',
      initials: 'SD',
      hue: 150,
      specialization: 'Civil Litigation & RERA',
      areas: ['Property Law', 'Civil & Consumer'],
      phone: '+91 94221 88410',
      email: 'sameer.d@chambers.in',
      city: 'Pune',
      exp: 11,
      appliedAt: 'Yesterday',
      barEnrollment: 'MAH/1942/2015',
    },
  ])
  const [activityLog, setActivityLog] = useState<AdminLogItem[]>([
    {
      id: 1,
      at: Date.now() - 8 * 60 * 1000,
      category: 'system',
      title: 'Cause-list sync completed',
      body: 'Hearing dates reconciled across all tracked high courts and district forums.',
    },
    {
      id: 2,
      at: Date.now() - 34 * 60 * 1000,
      category: 'assignment',
      title: 'Assigned to Adv. Rajesh Sharma',
      body: 'Matter "Anticipatory bail application (Crime No. 412/26)".',
    },
    {
      id: 3,
      at: Date.now() - 95 * 60 * 1000,
      category: 'lawyer',
      title: 'New advocate application',
      body: 'Adv. Kavya Iyer submitted Bar Council verification credentials.',
    },
    {
      id: 4,
      at: Date.now() - 180 * 60 * 1000,
      category: 'status',
      title: 'Status changed to Hearing Scheduled',
      body: 'Matter "UPI payment fraud of ₹62,000".',
    },
  ])
  const [loading, setLoading] = useState(true)

  // Cases filter & search states
  const [caseSearch, setCaseSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [areaFilter, setAreaFilter] = useState('')
  const [lawyerFilter, setLawyerFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [sortOrder, setSortOrder] = useState<'newest' | 'priority' | 'hearing'>('newest')
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<string>>(new Set())
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(12)

  // Quick edit inputs per expanded case
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({})
  const [hearingInputs, setHearingInputs] = useState<Record<string, string>>({})
  const [priorityInputs, setPriorityInputs] = useState<Record<string, string>>({})
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Modals & toasts
  const [docModalItem, setDocModalItem] = useState<CaseDocModalItem | null>(null)
  const [addLawyerOpen, setAddLawyerOpen] = useState(false)
  const [newLawyerForm, setNewLawyerForm] = useState({
    name: '',
    specialty: 'Criminal Law',
    experience_years: '8',
    phone: '',
    email: '',
    city: 'Nagpur',
  })
  const [toast, setToast] = useState<{ title: string; body: string; tone?: 'info' | 'good' } | null>(null)
  const toastTimeoutRef = useRef<any>(null)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)

  const showToast = (title: string, body: string, tone: 'info' | 'good' = 'info') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToast({ title, body, tone })
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3800)
  }

  const [logCategoryFilter, setLogCategoryFilter] = useState<string>('all')
  const [syncingLogs, setSyncingLogs] = useState(false)

  const fetchLiveActivity = async (silent = true) => {
    try {
      if (!silent) setSyncingLogs(true)
      const res = await authFetch('/api/activity')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setActivityLog(data)
        }
      }
    } catch (e) {
      // Ignore background poll errors
    } finally {
      if (!silent) setSyncingLogs(false)
    }
  }

  const logActivity = (category: AdminLogItem['category'], title: string, body: string) => {
    const optimistic: AdminLogItem = {
      id: Date.now() + Math.random(),
      at: Date.now(),
      category,
      title,
      body,
      actor: user?.user_metadata?.full_name || user?.email || 'Admin',
    }
    setActivityLog(prev => [optimistic, ...prev])
    authFetch('/api/activity', {
      method: 'POST',
      body: JSON.stringify({ category, title, body }),
    })
      .then(() => fetchLiveActivity(true))
      .catch(() => {})
  }

  const filteredActivityLogs = useMemo(() => {
    if (logCategoryFilter === 'all') return activityLog
    return activityLog.filter(item => item.category === logCategoryFilter)
  }, [activityLog, logCategoryFilter])

  const exportAuditLogsExcel = () => {
    const rows = filteredActivityLogs.length > 0 ? filteredActivityLogs : activityLog
    const escXml = (s: any) =>
      String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

    const xmlRows = rows
      .map((item, idx) => {
        const dt = new Date(item.at).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'medium',
        })
        return `<Row>
          <Cell><Data ss:Type="Number">${idx + 1}</Data></Cell>
          <Cell><Data ss:Type="String">${escXml(dt)}</Data></Cell>
          <Cell><Data ss:Type="String">${escXml(item.category.toUpperCase())}</Data></Cell>
          <Cell><Data ss:Type="String">${escXml(item.title)}</Data></Cell>
          <Cell><Data ss:Type="String">${escXml(item.body)}</Data></Cell>
          <Cell><Data ss:Type="String">${escXml(item.actor || 'Admin / System')}</Data></Cell>
        </Row>`
      })
      .join('\n')

    const workbookXml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#13203B" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Administrative Audit Logs">
  <Table>
   <Column ss:Width="50"/>
   <Column ss:Width="150"/>
   <Column ss:Width="100"/>
   <Column ss:Width="240"/>
   <Column ss:Width="360"/>
   <Column ss:Width="140"/>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">#</Data></Cell>
    <Cell><Data ss:Type="String">Timestamp (IST)</Data></Cell>
    <Cell><Data ss:Type="String">Category</Data></Cell>
    <Cell><Data ss:Type="String">Activity / Event Title</Data></Cell>
    <Cell><Data ss:Type="String">Details &amp; Description</Data></Cell>
    <Cell><Data ss:Type="String">Actor / Source</Data></Cell>
   </Row>
   ${xmlRows}
  </Table>
 </Worksheet>
</Workbook>`

    const blob = new Blob([workbookXml], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const dateStamp = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `LegalNexus_Audit_Logs_${dateStamp}.xls`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('Excel exported', `Downloaded ${rows.length} audit log entries in Excel format.`, 'good')
  }

  const exportAuditLogsPDF = () => {
    const rows = filteredActivityLogs.length > 0 ? filteredActivityLogs : activityLog
    const escPdf = (str: string) =>
      String(str || '')
        .replace(/[^\x20-\x7E]/g, ' ')
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')

    const lines: Array<{ text: string; bold?: boolean; size?: number }> = [
      { text: 'LEGALNEXUS - ADMINISTRATIVE ACTIVITY & SYSTEM AUDIT LOGS', bold: true, size: 14 },
      {
        text: `Generated: ${new Date().toLocaleString('en-IN')} | Total Records: ${rows.length} | Filter: ${logCategoryFilter.toUpperCase()}`,
        size: 9,
      },
      { text: '----------------------------------------------------------------------------------------------------', size: 9 },
    ]

    rows.forEach((item, idx) => {
      const dt = new Date(item.at).toLocaleString('en-IN')
      const actor = item.actor || 'Admin / System'
      lines.push({
        text: `${idx + 1}. [${item.category.toUpperCase()}] ${item.title} (${dt})`,
        bold: true,
        size: 10,
      })
      const bodyStr = `   Details: ${item.body} | Actor: ${actor}`
      if (bodyStr.length > 105) {
        lines.push({ text: bodyStr.slice(0, 105), size: 9 })
        lines.push({ text: '   ' + bodyStr.slice(105, 210), size: 9 })
      } else {
        lines.push({ text: bodyStr, size: 9 })
      }
      lines.push({ text: '', size: 6 })
    })

    // Paginate into 42 lines per page and build a valid multi-page PDF 1.4 document
    const linesPerPage = 42
    const pageChunks: Array<typeof lines> = []
    for (let i = 0; i < lines.length; i += linesPerPage) {
      pageChunks.push(lines.slice(i, i + linesPerPage))
    }
    if (pageChunks.length === 0) pageChunks.push(lines)

    const objects: string[] = []
    // 1: Catalog, 2: Pages, 3: Font F1 (Helvetica), 4: Font F2 (Helvetica-Bold)
    const pageObjIds: number[] = []
    const contentObjIds: number[] = []
    let nextId = 5
    for (let p = 0; p < pageChunks.length; p++) {
      pageObjIds.push(nextId++)
      contentObjIds.push(nextId++)
    }

    objects[1] = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`
    objects[2] = `2 0 obj\n<< /Type /Pages /Kids [${pageObjIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageObjIds.length} >>\nendobj\n`
    objects[3] = `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`
    objects[4] = `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`

    pageChunks.forEach((chunk, idx) => {
      const pageId = pageObjIds[idx]
      const contentId = contentObjIds[idx]
      let y = 800
      const streamLines: string[] = ['BT']
      chunk.forEach(line => {
        const font = line.bold ? '/F2' : '/F1'
        const size = line.size || 9
        streamLines.push(`${font} ${size} Tf`)
        streamLines.push(`1 0 0 1 40 ${y} Tm`)
        streamLines.push(`(${escPdf(line.text)}) Tj`)
        y -= size + 7
      })
      streamLines.push('ET')
      const streamContent = streamLines.join('\n')
      objects[pageId] = `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`
      objects[contentId] = `${contentId} 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`
    })

    let pdf = '%PDF-1.4\n'
    const offsets: number[] = [0]
    for (let i = 1; i < nextId; i++) {
      offsets[i] = pdf.length
      pdf += objects[i]
    }
    const xrefOffset = pdf.length
    pdf += `xref\n0 ${nextId}\n0000000000 65535 f \n`
    for (let i = 1; i < nextId; i++) {
      pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
    }
    pdf += `trailer\n<< /Size ${nextId} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

    const blob = new Blob([pdf], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const dateStamp = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `LegalNexus_Audit_Logs_${dateStamp}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('PDF exported', `Downloaded ${rows.length} audit log entries in PDF format.`, 'good')
  }

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', handleOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // ─── Live Data Fetch ──────────────────────────────────────────────────────

  const loadAllData = async () => {
    try {
      const [lawyersRes, casesRes, profilesRes, activityRes] = await Promise.all([
        authFetch('/api/lawyers'),
        authFetch('/api/cases'),
        authFetch('/api/profiles'),
        authFetch('/api/activity'),
      ])

      const [lawyersData, casesData, profilesData, activityData] = await Promise.all([
        lawyersRes.json(),
        casesRes.json(),
        profilesRes.json(),
        activityRes.ok ? activityRes.json() : Promise.resolve([]),
      ])

      if (Array.isArray(activityData) && activityData.length > 0) {
        setActivityLog(activityData)
      }

      // Format lawyers
      if (Array.isArray(lawyersData)) {
        const hues = [220, 332, 168, 45, 280, 195, 120]
        const formattedLawyers: AdminLawyerItem[] = lawyersData.map((l: any, i: number) => {
          const initials = (l.name || 'Advocate')
            .replace(/^Adv\.?\s*/i, '')
            .split(' ')
            .map((w: string) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()

          return {
            id: l.id,
            name: l.name || 'Advocate',
            initials,
            hue: hues[i % hues.length],
            specialization: l.specialty || 'General Practice',
            areas: [l.specialty || 'Civil & Consumer', 'General Law'],
            phone: l.phone || '+91 98765 00000',
            email: l.email || 'counsel@legalnexus.in',
            city: l.city || 'New Delhi',
            exp: l.experience_years || 8,
            capacity: 5,
            available: true,
            rating: 4.8,
            verified: true,
            profile_image: l.profile_image || null,
          }
        })
        setLawyers(formattedLawyers)
      }

      // Format clients
      if (Array.isArray(profilesData)) {
        const clientProfiles = profilesData
          .filter((p: any) => p.role === 'client' || !p.role)
          .map((p: any, idx: number) => ({
            id: p.id,
            name: p.full_name || p.name || `Client ${idx + 1}`,
            email: p.email || 'client@legalnexus.in',
            phone: p.phone || '+91 98200 12345',
            gender: p.gender || 'Not specified',
            age: p.age || '—',
            city: p.city || 'Nagpur',
            joined: p.created_at
              ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Jan 2026',
          }))
        setClients(clientProfiles)
      }

      // Format cases
      if (Array.isArray(casesData)) {
        const formattedCases: AdminCaseItem[] = casesData.map((c: any) => {
          const shortRef = `LN-26-${c.id.slice(0, 4).toUpperCase()}`
          const priority = c.priority || (c.status === 'Pending' ? 'High' : 'Normal')
          const filedDate = c.created_at
            ? new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Recently'

          const matchedLawyer = lawyersData.find((l: any) => l.id === c.assigned_lawyer_id)
          const matchedClient = profilesData.find((p: any) => p.id === c.client_id)

          return {
            id: c.id,
            ref: shortRef,
            title: c.title || 'Untitled Matter',
            description: c.description || 'Case brief provided by client.',
            area: c.case_type || 'General Legal Matter',
            city: c.case_location ? c.case_location.split(',')[0] : 'New Delhi',
            court: c.case_location || 'District Court',
            clientId: c.client_id || 'client-anon',
            clientName: matchedClient?.full_name || c.client_name || 'Verified Client',
            clientPhone: matchedClient?.phone || '+91 98200 12345',
            clientEmail: matchedClient?.email || 'client@legalnexus.in',
            lawyerId: c.assigned_lawyer_id || null,
            lawyerName: matchedLawyer?.name || null,
            status: c.status || 'Pending',
            priority,
            filed: filedDate,
            hearing: c.hearing_date || null,
            note: c.notes || '',
            document_url: c.document_url || null,
          }
        })
        setCases(formattedCases)
      }
    } catch (err) {
      console.error('Error loading admin dashboard real data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
    const interval = setInterval(() => {
      fetchLiveActivity(true)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // ─── Computed Workloads & Counts ──────────────────────────────────────────

  const lawyerLoads = useMemo(() => {
    const loads: Record<string, number> = {}
    cases.forEach(c => {
      if (c.lawyerId && c.status !== 'Resolved' && c.status !== 'Closed') {
        loads[c.lawyerId] = (loads[c.lawyerId] || 0) + 1
      }
    })
    return loads
  }, [cases])

  const unassignedCount = useMemo(() => {
    return cases.filter(c => !c.lawyerId && c.status !== 'Resolved' && c.status !== 'Closed').length
  }, [cases])

  const availableLawyersCount = useMemo(() => {
    return lawyers.filter(l => l.available).length
  }, [lawyers])

  const upcomingHearingsCount = useMemo(() => {
    const now = Date.now()
    const in7Days = now + 7 * 24 * 60 * 60 * 1000
    return cases.filter(c => {
      if (!c.hearing || c.status === 'Resolved' || c.status === 'Closed') return false
      const hTime = new Date(c.hearing).getTime()
      return hTime >= now && hTime <= in7Days
    }).length
  }, [cases])

  // ─── Case Actions ─────────────────────────────────────────────────────────

  const handleAssignLawyer = async (caseIds: string[], lawyerId: string | null) => {
    if (caseIds.length === 0) return

    try {
      for (const cid of caseIds) {
        await authFetch(`/api/cases/${cid}`, {
          method: 'PUT',
          body: JSON.stringify({ assigned_lawyer_id: lawyerId }),
        })
      }

      const lObj = lawyers.find(l => l.id === lawyerId)
      const lName = lObj ? lObj.name : 'Unassigned'

      setCases(prev =>
        prev.map(c =>
          caseIds.includes(c.id) ? { ...c, lawyerId, lawyerName: lObj?.name || null } : c
        )
      )

      showToast(
        lawyerId ? 'Lawyer assigned' : 'Lawyer removed',
        lawyerId
          ? `${caseIds.length} case(s) assigned to ${lName}.`
          : `${caseIds.length} case(s) marked unassigned.`,
        'good'
      )
      logActivity('assignment', lawyerId ? `Assigned to ${lName}` : 'Lawyer unassigned', `${caseIds.length} matter(s) updated`)
    } catch (e) {
      console.error('Assign lawyer error:', e)
    }
  }

  const handleUpdateStatus = async (caseIds: string[], newStatus: AdminCaseItem['status']) => {
    if (caseIds.length === 0) return

    try {
      for (const cid of caseIds) {
        await authFetch(`/api/cases/${cid}`, {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus }),
        })
      }

      setCases(prev =>
        prev.map(c => (caseIds.includes(c.id) ? { ...c, status: newStatus } : c))
      )

      showToast('Status updated', `${caseIds.length} case(s) updated to ${newStatus}.`, 'good')
      logActivity('status', `Status changed to ${newStatus}`, `${caseIds.length} case(s) updated`)
    } catch (e) {
      console.error('Update status error:', e)
    }
  }

  const handleSaveDetails = async (caseId: string) => {
    const cur = cases.find(c => c.id === caseId)
    if (!cur) return

    const newNote = noteInputs[caseId] !== undefined ? noteInputs[caseId] : cur.note
    const newHearing = hearingInputs[caseId] !== undefined ? hearingInputs[caseId] : cur.hearing
    const newPriority = (priorityInputs[caseId] !== undefined ? priorityInputs[caseId] : cur.priority) as AdminCaseItem['priority']

    try {
      await authFetch(`/api/cases/${caseId}`, {
        method: 'PUT',
        body: JSON.stringify({
          notes: newNote,
          hearing_date: newHearing,
          priority: newPriority,
        }),
      })

      setCases(prev =>
        prev.map(c =>
          c.id === caseId
            ? { ...c, note: newNote, hearing: newHearing, priority: newPriority }
            : c
        )
      )

      showToast('Case details saved', 'Internal note, priority, and hearing dates were synchronized.', 'good')
      logActivity('note', 'Admin note & hearing updated', `“${cur.title}”`)
    } catch (e) {
      console.error('Save case details error:', e)
    }
  }

  const handleAutoAssign = async () => {
    const unassigned = cases.filter(c => !c.lawyerId && c.status !== 'Resolved' && c.status !== 'Closed')
    if (unassigned.length === 0) {
      showToast('All Assigned', 'All active client matters already have an assigned advocate.', 'info')
      return
    }

    let assignedCount = 0
    for (const c of unassigned) {
      const bestMatch =
        lawyers.find(
          l =>
            l.available &&
            (lawyerLoads[l.id] || 0) < l.capacity &&
            (l.areas.some(
              a =>
                a.toLowerCase().includes(c.area.toLowerCase()) ||
                c.area.toLowerCase().includes(a.toLowerCase())
            ) ||
              l.specialization.toLowerCase().includes(c.area.toLowerCase()))
        ) ||
        lawyers.find(l => l.available && (lawyerLoads[l.id] || 0) < l.capacity) ||
        lawyers[0]

      if (bestMatch) {
        await handleAssignLawyer([c.id], bestMatch.id)
        assignedCount++
      }
    }

    showToast(
      'Auto-Assignment Completed',
      `Auto-assigned ${assignedCount} case(s) based on specialization & capacity.`,
      'good'
    )
  }

  const handleExportCases = () => {
    const dataToExport = filteredCases.map(c => ({
      Reference: c.ref,
      Title: c.title,
      PracticeArea: c.area,
      City: c.city,
      Court: c.court,
      Client: c.clientName,
      ClientPhone: c.clientPhone || '',
      ClientEmail: c.clientEmail || '',
      AssignedLawyer: c.lawyerName || 'Unassigned',
      Status: c.status,
      Priority: c.priority,
      FiledDate: c.filed,
      HearingDate: c.hearing || 'Not scheduled',
      InternalNote: c.note,
    }))

    const headers = ['Reference,Title,PracticeArea,City,Court,Client,ClientPhone,ClientEmail,AssignedLawyer,Status,Priority,FiledDate,HearingDate,InternalNote']
    const rows = dataToExport.map(r =>
      Object.values(r)
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    )
    const csvContent = headers.concat(rows).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `legalnexus-cases-export-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast('Exported Cases', `Exported ${dataToExport.length} cases to CSV file.`, 'good')
  }

  const handleCopyRef = (ref: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ref)
      showToast('Reference Copied', `${ref} copied to clipboard.`, 'info')
    }
  }

  const handleToggleLawyerAvailable = (lawyerId: string) => {
    setLawyers(prev =>
      prev.map(l => {
        if (l.id === lawyerId) {
          const next = !l.available
          showToast(
            next ? `${l.name} marked available` : `${l.name} marked away`,
            next ? 'Advocate can receive new assignments.' : 'Advocate workload paused.',
            'info'
          )
          logActivity('lawyer', next ? `${l.name} available` : `${l.name} away`, 'Availability updated by admin.')
          return { ...l, available: next }
        }
        return l
      })
    )
  }

  const handleApproveApplicant = async (app: AdminApplicantItem) => {
    try {
      const res = await authFetch('/api/lawyers', {
        method: 'POST',
        body: JSON.stringify({
          name: app.name,
          specialty: app.specialization,
          experience_years: app.exp,
          phone: app.phone,
          email: app.email,
        }),
      })

      if (res.ok) {
        const created = await res.json()
        setApplicants(prev => prev.filter(a => a.id !== app.id))
        setLawyers(prev => [
          ...prev,
          {
            id: created.id || `l-${Date.now()}`,
            name: app.name,
            initials: app.initials,
            hue: app.hue,
            specialization: app.specialization,
            areas: app.areas,
            phone: app.phone,
            email: app.email,
            city: app.city,
            exp: app.exp,
            capacity: 5,
            available: true,
            rating: 5.0,
            verified: true,
          },
        ])
        showToast('Advocate approved', `${app.name} is now verified and active in the directory.`, 'good')
        logActivity('lawyer', 'Advocate approved & onboarded', `${app.name} (${app.barEnrollment})`)
      }
    } catch (e) {
      console.error('Approve applicant error:', e)
    }
  }

  const handleRejectApplicant = (app: AdminApplicantItem) => {
    setApplicants(prev => prev.filter(a => a.id !== app.id))
    showToast('Application dismissed', `Application for ${app.name} has been archived.`, 'info')
  }

  const handleCreateLawyerDirect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLawyerForm.name.trim()) return

    try {
      const res = await authFetch('/api/lawyers', {
        method: 'POST',
        body: JSON.stringify({
          name: newLawyerForm.name,
          specialty: newLawyerForm.specialty,
          experience_years: Number(newLawyerForm.experience_years) || 5,
          phone: newLawyerForm.phone,
          email: newLawyerForm.email,
        }),
      })

      if (res.ok) {
        const created = await res.json()
        const initials = newLawyerForm.name
          .replace(/^Adv\.?\s*/i, '')
          .split(' ')
          .map((w: string) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()

        setLawyers(prev => [
          ...prev,
          {
            id: created.id || `l-${Date.now()}`,
            name: newLawyerForm.name,
            initials,
            hue: 168,
            specialization: newLawyerForm.specialty,
            areas: [newLawyerForm.specialty, 'General Law'],
            phone: newLawyerForm.phone,
            email: newLawyerForm.email,
            city: newLawyerForm.city,
            exp: Number(newLawyerForm.experience_years) || 5,
            capacity: 5,
            available: true,
          },
        ])
        setAddLawyerOpen(false)
        setNewLawyerForm({ name: '', specialty: 'Criminal Law', experience_years: '8', phone: '', email: '', city: 'Nagpur' })
        showToast('Advocate onboarded', `${newLawyerForm.name} is now available for assignment.`, 'good')
        logActivity('lawyer', 'New advocate added', newLawyerForm.name)
      }
    } catch (err) {
      console.error('Direct lawyer creation failed:', err)
    }
  }

  // Filtered cases for Cases Tab
  const filteredCases = useMemo(() => {
    const q = caseSearch.trim().toLowerCase()
    return cases
      .filter(c => {
        // Status filter
        if (statusFilter === 'Unassigned') {
          if (c.lawyerId || c.status === 'Resolved' || c.status === 'Closed') return false
        } else if (statusFilter === 'Hearing soon') {
          if (!c.hearing || c.status === 'Resolved' || c.status === 'Closed') return false
          const now = Date.now()
          const in14 = now + 14 * 24 * 60 * 60 * 1000
          const hTime = new Date(c.hearing).getTime()
          if (hTime < now || hTime > in14) return false
        } else if (statusFilter !== 'All') {
          if (c.status !== statusFilter) return false
        }

        // Area filter
        if (areaFilter && c.area !== areaFilter) return false
        // Lawyer filter
        if (lawyerFilter && c.lawyerId !== lawyerFilter) return false
        // Client filter
        if (clientFilter && c.clientId !== clientFilter) return false

        // Search query
        if (q) {
          const matchText = [c.title, c.ref, c.city, c.area, c.court, c.clientName, c.lawyerName || '']
            .join(' ')
            .toLowerCase()
          if (!matchText.includes(q)) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortOrder === 'priority') {
          const pOrder = { High: 0, Normal: 1, Low: 2 }
          return (pOrder[a.priority] || 1) - (pOrder[b.priority] || 1)
        }
        if (sortOrder === 'hearing') {
          return (a.hearing || '9999').localeCompare(b.hearing || '9999')
        }
        return b.id.localeCompare(a.id)
      })
  }, [cases, statusFilter, areaFilter, lawyerFilter, clientFilter, caseSearch, sortOrder])

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col lg:flex-row antialiased selection:bg-gold/20">
      
      {/* ── Floating Toast Alert ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-line bg-cardsolid px-4 py-3 shadow-2xl backdrop-blur-xl anim-rise max-w-sm">
          <span
            className={`grid size-8 shrink-0 place-items-center rounded-xl text-sm ${
              toast.tone === 'good' ? 'bg-good/20 text-good' : 'bg-goldsoft text-gold'
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

      {/* ── Document Vault Modal ── */}
      {docModalItem && (
        <DocumentViewerModal
          item={docModalItem}
          onClose={() => setDocModalItem(null)}
          onToast={showToast}
          onDocUpdated={newUrl => {
            setCases(prev =>
              prev.map(c => (c.id === docModalItem.id ? { ...c, document_url: newUrl } : c))
            )
          }}
        />
      )}

      {/* ── Executive Left Sidebar: Admin Console Navigation (`Kv`) ── */}
      <aside className="sticky top-0 z-40 flex w-full lg:h-screen lg:w-64 shrink-0 flex-col justify-between border-b lg:border-b-0 lg:border-r border-line bg-cardsolid/95 p-4 backdrop-blur-xl">
        <div className="space-y-6">
          {/* Logo with Admin Console Badge */}
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
                <span className="eyebrow mt-1 text-[0.49rem] text-gold tracking-widest uppercase">
                  Admin console
                </span>
              </span>
            </button>
          </div>

          {/* Vertical Nav Tabs */}
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            <p className="hidden lg:block px-3 pb-1 text-[0.62rem] font-mono uppercase tracking-[0.14em] text-faint">
              Governance Menu
            </p>
            {NAV_TABS.map(tab => {
              const Icon = tab.icon
              const isActive = view === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id as any)}
                  className={`flex shrink-0 lg:w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-[0.82rem] font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-goldsoft text-gold font-bold border border-gold/30 shadow-xs'
                      : 'text-muted hover:bg-card hover:text-ink border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="size-4 shrink-0" />
                    <span>{tab.label}</span>
                  </span>
                  {tab.id === 'cases' && unassignedCount > 0 && (
                    <span className="grid min-w-4 place-items-center rounded-full bg-gold px-1.5 font-mono text-[0.58rem] font-bold text-goldink">
                      {unassignedCount}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="hidden lg:block border-t border-line pt-3 px-2">
          <p className="text-[0.65rem] font-mono text-faint flex items-center gap-1.5">
            <ShieldLockIcon className="size-3 text-gold" /> System Operator Active
          </p>
        </div>
      </aside>

      {/* ── Main Content Wrapper ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* ── Top-Right Controls Bar ── */}
        <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-xl">
          <div className="site-shell flex h-16 items-center justify-end gap-2.5 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title="Toggle theme"
              className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-line bg-card text-xs font-medium text-muted transition-all hover:border-gold hover:text-gold cursor-pointer"
            >
              {theme === 'midnight' ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
              <span className="hidden sm:inline">Theme</span>
            </button>

            {/* Unassigned Quick Notification Button */}
            <button
              onClick={() => {
                setStatusFilter('Unassigned')
                setView('cases')
              }}
              aria-label={`${unassignedCount} cases need a lawyer`}
              title="Unassigned triage queue"
              className="relative inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-line bg-card text-xs font-medium text-muted transition hover:border-gold hover:text-gold cursor-pointer"
            >
              <BellIcon className="size-4" />
              <span className="hidden sm:inline">Alerts</span>
              {unassignedCount > 0 && (
                <span className="size-1.5 rounded-full bg-gold anim-pulse" />
              )}
            </button>

            {/* Admin Avatar Dropdown */}
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountMenuOpen(prev => !prev)}
                className="flex items-center gap-2.5 rounded-xl border border-line bg-card p-1.5 pl-2 pr-2.5 transition hover:border-line2 hover:bg-card2 cursor-pointer"
              >
                <AvatarInitials initials="AD" hue={42} size={30} />
                <div className="hidden text-left sm:block">
                  <span className="block text-[0.76rem] font-bold leading-tight text-ink">Administrator</span>
                  <span className="block text-[0.63rem] text-gold font-medium">Full Access Console</span>
                </div>
                <ChevronDownIcon
                  className={`size-3.5 text-faint transition-transform ${
                    accountMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {accountMenuOpen && (
                <div className="anim-rise absolute right-0 top-[calc(100%+0.6rem)] z-50 w-56 rounded-2xl border border-line bg-cardsolid p-1.5 shadow-[var(--shadow)]">
                  <div className="border-b border-line px-3 py-2.5">
                    <p className="text-[0.8rem] font-bold text-ink">Administrator Root</p>
                    <p className="truncate text-[0.68rem] text-muted">{user?.email || 'admin@legalnexus.in'}</p>
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-gold/30 bg-goldsoft px-2 py-0.5 text-[0.62rem] font-bold text-gold">
                      🛡️ System Operator
                    </span>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setView('overview')
                        setAccountMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.78rem] text-muted transition hover:bg-card hover:text-ink cursor-pointer text-left"
                    >
                      <span>📊</span> Operational Overview
                    </button>
                    <button
                      onClick={() => {
                        setView('cases')
                        setAccountMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.78rem] text-muted transition hover:bg-card hover:text-ink cursor-pointer text-left"
                    >
                      <span>📋</span> Master Cases ({cases.length})
                    </button>
                    <button
                      onClick={() => {
                        setView('lawyers')
                        setAccountMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.78rem] text-muted transition hover:bg-card hover:text-ink cursor-pointer text-left"
                    >
                      <span>⚖️</span> Lawyer Network & Load
                    </button>
                    <button
                      onClick={() => {
                        setView('clients')
                        setAccountMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.78rem] text-muted transition hover:bg-card hover:text-ink cursor-pointer text-left"
                    >
                      <span>👥</span> Client Directory ({clients.length})
                    </button>
                  </div>
                  <div className="border-t border-line py-1">
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false)
                        navigate('/client')
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-[0.75rem] text-muted transition hover:bg-card hover:text-ink cursor-pointer text-left"
                    >
                      <span>👤</span> Switch to Client Portal
                    </button>
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false)
                        navigate('/lawyer')
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-[0.75rem] text-muted transition hover:bg-card hover:text-ink cursor-pointer text-left"
                    >
                      <span>⚖️</span> Switch to Lawyer Workspace
                    </button>
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false)
                        navigate('/')
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-[0.75rem] text-muted transition hover:bg-card hover:text-ink cursor-pointer text-left"
                    >
                      <span>🏠</span> Public Landing Page
                    </button>
                  </div>
                  <div className="border-t border-line pt-1">
                    <button
                      onClick={async () => {
                        await signOut()
                        navigate('/auth')
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[0.78rem] text-red-400 transition hover:bg-red-500/10 hover:text-red-300 cursor-pointer text-left"
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
              VIEW 1: OVERVIEW (`$v`)
          ══════════════════════════════════════════════════════════════════════ */}
          {view === 'overview' && (
            <div className="space-y-7 anim-rise">
              
              {/* Hero Banner (`nr`) */}
              <section className="relative overflow-hidden rounded-3xl border border-line bg-cardsolid px-6 py-7 shadow-[var(--shadow)] sm:px-8 sm:py-8">
                <div aria-hidden className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
                <div
                  aria-hidden
                  className="absolute -right-28 -top-28 size-80 rounded-full bg-[radial-gradient(circle,var(--glow-b),transparent_65%)] opacity-80 blur-xl anim-drift pointer-events-none"
                />

                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <span className="eyebrow flex items-center gap-2 text-gold">
                      <span className="h-px w-6 bg-gold/60" /> LegalNexus · Admin Operations
                    </span>
                    <h1 className="mt-4 text-[clamp(2rem,4.3vw,3.35rem)] font-display font-bold leading-[1.02] text-inkstrong">
                      Real-time operations & triage.
                    </h1>
                    <p className="mt-3 max-w-xl text-[0.9rem] leading-relaxed text-muted">
                      Review unassigned matters, manage advocate workload, track hearing dates and monitor platform growth.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <ActionButton
                      onClick={() => {
                        setStatusFilter('Unassigned')
                        setView('cases')
                      }}
                      size="lg"
                      variant="gold"
                    >
                      <AlertTriangleIcon className="size-4" /> Triage {unassignedCount} Unassigned
                    </ActionButton>
                    <ActionButton onClick={() => setAddLawyerOpen(true)} size="lg" variant="outline">
                      <PlusIcon className="size-4" /> Add Lawyer
                    </ActionButton>
                  </div>
                </div>

                {/* 4 Clickable Metric Counter Cards (`hn`) */}
                <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      label: 'Total Cases',
                      value: cases.length,
                      note: `${unassignedCount} need a lawyer`,
                      tone: 'text-gold',
                      onClick: () => {
                        setStatusFilter('All')
                        setView('cases')
                      },
                    },
                    {
                      label: 'Lawyers',
                      value: lawyers.length,
                      note: `${availableLawyersCount} available for work`,
                      tone: 'text-accent',
                      onClick: () => setView('lawyers'),
                    },
                    {
                      label: 'Clients',
                      value: clients.length,
                      note: `${cases.length} total filings`,
                      tone: 'text-good',
                      onClick: () => setView('clients'),
                    },
                    {
                      label: 'Hearings (7d)',
                      value: upcomingHearingsCount,
                      note: 'Upcoming this week',
                      tone: 'text-purple-400',
                      onClick: () => {
                        setStatusFilter('Hearing soon')
                        setView('cases')
                      },
                    },
                  ].map((stat, i) => (
                    <button
                      key={i}
                      onClick={stat.onClick}
                      className="flex flex-col justify-between rounded-2xl border border-line bg-card/80 p-4 text-left transition hover:border-gold/40 hover:bg-card2 cursor-pointer"
                    >
                      <p className="eyebrow text-faint text-[0.62rem]">{stat.label}</p>
                      <p className={`font-display text-3xl font-bold my-1 ${stat.tone}`}>{stat.value}</p>
                      <p className="text-[0.72rem] text-muted font-medium truncate">{stat.note}</p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Triage Queue & Capacity Grid (`$v` + `Fv` + `Wv`) */}
              <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,.8fr)]">
                
                {/* Left Column: Needs Attention / Unassigned Triage (`Jv`) */}
                <div className="rounded-3xl border border-line bg-cardsolid p-5 sm:p-6 shadow-[var(--shadow)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="eyebrow text-gold">Triage queue</span>
                        <h2 className="mt-1 font-display text-[1.3rem] font-bold text-inkstrong">
                          Unassigned Matters Awaiting Advocate
                        </h2>
                      </div>
                      <Badge tone="gold">{unassignedCount} Pending</Badge>
                    </div>

                    <div className="mt-5 space-y-3">
                      {cases.filter(c => !c.lawyerId && c.status !== 'Resolved' && c.status !== 'Closed').length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-line p-8 text-center bg-card2/50">
                          <CheckIcon className="size-8 text-good mx-auto mb-2 opacity-80" />
                          <p className="font-bold text-ink text-[0.88rem]">All caught up!</p>
                          <p className="text-[0.74rem] text-muted mt-1">Every active client matter has an assigned advocate.</p>
                        </div>
                      ) : (
                        cases
                          .filter(c => !c.lawyerId && c.status !== 'Resolved' && c.status !== 'Closed')
                          .slice(0, 4)
                          .map(c => (
                            <div
                              key={c.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-goldsoft/20 p-4 transition hover:border-gold"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[0.64rem] font-bold text-gold uppercase">{c.ref}</span>
                                  {c.priority === 'High' && <HighPriorityBadge />}
                                </div>
                                <h4 className="font-bold text-[0.88rem] text-inkstrong truncate mt-0.5">{c.title}</h4>
                                <p className="text-[0.72rem] text-muted mt-0.5">
                                  {c.clientName} · {c.area} · <PinIcon className="size-3 text-gold inline" /> {c.city}
                                </p>
                              </div>

                              <ActionButton
                                size="sm"
                                variant="gold"
                                onClick={() => {
                                  setStatusFilter('Unassigned')
                                  setExpandedCaseId(c.id)
                                  setView('cases')
                                }}
                              >
                                Assign Counsel →
                              </ActionButton>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-line flex items-center justify-between text-[0.74rem]">
                    <span className="text-faint">Smart lawyer match recommendation available</span>
                    <button
                      onClick={() => {
                        setStatusFilter('Unassigned')
                        setView('cases')
                      }}
                      className="font-bold text-gold hover:underline"
                    >
                      View full triage list →
                    </button>
                  </div>
                </div>

                {/* Right Column: Upcoming Hearings & Advocate Workloads (`Fv` & `Wv`) */}
                <div className="space-y-6">
                  
                  {/* Next 14 Days Hearings (`Fv`) */}
                  <div className="rounded-3xl border border-line bg-card p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="eyebrow text-purple-400">Next 14 days</span>
                        <h3 className="font-display text-[1.15rem] font-bold text-inkstrong mt-1">
                          Upcoming Court Hearings
                        </h3>
                      </div>
                      <CalendarIcon className="size-5 text-purple-400" />
                    </div>

                    <div className="space-y-2.5">
                      {cases.filter(c => c.hearing && c.status !== 'Resolved' && c.status !== 'Closed').length === 0 ? (
                        <p className="text-xs text-muted py-4 text-center">No hearings listed for the next two weeks.</p>
                      ) : (
                        cases
                          .filter(c => c.hearing && c.status !== 'Resolved' && c.status !== 'Closed')
                          .slice(0, 3)
                          .map(c => {
                            const badge = parseHearingBadge(c.hearing)
                            return (
                              <div
                                key={c.id}
                                onClick={() => {
                                  setExpandedCaseId(c.id)
                                  setView('cases')
                                }}
                                className="flex items-center gap-3 rounded-2xl border border-line bg-card2 p-2.5 transition hover:border-purple-500/50 cursor-pointer"
                              >
                                <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                                  <span className="font-display text-base font-bold leading-none">{badge.day}</span>
                                  <span className="mt-0.5 font-mono text-[0.52rem] font-bold">{badge.month}</span>
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[0.8rem] font-bold text-ink">{c.title}</p>
                                  <p className="truncate text-[0.68rem] text-muted mt-0.5">
                                    {c.lawyerName ? `Adv. ${c.lawyerName}` : '⚠️ No lawyer assigned'} · {c.court}
                                  </p>
                                </div>
                              </div>
                            )
                          })
                      )}
                    </div>
                  </div>

                  {/* Lawyer Workload Capacity Progress Bars (`Wv`) */}
                  <div className="rounded-3xl border border-line bg-card p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="eyebrow text-accent">Team capacity</span>
                        <h3 className="font-display text-[1.15rem] font-bold text-inkstrong mt-1">
                          Advocate Workload
                        </h3>
                      </div>
                      <button
                        onClick={() => setView('lawyers')}
                        className="text-[0.72rem] font-bold text-accent hover:underline"
                      >
                        All ({lawyers.length})
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {lawyers.slice(0, 4).map(l => {
                        const load = lawyerLoads[l.id] || 0
                        const pct = Math.min(100, Math.round((load / l.capacity) * 100))
                        return (
                          <div
                            key={l.id}
                            onClick={() => {
                              setLawyerFilter(l.id)
                              setView('cases')
                            }}
                            className="cursor-pointer group"
                          >
                            <div className="flex items-center justify-between text-[0.76rem]">
                              <span className="font-bold text-ink group-hover:text-accent transition truncate">
                                {l.name}
                              </span>
                              <span className="font-mono text-[0.68rem] text-faint">
                                {load} / {l.capacity} cases
                              </span>
                            </div>
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-card2">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  pct >= 80 ? 'bg-gold' : 'bg-accent'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                </div>

              </section>

              {/* Activity Timeline Preview (`$x`) */}
              <section className="rounded-3xl border border-line bg-cardsolid p-5 sm:p-6 shadow-[var(--shadow)]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <span className="eyebrow text-gold">Live audit trail</span>
                    <h3 className="font-display text-[1.25rem] font-bold text-inkstrong mt-1">
                      Recent Administrative Actions
                    </h3>
                  </div>
                  <ActionButton size="sm" variant="outline" onClick={() => setView('activity')}>
                    View Full Audit Log →
                  </ActionButton>
                </div>

                <div className="space-y-4">
                  {activityLog.slice(0, 4).map(item => {
                    const meta = CATEGORY_META[item.category] || CATEGORY_META.system
                    return (
                      <div key={item.id} className="flex items-start gap-3 border-b border-line/60 pb-3 last:border-none last:pb-0">
                        <span className={`grid size-8 shrink-0 place-items-center rounded-xl bg-card2 text-xs font-bold ${meta.cls}`}>
                          ●
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[0.82rem] font-bold text-ink">{item.title}</p>
                            <span className="font-mono text-[0.65rem] text-faint">{formatRelativeTime(item.at)}</span>
                          </div>
                          <p className="text-[0.74rem] text-muted mt-0.5">{item.body}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              VIEW 2: CASES MASTER MANAGEMENT
          ══════════════════════════════════════════════════════════════════════ */}
          {view === 'cases' && (
            <div className="space-y-6 anim-rise">
              
              {/* Header Title & Actions Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-inkstrong">
                    Assign, track and update every case
                  </h1>
                  <p className="mt-1.5 text-xs sm:text-sm text-muted max-w-3xl leading-relaxed">
                    Assign lawyers with specialisation and workload shown inline, update statuses in bulk and keep internal notes in one place.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={handleExportCases}
                    className="inline-flex items-center gap-2 rounded-xl border border-line bg-cardsolid px-4 py-2 text-xs sm:text-sm font-semibold text-ink hover:bg-card2 hover:border-line2 transition shadow-xs cursor-pointer"
                  >
                    <DownloadIcon className="size-4" />
                    <span>Export {cases.length}</span>
                  </button>

                  <button
                    onClick={handleAutoAssign}
                    className="inline-flex items-center gap-2 rounded-full bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold px-4 py-2 text-xs sm:text-sm shadow-md transition cursor-pointer"
                  >
                    <SparklesIcon className="size-4 text-gray-950" />
                    <span>Auto-assign ({unassignedCount})</span>
                  </button>
                </div>
              </div>

              {/* Filters Box */}
              <div className="rounded-3xl border border-line bg-cardsolid p-4 sm:p-5 space-y-4 shadow-[var(--shadow)]">
                
                {/* Search & Selects */}
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-12">
                  
                  {/* Search Box */}
                  <div className="relative lg:col-span-6">
                    <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-faint" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search title, reference, client, court or city"
                      value={caseSearch}
                      onChange={e => setCaseSearch(e.target.value)}
                      className="w-full rounded-2xl border border-line bg-card2 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-ink placeholder:text-faint/80 outline-none focus:border-blue-500 focus:bg-card"
                    />
                    <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md border border-line bg-card px-1.5 py-0.5 font-mono text-[0.65rem] text-faint shadow-xs pointer-events-none">
                      /
                    </kbd>
                  </div>

                  {/* Practice Areas */}
                  <div className="lg:col-span-2">
                    <select
                      value={areaFilter}
                      onChange={e => setAreaFilter(e.target.value)}
                      className="w-full rounded-2xl border border-line bg-card2 px-3.5 py-2.5 text-xs sm:text-sm text-ink outline-none cursor-pointer focus:border-blue-500"
                    >
                      <option value="">All practice areas</option>
                      {PRACTICE_AREAS.map(a => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Lawyers */}
                  <div className="lg:col-span-2">
                    <select
                      value={lawyerFilter}
                      onChange={e => setLawyerFilter(e.target.value)}
                      className="w-full rounded-2xl border border-line bg-card2 px-3.5 py-2.5 text-xs sm:text-sm text-ink outline-none cursor-pointer focus:border-blue-500"
                    >
                      <option value="">All lawyers</option>
                      {lawyers.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="lg:col-span-2">
                    <select
                      value={sortOrder}
                      onChange={e => setSortOrder(e.target.value as any)}
                      className="w-full rounded-2xl border border-line bg-card2 px-3.5 py-2.5 text-xs sm:text-sm text-ink outline-none cursor-pointer focus:border-blue-500"
                    >
                      <option value="newest">Newest filed</option>
                      <option value="priority">Priority (High first)</option>
                      <option value="hearing">Next hearing date</option>
                      <option value="oldest">Oldest filed</option>
                    </select>
                  </div>

                </div>

                {/* Status Filter Badges Strip */}
                <div className="hide-scroll flex items-center gap-2 overflow-x-auto pt-1">
                  {[
                    { id: 'All', label: 'All', count: cases.length },
                    { id: 'Unassigned', label: 'Unassigned', count: unassignedCount },
                    { id: 'Hearing soon', label: 'Hearing soon', count: upcomingHearingsCount },
                    { id: 'Pending', label: 'Pending', count: cases.filter(c => c.status === 'Pending').length },
                    { id: 'In Progress', label: 'In Progress', count: cases.filter(c => c.status === 'In Progress').length },
                    { id: 'Hearing Scheduled', label: 'Hearing Scheduled', count: cases.filter(c => c.status === 'Hearing Scheduled').length },
                    { id: 'Resolved', label: 'Resolved', count: cases.filter(c => c.status === 'Resolved').length },
                    { id: 'Closed', label: 'Closed', count: cases.filter(c => c.status === 'Closed').length },
                  ].map(st => {
                    const isActive = statusFilter === st.id
                    return (
                      <button
                        key={st.id}
                        onClick={() => setStatusFilter(st.id)}
                        className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'border border-line/80 bg-card2 text-muted hover:border-line2 hover:text-ink'
                        }`}
                      >
                        <span>{st.label}</span>
                        <span className={`text-[0.7rem] font-bold ${isActive ? 'text-blue-100' : 'text-faint'}`}>
                          {st.count}
                        </span>
                      </button>
                    )
                  })}
                  {(caseSearch || areaFilter || lawyerFilter || clientFilter || statusFilter !== 'All') && (
                    <button
                      onClick={() => {
                        setCaseSearch('')
                        setAreaFilter('')
                        setLawyerFilter('')
                        setClientFilter('')
                        setStatusFilter('All')
                      }}
                      className="ml-auto text-xs font-semibold text-blue-400 hover:underline shrink-0 pl-2"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Batch Actions Strip if multiple cases are selected */}
                {selectedCaseIds.size > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-500/40 bg-blue-500/10 p-3 pt-3">
                    <span className="text-xs font-bold text-ink">
                      {selectedCaseIds.size} case(s) selected
                    </span>

                    <div className="flex items-center gap-2">
                      <select
                        onChange={e => {
                          if (e.target.value) {
                            handleAssignLawyer([...selectedCaseIds], e.target.value)
                            setSelectedCaseIds(new Set())
                          }
                        }}
                        className="rounded-xl border border-line bg-card px-3 py-1.5 text-xs text-ink outline-none cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Batch Assign Lawyer...
                        </option>
                        {lawyers.map(l => (
                          <option key={l.id} value={l.id}>
                            {l.name} ({lawyerLoads[l.id] || 0}/{l.capacity})
                          </option>
                        ))}
                      </select>

                      <select
                        onChange={e => {
                          if (e.target.value) {
                            handleUpdateStatus([...selectedCaseIds], e.target.value as any)
                            setSelectedCaseIds(new Set())
                          }
                        }}
                        className="rounded-xl border border-line bg-card px-3 py-1.5 text-xs text-ink outline-none cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Batch Set Status...
                        </option>
                        {['Pending', 'In Progress', 'Hearing Scheduled', 'Resolved', 'Closed'].map(s => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => setSelectedCaseIds(new Set())}
                        className="text-xs font-semibold text-faint hover:text-ink px-2"
                      >
                        Deselect
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Table Column Headers */}
              <div className="hidden sm:grid sm:grid-cols-[auto_minmax(0,1.8fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto] items-center gap-4 px-6 text-[0.68rem] font-mono font-bold tracking-widest text-faint uppercase">
                <input
                  type="checkbox"
                  checked={selectedCaseIds.size > 0 && selectedCaseIds.size === filteredCases.length}
                  onChange={() => {
                    if (selectedCaseIds.size === filteredCases.length) setSelectedCaseIds(new Set())
                    else setSelectedCaseIds(new Set(filteredCases.map(c => c.id)))
                  }}
                  className="size-4 rounded accent-blue-600 cursor-pointer"
                />
                <span>CASE · {filteredCases.length} RESULTS</span>
                <span>HEARING</span>
                <span>ASSIGNED LAWYER</span>
                <span>STATUS</span>
                <span className="w-8"></span>
              </div>

              {/* Cases List */}
              <div className="space-y-3">
                {filteredCases.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-line p-12 text-center bg-card/40">
                    <DocIcon className="size-10 text-faint mx-auto mb-2 opacity-60" />
                    <p className="font-bold text-[0.95rem] text-inkstrong">No cases match your filters</p>
                    <p className="text-[0.78rem] text-muted mt-1">Try resetting the status or search terms.</p>
                  </div>
                ) : (
                  filteredCases.slice(0, visibleCount).map(c => {
                    const isSelected = selectedCaseIds.has(c.id)
                    const isExpanded = expandedCaseId === c.id

                    const suggestedLawyer =
                      lawyers.find(
                        l =>
                          l.available &&
                          (l.specialization.toLowerCase().includes(c.area.toLowerCase()) ||
                            l.areas.some(a => a.toLowerCase().includes(c.area.toLowerCase())))
                      ) ||
                      lawyers.find(l => l.available && (lawyerLoads[l.id] || 0) < l.capacity) ||
                      lawyers[0]

                    return (
                      <div
                        key={c.id}
                        id={`case-${c.id}`}
                        className={`rounded-2xl border transition-all duration-200 ${
                          isSelected
                            ? 'border-blue-500/80 bg-blue-500/5'
                            : isExpanded
                            ? 'border-amber-400/80 bg-cardsolid shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-amber-400/30'
                            : 'border-line bg-cardsolid hover:border-line2'
                        }`}
                      >
                        {/* Top Summary Row */}
                        <div className="p-4 sm:p-5">
                          <div className="grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1.8fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto] items-start sm:items-center gap-3 sm:gap-4">
                            
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedCaseIds(prev => {
                                  const next = new Set(prev)
                                  if (next.has(c.id)) next.delete(c.id)
                                  else next.add(c.id)
                                  return next
                                })
                              }}
                              className="size-4 rounded accent-blue-600 cursor-pointer mt-1 sm:mt-0"
                            />

                            {/* Title & Metadata */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4
                                  onClick={() => setExpandedCaseId(isExpanded ? null : c.id)}
                                  className="font-bold text-sm sm:text-[0.92rem] text-inkstrong hover:text-blue-400 transition cursor-pointer truncate"
                                >
                                  {c.title}
                                </h4>
                                {c.priority === 'High' && <HighPriorityBadge />}
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.72rem] text-muted">
                                <span className="font-mono text-faint">{c.ref}</span>
                                <span className="font-semibold text-blue-400">{c.area}</span>
                                <span><PinIcon className="size-3 text-gold inline" /> {c.city}</span>
                                <span>👤 {c.clientName}</span>
                                <span>Filed {c.filed}</span>
                              </div>
                            </div>

                            {/* Hearing Date Column */}
                            <div>
                              <span className="sm:hidden text-[0.65rem] text-muted block mb-0.5">HEARING:</span>
                              {c.hearing ? (
                                <span className="text-xs text-ink font-medium">
                                  {new Date(c.hearing).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                              ) : (
                                <span className="text-xs text-faint">Not listed</span>
                              )}
                            </div>

                            {/* Assigned Lawyer Column */}
                            <div className="min-w-0">
                              <span className="sm:hidden text-[0.65rem] text-muted block mb-0.5">ASSIGNED LAWYER:</span>
                              <select
                                value={c.lawyerId || ''}
                                onChange={e => handleAssignLawyer([c.id], e.target.value || null)}
                                className={`w-full rounded-xl border px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer truncate ${
                                  c.lawyerId
                                    ? 'border-line bg-card text-ink'
                                    : 'border-line bg-card text-muted'
                                }`}
                              >
                                <option value="">Unassigned</option>
                                {lawyers.map(l => (
                                  <option key={l.id} value={l.id}>
                                    {l.name}
                                  </option>
                                ))}
                              </select>
                              {!c.lawyerId && suggestedLawyer && (
                                <button
                                  onClick={() => handleAssignLawyer([c.id], suggestedLawyer.id)}
                                  className="text-[0.7rem] text-blue-400 hover:text-blue-300 font-semibold mt-1 block cursor-pointer text-left"
                                >
                                  + Assign {suggestedLawyer.name} (suggested)
                                </button>
                              )}
                            </div>

                            {/* Status Column */}
                            <div>
                              <span className="sm:hidden text-[0.65rem] text-muted block mb-0.5">STATUS:</span>
                              <select
                                value={c.status}
                                onChange={e => handleUpdateStatus([c.id], e.target.value as any)}
                                className="w-full rounded-xl border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink outline-none cursor-pointer"
                              >
                                <option value="Pending">🟡 Pending</option>
                                <option value="In Progress">🟣 In Progress</option>
                                <option value="Hearing Scheduled">🔵 Hearing Scheduled</option>
                                <option value="Resolved">🟢 Resolved</option>
                                <option value="Closed">⚪ Closed</option>
                              </select>
                            </div>

                            {/* Expand Toggle Button */}
                            <div className="flex justify-end sm:justify-center">
                              <button
                                onClick={() => setExpandedCaseId(isExpanded ? null : c.id)}
                                className="grid size-8 place-items-center rounded-xl border border-line bg-card2 text-muted hover:text-ink cursor-pointer transition"
                                title="Toggle details"
                              >
                                {isExpanded ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
                              </button>
                            </div>

                          </div>
                        </div>

                        {/* Expanded Drawer Pane */}
                        {isExpanded && (
                          <div className="border-t border-line/60 bg-card/40 p-5 sm:p-6 anim-rise">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              
                              {/* Left Column: Summary, Forum, Date, Priority, Quick actions */}
                              <div>
                                <span className="text-[0.68rem] font-mono tracking-widest text-faint uppercase font-bold block mb-2">
                                  CASE SUMMARY
                                </span>
                                <p className="text-[0.84rem] text-ink font-medium leading-relaxed">
                                  {c.description || 'New vehicle has recurring engine faults. Dealer refuses replacement despite three service visits.'}
                                </p>

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                  <div className="rounded-xl border border-line/60 bg-card p-3">
                                    <span className="text-[0.65rem] text-muted block">Court / forum</span>
                                    <span className="text-[0.8rem] font-bold text-ink block mt-0.5">{c.court || 'District Consumer Commission, Pune'}</span>
                                  </div>
                                  <div className="rounded-xl border border-line/60 bg-card p-3">
                                    <span className="text-[0.65rem] text-muted block">Filed on</span>
                                    <span className="text-[0.8rem] font-bold text-ink block mt-0.5">{c.filed || '27 Sept 2026'}</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                  <div>
                                    <label className="text-[0.65rem] font-semibold text-faint uppercase tracking-wider block mb-1">
                                      NEXT HEARING DATE
                                    </label>
                                    <input
                                      type="date"
                                      value={hearingInputs[c.id] !== undefined ? hearingInputs[c.id] : (c.hearing ? c.hearing.slice(0, 10) : '')}
                                      onChange={e => setHearingInputs(p => ({ ...p, [c.id]: e.target.value }))}
                                      className="w-full rounded-xl border border-line bg-card px-3 py-2 text-xs text-ink outline-none focus:border-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[0.65rem] font-semibold text-faint uppercase tracking-wider block mb-1">
                                      PRIORITY
                                    </label>
                                    <select
                                      value={priorityInputs[c.id] !== undefined ? priorityInputs[c.id] : c.priority}
                                      onChange={e => setPriorityInputs(p => ({ ...p, [c.id]: e.target.value }))}
                                      className="w-full rounded-xl border border-line bg-card px-3 py-2 text-xs text-ink outline-none focus:border-blue-500 cursor-pointer"
                                    >
                                      <option value="Normal">Normal</option>
                                      <option value="High">High</option>
                                      <option value="Low">Low</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mt-4">
                                  {c.clientPhone && (
                                    <a
                                      href={`tel:${c.clientPhone}`}
                                      className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card px-3 py-1.5 text-xs text-muted hover:text-ink hover:border-line2 transition"
                                    >
                                      <PhoneIcon className="size-3.5" />
                                      <span>{c.clientPhone}</span>
                                    </a>
                                  )}
                                  {c.clientEmail && (
                                    <a
                                      href={`mailto:${c.clientEmail}`}
                                      className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card px-3 py-1.5 text-xs text-muted hover:text-ink hover:border-line2 transition"
                                    >
                                      <MailIcon className="size-3.5" />
                                      <span>Email client</span>
                                    </a>
                                  )}
                                  <button
                                    onClick={() => handleCopyRef(c.ref)}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card px-3 py-1.5 text-xs text-muted hover:text-ink hover:border-line2 transition cursor-pointer"
                                  >
                                    <CopyIcon className="size-3.5" />
                                    <span>Copy ref</span>
                                  </button>
                                </div>
                              </div>

                              {/* Right Column: Internal Admin Note */}
                              <div className="flex flex-col justify-between">
                                <div>
                                  <span className="text-[0.68rem] font-mono tracking-widest text-faint uppercase font-bold block mb-2">
                                    INTERNAL ADMIN NOTE
                                  </span>
                                  <textarea
                                    rows={5}
                                    placeholder="Add context for other admins, e.g. why this lawyer was chosen or what the client asked for."
                                    value={noteInputs[c.id] !== undefined ? noteInputs[c.id] : c.note}
                                    onChange={e => setNoteInputs(p => ({ ...p, [c.id]: e.target.value }))}
                                    className="w-full rounded-2xl border border-line bg-card p-3.5 text-xs text-ink placeholder:text-faint/70 outline-none resize-none focus:border-blue-500 leading-relaxed min-h-[140px]"
                                  />
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                  <span className="text-[0.7rem] text-faint flex items-center gap-1.5">
                                    <ShieldLockIcon className="size-3.5 text-faint" /> Visible to admins only
                                  </span>

                                  <button
                                    onClick={() => handleSaveDetails(c.id)}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-semibold shadow-sm transition cursor-pointer"
                                  >
                                    <CheckIcon className="size-3.5" /> Save changes
                                  </button>
                                </div>
                              </div>

                            </div>
                          </div>
                        )}

                      </div>
                    )
                  })
                )}

                {/* Load More Button */}
                {filteredCases.length > visibleCount && (
                  <div className="pt-4 text-center">
                    <ActionButton
                      variant="outline"
                      onClick={() => setVisibleCount(p => p + 12)}
                    >
                      Load More Cases ({filteredCases.length - visibleCount} remaining)
                    </ActionButton>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              VIEW 3: LAWYERS DIRECTORY & CAPACITY (`ey`)
          ══════════════════════════════════════════════════════════════════════ */}
          {view === 'lawyers' && (
            <div className="space-y-6 anim-rise">
              
              <SectionHeading
                eyebrow="Lawyer network"
                title="Capacity, Coverage & Verification"
                sub="Review advocate workload, identify practice gaps, approve pending applications, and manage availability."
                right={
                  <ActionButton onClick={() => setAddLawyerOpen(true)} variant="gold">
                    <PlusIcon className="size-4" /> Onboard Advocate
                  </ActionButton>
                }
              />

              {/* Pending Applications Queue */}
              {applicants.length > 0 && (
                <div className="rounded-3xl border border-gold/30 bg-goldsoft/30 p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-lg bg-gold text-goldink font-bold text-xs">
                        {applicants.length}
                      </span>
                      <h3 className="font-display text-[1.1rem] font-bold text-inkstrong">
                        Advocate Applications Awaiting Verification
                      </h3>
                    </div>
                    <span className="eyebrow text-gold">Bar Council Check</span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {applicants.map(app => (
                      <div
                        key={app.id}
                        className="flex flex-col justify-between rounded-2xl border border-line bg-cardsolid p-4 shadow-sm"
                      >
                        <div>
                          <div className="flex items-start gap-3">
                            <AvatarInitials initials={app.initials} hue={app.hue} size={42} />
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-[0.92rem] text-inkstrong">{app.name}</h4>
                              <p className="text-[0.74rem] text-gold font-semibold mt-0.5">{app.specialization}</p>
                              <p className="text-[0.68rem] text-muted font-mono mt-1">Enrollment: {app.barEnrollment}</p>
                              <p className="text-[0.68rem] text-faint mt-0.5">
                                {app.city} · {app.exp} yrs experience · {app.phone}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-2 border-t border-line pt-3">
                          <ActionButton
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRejectApplicant(app)}
                          >
                            Dismiss
                          </ActionButton>
                          <ActionButton
                            size="sm"
                            variant="gold"
                            onClick={() => handleApproveApplicant(app)}
                          >
                            Verify & Approve →
                          </ActionButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Advocates Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lawyers.map(l => {
                  const load = lawyerLoads[l.id] || 0
                  const pct = Math.min(100, Math.round((load / l.capacity) * 100))

                  return (
                    <div
                      key={l.id}
                      className="flex flex-col justify-between rounded-3xl border border-line bg-cardsolid p-5 shadow-sm hover:border-line2 transition"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <AvatarInitials
                            initials={l.initials}
                            hue={l.hue}
                            size={44}
                            photoUrl={l.profile_image}
                          />

                          <button
                            onClick={() => handleToggleLawyerAvailable(l.id)}
                            className={`rounded-full border px-3 py-1 text-[0.68rem] font-bold transition cursor-pointer ${
                              l.available
                                ? 'border-good/30 bg-good/10 text-good'
                                : 'border-line bg-card2 text-muted'
                            }`}
                          >
                            {l.available ? '● Available' : '○ Away'}
                          </button>
                        </div>

                        <h3 className="font-display text-[1.1rem] font-bold text-inkstrong mt-3">
                          {l.name}
                        </h3>
                        <p className="text-[0.76rem] text-accent font-semibold mt-0.5">
                          {l.specialization}
                        </p>
                        <p className="text-[0.72rem] text-muted mt-1">
                          {l.city} · {l.exp} yrs experience · {l.phone}
                        </p>

                        {/* Workload meter */}
                        <div className="mt-4 rounded-2xl border border-line bg-card2 p-3">
                          <div className="flex items-center justify-between text-[0.72rem]">
                            <span className="text-faint">Active Caseload:</span>
                            <span className="font-mono font-bold text-ink">
                              {load} / {l.capacity} matters
                            </span>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                pct >= 80 ? 'bg-gold' : 'bg-accent'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-line pt-3 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setLawyerFilter(l.id)
                            setView('cases')
                          }}
                          className="text-[0.74rem] font-bold text-gold hover:underline cursor-pointer"
                        >
                          View {load} assigned cases →
                        </button>
                        <span className="text-[0.68rem] text-good font-semibold">✓ Verified</span>
                      </div>
                    </div>
                  )
                })}
              </div>

            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              VIEW 4: CLIENT DIRECTORY (`ty`)
          ══════════════════════════════════════════════════════════════════════ */}
          {view === 'clients' && (
            <div className="space-y-6 anim-rise">
              
              <SectionHeading
                eyebrow="Client directory"
                title="Registered Clients & Portfolios"
                sub="Contact details, case counts, and instant access to each client's cases."
                tone="gold"
                right={
                  <Badge tone="accent">
                    {clients.length} Registered Clients
                  </Badge>
                }
              />

              <div className="rounded-3xl border border-line bg-cardsolid shadow-[var(--shadow)] overflow-hidden">
                
                {/* Table Header */}
                <div className="hidden grid-cols-[1.5fr_1fr_0.8fr_1fr_auto] gap-4 border-b border-line px-6 py-3.5 text-[0.68rem] font-bold text-faint uppercase tracking-wider lg:grid bg-card">
                  <span>Client Name & Email</span>
                  <span>Contact Phone</span>
                  <span>Location</span>
                  <span>Total Cases</span>
                  <span className="text-right">Actions</span>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-line">
                  {clients.length === 0 ? (
                    <p className="p-8 text-center text-sm text-muted">No client records registered yet.</p>
                  ) : (
                    clients.map(cl => {
                      const clientCases = cases.filter(c => c.clientId === cl.id || c.clientName === cl.name)
                      return (
                        <div
                          key={cl.id}
                          className="flex flex-col lg:grid lg:grid-cols-[1.5fr_1fr_0.8fr_1fr_auto] items-start lg:items-center gap-4 p-5 hover:bg-card2/50 transition"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-[0.88rem] text-inkstrong">{cl.name}</p>
                            <p className="text-[0.72rem] text-muted truncate mt-0.5">{cl.email}</p>
                          </div>

                          <div className="text-[0.78rem] text-ink">
                            {cl.phone}
                          </div>

                          <div className="text-[0.78rem] text-muted flex items-center gap-1">
                            <PinIcon className="size-3 text-gold" /> {cl.city}
                          </div>

                          <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card2 px-2.5 py-1 text-[0.72rem] font-semibold text-ink">
                              📋 {clientCases.length} case(s)
                            </span>
                          </div>

                          <div className="lg:text-right w-full lg:w-auto">
                            <button
                              onClick={() => {
                                setClientFilter(cl.id)
                                setView('cases')
                              }}
                              className="inline-flex items-center gap-1 text-[0.75rem] font-bold text-gold hover:underline cursor-pointer"
                            >
                              <span>View filings</span> →
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              VIEW 5: AUDIT LOG & ACTIVITY (`ay`)
          ══════════════════════════════════════════════════════════════════════ */}
          {view === 'activity' && (
            <div className="space-y-6 anim-rise">
              
              <SectionHeading
                eyebrow="Audit trail"
                title="Administrative Activity & System Logs"
                sub="Every case assignment, status change, hearing schedule, and lawyer approval is logged chronologically."
                tone="gold"
                right={
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Badge tone="good">
                      <ShieldLockIcon className="size-3 inline mr-1" /> Logged Admin Session
                    </Badge>
                    <button
                      type="button"
                      onClick={() => fetchLiveActivity(false)}
                      disabled={syncingLogs}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card2 hover:bg-card px-3.5 py-1.5 text-[0.72rem] font-bold text-ink transition cursor-pointer disabled:opacity-50"
                    >
                      <span>{syncingLogs ? 'Syncing…' : '↻ Sync Live'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={exportAuditLogsPDF}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-goldsoft hover:bg-gold/25 px-3.5 py-1.5 text-[0.72rem] font-bold text-gold transition cursor-pointer"
                    >
                      <span>⬇ Download PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={exportAuditLogsExcel}
                      className="inline-flex items-center gap-1.5 rounded-full border border-good/40 bg-good/15 hover:bg-good/25 px-3.5 py-1.5 text-[0.72rem] font-bold text-good transition cursor-pointer"
                    >
                      <span>⬇ Download Excel</span>
                    </button>
                  </div>
                }
              />

              {/* Category Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: 'All Events' },
                    { id: 'system', label: 'System' },
                    { id: 'assignment', label: 'Assignments' },
                    { id: 'status', label: 'Case Status' },
                    { id: 'hearing', label: 'Hearings' },
                    { id: 'lawyer', label: 'Advocates' },
                    { id: 'note', label: 'Notes' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setLogCategoryFilter(cat.id)}
                      className={`rounded-full px-3.5 py-1.5 text-[0.72rem] font-bold transition cursor-pointer border ${
                        logCategoryFilter === cat.id
                          ? 'border-gold/50 bg-goldsoft text-gold'
                          : 'border-line bg-card2 text-muted hover:text-ink'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <span className="font-mono text-[0.68rem] text-faint">
                  Showing {filteredActivityLogs.length} real-time audit event(s) · Auto-refreshing every 5s
                </span>
              </div>

              <div className="rounded-3xl border border-line bg-cardsolid p-6 sm:p-8 shadow-[var(--shadow)]">
                <div className="space-y-6">
                  {filteredActivityLogs.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted">
                      No audit events match this filter yet.
                    </div>
                  ) : (
                    filteredActivityLogs.map((item, idx) => {
                      const meta = CATEGORY_META[item.category] || CATEGORY_META.system
                      const exactTime = new Date(item.at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      return (
                        <div key={item.id} className="relative flex items-start gap-4">
                          {idx < filteredActivityLogs.length - 1 && (
                            <span className="absolute left-[17px] top-10 h-[calc(100%+1.5rem)] w-px bg-line" />
                          )}

                          <span className={`relative grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-card2 text-xs font-bold ${meta.cls}`}>
                            ●
                          </span>

                          <div className="min-w-0 flex-1 pt-0.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-bold text-[0.88rem] text-inkstrong">{item.title}</h4>
                                <span className="rounded-md border border-line bg-card2 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-muted">
                                  {item.category}
                                </span>
                                {item.actor && (
                                  <span className="font-mono text-[0.62rem] text-faint">
                                    by {item.actor}
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[0.66rem] text-faint" title={exactTime}>
                                {formatRelativeTime(item.at)} · {exactTime}
                              </span>
                            </div>
                            <p className="text-[0.78rem] text-muted mt-1 leading-relaxed">{item.body}</p>
                          </div>
                        </div>
                      )
                    })
                  )}
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
            © 2026 LegalNexus · Operations & Governance Console
          </p>
          <div className="flex items-center gap-4 text-[0.72rem] text-faint">
            <span className="flex items-center gap-1.5">
              <ShieldLockIcon className="size-3 text-gold" /> Logged administrator session
            </span>
            <Link to="/" className="hover:text-ink">Public site</Link>
          </div>
        </div>
      </footer>
      </div>

      {/* ── Onboard Lawyer Direct Modal ── */}
      {addLawyerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md anim-rise">
          <div className="relative flex flex-col w-full max-w-md rounded-3xl border border-line bg-cardsolid shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-card">
              <h3 className="font-display text-[1.1rem] font-bold text-inkstrong">
                Onboard New Advocate
              </h3>
              <button
                onClick={() => setAddLawyerOpen(false)}
                className="grid size-8 place-items-center rounded-xl border border-line text-muted hover:text-ink cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLawyerDirect} className="p-6 space-y-3.5">
              <div>
                <label className="eyebrow text-faint block mb-1">Advocate Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Adv. Rajesh Sharma"
                  value={newLawyerForm.name}
                  onChange={e => setNewLawyerForm({ ...newLawyerForm, name: e.target.value })}
                  className="w-full rounded-xl border border-line bg-card2 px-3.5 py-2 text-[0.82rem] text-ink outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="eyebrow text-faint block mb-1">Primary Specialization</label>
                <select
                  value={newLawyerForm.specialty}
                  onChange={e => setNewLawyerForm({ ...newLawyerForm, specialty: e.target.value })}
                  className="w-full rounded-xl border border-line bg-card2 px-3.5 py-2 text-[0.82rem] text-ink outline-none cursor-pointer focus:border-gold"
                >
                  {PRACTICE_AREAS.map(a => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="eyebrow text-faint block mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={newLawyerForm.experience_years}
                    onChange={e => setNewLawyerForm({ ...newLawyerForm, experience_years: e.target.value })}
                    className="w-full rounded-xl border border-line bg-card2 px-3.5 py-2 text-[0.82rem] text-ink outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="eyebrow text-faint block mb-1">City / Forum</label>
                  <input
                    type="text"
                    value={newLawyerForm.city}
                    onChange={e => setNewLawyerForm({ ...newLawyerForm, city: e.target.value })}
                    className="w-full rounded-xl border border-line bg-card2 px-3.5 py-2 text-[0.82rem] text-ink outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="eyebrow text-faint block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newLawyerForm.phone}
                  onChange={e => setNewLawyerForm({ ...newLawyerForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-line bg-card2 px-3.5 py-2 text-[0.82rem] text-ink outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="eyebrow text-faint block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="counsel@chambers.in"
                  value={newLawyerForm.email}
                  onChange={e => setNewLawyerForm({ ...newLawyerForm, email: e.target.value })}
                  className="w-full rounded-xl border border-line bg-card2 px-3.5 py-2 text-[0.82rem] text-ink outline-none focus:border-gold"
                />
              </div>

              <div className="border-t border-line pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddLawyerOpen(false)}
                  className="rounded-xl border border-line px-4 py-2 text-[0.78rem] font-semibold text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gold px-5 py-2 text-[0.78rem] font-bold text-goldink shadow hover:brightness-110 cursor-pointer"
                >
                  Onboard Advocate
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}