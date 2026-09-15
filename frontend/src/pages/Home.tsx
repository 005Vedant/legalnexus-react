import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

// ── DEFAULT LAWYERS DIRECTORY DATA ──
const INITIAL_LAWYERS = [
  {
    id: 'l1',
    name: 'Adv. Suresh Patel',
    initials: 'SP',
    practice: 'Corporate & Tax',
    area: 'corporate',
    city: 'Mumbai',
    exp: 20,
    rating: 4.9,
    reviews: 312,
    fee: 4500,
    languages: ['English', 'Hindi', 'Gujarati'],
    courts: ['Bombay High Court', 'NCLT Mumbai'],
    bio: 'Specializes in corporate governance, tax litigations, M&A due diligence, and regulatory compliance.',
    verified: true,
    availability: 'Available Today',
    success: 94,
  },
  {
    id: 'l2',
    name: 'Adv. Priya Mehta',
    initials: 'PM',
    practice: 'Family & Divorce',
    area: 'family',
    city: 'New Delhi',
    exp: 10,
    rating: 4.8,
    reviews: 184,
    fee: 2800,
    languages: ['English', 'Hindi', 'Punjabi'],
    courts: ['Delhi High Court', 'Saket District Court'],
    bio: 'Compassionate representation in mutual divorce, child custody disputes, maintenance, and domestic matters.',
    verified: true,
    availability: 'Tomorrow',
    success: 91,
  },
  {
    id: 'l3',
    name: 'Adv. Vikram Joshi',
    initials: 'VJ',
    practice: 'Cyber Crime',
    area: 'cyber',
    city: 'Bengaluru',
    exp: 12,
    rating: 4.7,
    reviews: 142,
    fee: 3500,
    languages: ['English', 'Hindi', 'Kannada'],
    courts: ['Karnataka High Court', 'Cyber Appeals Tribunal'],
    bio: 'Certified cyber law specialist defending financial cyber frauds, IT Act compliance, and data breaches.',
    verified: true,
    availability: 'Available Today',
    success: 89,
  },
  {
    id: 'l4',
    name: 'Adv. Ananya Rao',
    initials: 'AR',
    practice: 'Criminal Law',
    area: 'criminal',
    city: 'Hyderabad',
    exp: 15,
    rating: 4.9,
    reviews: 220,
    fee: 4000,
    languages: ['English', 'Hindi', 'Telugu'],
    courts: ['Telangana High Court', 'Nampally Criminal Court'],
    bio: 'Expert trial advocate handling white-collar crimes, anticipatory bails, trial defense, and criminal revisions.',
    verified: true,
    availability: 'This Week',
    success: 93,
  },
  {
    id: 'l5',
    name: 'Adv. Rahul Deshmukh',
    initials: 'RD',
    practice: 'Property & Real Estate',
    area: 'property',
    city: 'Pune',
    exp: 14,
    rating: 4.8,
    reviews: 165,
    fee: 3200,
    languages: ['English', 'Hindi', 'Marathi'],
    courts: ['Bombay High Court', 'MahaRERA Tribunal'],
    bio: 'Land acquisition, title search, RERA complaints, partition suits, and commercial lease verifications.',
    verified: true,
    availability: 'Tomorrow',
    success: 88,
  },
  {
    id: 'l6',
    name: 'Adv. Sneha Kulkarni',
    initials: 'SK',
    practice: 'Civil & Consumer',
    area: 'civil',
    city: 'Nagpur',
    exp: 11,
    rating: 4.9,
    reviews: 128,
    fee: 2500,
    languages: ['English', 'Hindi', 'Marathi'],
    courts: ['Nagpur District Court', 'Consumer Forum'],
    bio: 'Consumer forum compensation, builder delay claims, insurance disputes, and cheque bounce matters.',
    verified: true,
    availability: 'Available Today',
    success: 90,
  }
]

// ── FEE CALCULATOR PRESETS ──
const CASE_TYPES = [
  { id: 'cheque', label: 'Cheque Bounce (S.138 NI Act)', base: 8000, days: 120 },
  { id: 'divorce', label: 'Divorce / Maintenance', base: 25000, days: 300 },
  { id: 'property', label: 'Property Title Dispute', base: 35000, days: 540 },
  { id: 'consumer', label: 'Consumer Complaint', base: 6000, days: 150 },
  { id: 'bail', label: 'Bail Application', base: 15000, days: 30 },
  { id: 'cyber', label: 'Cyber Fraud Complaint', base: 9000, days: 90 },
  { id: 'gst', label: 'GST / Tax Notice Appeal', base: 12000, days: 75 },
  { id: 'labor', label: 'Employment / Wrongful Termination', base: 18000, days: 180 },
]

const COMPLEXITY_LEVELS = [
  { id: 'simple', label: 'Single Issue', mult: 1.0, note: 'One party, clear documents' },
  { id: 'moderate', label: 'Multiple Hearings', mult: 1.6, note: '2–3 parties, evidence needed' },
  { id: 'complex', label: 'Opposing Counsel / Appeal', mult: 2.3, note: 'Institutional opposition' },
]

const LOCATION_TIERS = [
  { id: 'metro', label: 'Metro (Delhi, Mumbai, BLR)', mult: 1.25 },
  { id: 'tier2', label: 'Tier-2 City', mult: 1.0 },
  { id: 'district', label: 'District / Local Town', mult: 0.85 },
]

const URGENCY_TIERS = [
  { id: 'standard', label: 'Standard (4–6 days)', mult: 1.0 },
  { id: 'priority', label: 'Priority (48 hours)', mult: 1.3 },
  { id: 'urgent', label: 'Urgent (Same-day)', mult: 1.6 },
]

// ── LIVE CASE TRACKER SIMULATOR DATA ──
const SAMPLE_DOCKETS = [
  {
    cn: 'CS/1147/2025',
    title: 'Sharma Traders v. Anand Enterprises',
    court: 'Saket District Court, New Delhi',
    stage: 'Evidence Stage — 4 Witnesses',
    next: '14 Mar 2026, 10:30 AM',
    progress: 62,
    status: 'ON TRACK',
    statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    adv: 'Adv. Suresh Patel',
    docs: '18 encrypted files'
  },
  {
    cn: 'FA/889/2025',
    title: 'Mehta v. Mehta (Maintenance Appeal)',
    court: 'Bombay High Court, Bench 7',
    stage: 'Final Arguments',
    next: '02 Apr 2026, 02:00 PM',
    progress: 88,
    status: 'ATTENTION REQUIRED',
    statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    adv: 'Adv. Priya Mehta',
    docs: '24 encrypted files'
  },
  {
    cn: 'CC/33/2026',
    title: 'Krishnan v. Unknown (Cyber Fraud & Phishing)',
    court: 'Cyber Crime Police Cell — Bengaluru',
    stage: 'Investigation & FIR Filing',
    next: 'Acknowledgement & Notice Issued',
    progress: 30,
    status: 'FILED & ACTIVE',
    statusColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    adv: 'Adv. Vikram Joshi',
    docs: '9 encrypted files'
  },
  {
    cn: 'CP/561/2025',
    title: 'Iyer v. Skyrise Builders (RERA Possession)',
    court: 'MahaRERA Tribunal, Mumbai',
    stage: 'Order Reserved for Judgment',
    next: 'Final Order Awaited',
    progress: 95,
    status: 'ORDER PENDING',
    statusColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    adv: 'Adv. Rahul Deshmukh',
    docs: '31 encrypted files'
  }
]

export default function Home() {
  const { user, role } = useAuth()

  // Database & Local State
  const [dbLawyers, setDbLawyers] = useState<any[]>([])
  const [selectedPractice, setSelectedPractice] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  
  // Interactive Fee Calculator State
  const [calcType, setCalcType] = useState('cheque')
  const [calcComplexity, setCalcComplexity] = useState('simple')
  const [calcLocation, setCalcLocation] = useState('metro')
  const [calcUrgency, setCalcUrgency] = useState('standard')

  // Interactive Case Tracker State
  const [activeDocketIndex, setActiveDocketIndex] = useState(0)

  // Interactive Case Submission Wizard State
  const [wizardStep, setWizardStep] = useState(1)
  const [wizardData, setWizardData] = useState({
    category: 'Criminal Law',
    title: '',
    description: '',
    city: 'New Delhi',
    urgency: 'Priority (48h)',
    clientName: '',
    clientEmail: '',
    clientPhone: ''
  })
  const [wizardSubmitted, setWizardSubmitted] = useState(false)

  // Consultation Booking Modal
  const [bookingLawyer, setBookingLawyer] = useState<any | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Contact Form State
  const [contactTopic, setContactTopic] = useState('General enquiry')
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactSent, setContactSent] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    supabase.from('lawyers').select('*').order('rating', { ascending: false })
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          setDbLawyers(data)
        }
      })
  }, [])

  // Combine initial verified lawyers with database records
  const allLawyers = useMemo(() => {
    const combined = [...INITIAL_LAWYERS]
    dbLawyers.forEach(dbl => {
      if (!combined.some(l => l.name.toLowerCase() === dbl.name?.toLowerCase())) {
        combined.push({
          id: dbl.id || `db-${Math.random()}`,
          name: dbl.name || 'Advocate',
          initials: dbl.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'AD',
          practice: dbl.specialty || 'General Practice',
          area: dbl.specialty?.toLowerCase().includes('crim') ? 'criminal' : 
                dbl.specialty?.toLowerCase().includes('fam') ? 'family' :
                dbl.specialty?.toLowerCase().includes('corp') ? 'corporate' :
                dbl.specialty?.toLowerCase().includes('prop') ? 'property' :
                dbl.specialty?.toLowerCase().includes('cyber') ? 'cyber' : 'civil',
          city: dbl.city || 'India',
          exp: dbl.experience_years || 8,
          rating: dbl.rating || 4.8,
          reviews: 86,
          fee: dbl.fee || 3000,
          languages: ['English', 'Hindi'],
          courts: ['District Court', 'High Court'],
          bio: dbl.bio || 'Verified advocate providing consultation, case representation, and drafting.',
          verified: true,
          availability: 'Available Today',
          success: 90
        })
      }
    })
    return combined
  }, [dbLawyers])

  // Filtered & Sorted Lawyers
  const filteredLawyers = useMemo(() => {
    return allLawyers
      .filter(l => {
        const matchesPractice = selectedPractice === 'all' || l.area === selectedPractice
        const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              l.practice.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              l.city.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesPractice && matchesSearch
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating
        if (sortBy === 'exp') return b.exp - a.exp
        if (sortBy === 'fee') return a.fee - b.fee
        if (sortBy === 'success') return b.success - a.success
        return 0
      })
  }, [allLawyers, selectedPractice, searchQuery, sortBy])

  // Calculated Legal Fee
  const calculatedFee = useMemo(() => {
    const caseObj = CASE_TYPES.find(c => c.id === calcType) || CASE_TYPES[0]
    const compObj = COMPLEXITY_LEVELS.find(c => c.id === calcComplexity) || COMPLEXITY_LEVELS[0]
    const locObj = LOCATION_TIERS.find(l => l.id === calcLocation) || LOCATION_TIERS[0]
    const urgObj = URGENCY_TIERS.find(u => u.id === calcUrgency) || URGENCY_TIERS[0]

    const base = caseObj.base * compObj.mult * locObj.mult * urgObj.mult
    const min = Math.round((base * 0.9) / 500) * 500
    const max = Math.round((base * 1.25) / 500) * 500
    const estDays = Math.round(caseObj.days * (calcComplexity === 'complex' ? 1.4 : calcComplexity === 'moderate' ? 1.15 : 0.9))

    return { min, max, days: estDays, name: caseObj.label }
  }, [calcType, calcComplexity, calcLocation, calcUrgency])

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactForm.name || !contactForm.email || !contactForm.message) return
    const subject = encodeURIComponent(`LegalNexus [${contactTopic}] from ${contactForm.name}`)
    const body = encodeURIComponent(`Topic: ${contactTopic}\nName: ${contactForm.name}\nEmail: ${contactForm.email}\n\nMessage:\n${contactForm.message}`)
    window.open(`mailto:support@legalnexus.in?subject=${subject}&body=${body}`, '_blank')
    setContactSent(true)
    setContactForm({ name: '', email: '', message: '' })
    setTimeout(() => setContactSent(false), 4500)
  }

  const handleBookConsultation = () => {
    setBookingSuccess(true)
    setTimeout(() => {
      setBookingSuccess(false)
      setBookingLawyer(null)
    }, 2500)
  }

  return (
    <div className="min-h-screen bg-[#060a14] text-[#eaf0fb] selection:bg-[#5b86ff] selection:text-white font-sans antialiased overflow-x-hidden" data-theme="midnight">

      {/* ── STICKY TOP NAVIGATION ── */}
      <nav className="sticky top-0 z-50 bg-[#060a14]/90 backdrop-blur-xl border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <img
              src="/logo.jpg"
              alt="LegalNexus Logo"
              className="w-14 h-14 object-contain rounded-2xl group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="flex items-center">
              <span className="text-xl font-extrabold tracking-tight font-display bg-gradient-to-r from-[#5b86ff] via-[#c084fc] to-[#efb75a] bg-clip-text text-transparent drop-shadow-sm">LegalNexus</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {[
              { label: 'How It Works', href: '#how' },
              { label: 'Features', href: '#features' },
              { label: 'Fee Estimator', href: '#calculator' },
              { label: 'Case Tracker', href: '#tracker' },
              { label: 'Advocates', href: '#directory' },
              { label: 'FAQ', href: '#faq' },
              { label: 'Contact', href: '#contact' },
            ].map(l => (
              <a
                key={l.label}
                href={l.href}
                className="text-xs font-semibold text-[#93a1c2] hover:text-white transition-colors py-2"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA & Actions */}
          <div className="hidden sm:flex items-center shrink-0">
            <Link
              to={user ? (role === 'admin' ? '/admin' : role === 'lawyer' ? '/lawyer' : '/client') : '/auth'}
              className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#5b86ff] to-[#3a68ea] rounded-xl shadow-[0_0_25px_rgba(91,134,255,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>{user ? 'Dashboard' : 'Log In'}</span>
              <span>→</span>
            </Link>
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/[0.05] border border-white/10 text-white"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full inset-x-4 bg-[#0d1424] border border-white/15 rounded-2xl p-5 shadow-2xl z-50 mt-2 space-y-3 anim-float">
            <div className="space-y-1">
              {[
                { label: 'How It Works', href: '#how' },
                { label: 'Features', href: '#features' },
                { label: 'Fee Estimator', href: '#calculator' },
                { label: 'Case Tracker', href: '#tracker' },
                { label: 'Find a Lawyer', href: '#directory' },
                { label: 'Submit Case Brief', href: '#submit' },
                { label: 'FAQ', href: '#faq' },
                { label: 'Contact Support', href: '#contact' },
              ].map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-[#eaf0fb] hover:bg-white/10 transition"
                >
                  <span>{item.label}</span>
                  <span className="text-[#5b86ff]">→</span>
                </a>
              ))}
            </div>
            <div className="pt-3 border-t border-white/10">
              <Link
                to={user ? (role === 'admin' ? '/admin' : role === 'lawyer' ? '/lawyer' : '/client') : '/auth'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block text-center py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#5b86ff] to-[#3a68ea] rounded-xl shadow-lg"
              >
                {user ? 'Go to Dashboard →' : 'Log In →'}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── 1. HERO SECTION ── */}
      <section id="top" className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Glowing Orbs & Background Grid */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 w-[42rem] h-[42rem] rounded-full bg-[radial-gradient(circle,rgba(91,134,255,0.25),transparent_65%)] blur-3xl anim-drift" />
          <div className="absolute -right-32 top-24 w-[34rem] h-[34rem] rounded-full bg-[radial-gradient(circle,rgba(239,183,90,0.18),transparent_65%)] blur-3xl anim-drift" style={{ animationDelay: '-7s' }} />
          <div className="absolute inset-0 grid-bg opacity-50 [mask-image:radial-gradient(120%_90%_at_50%_0%,#000_20%,transparent_80%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            
            {/* Left Hero Content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-md mb-6">
                <span className="text-[#efb75a] text-sm">🏛️</span>
                <span className="eyebrow text-[#93a1c2] text-[11px]">India's Legal Intelligence Platform</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-[4.2rem] font-extrabold leading-[1.05] tracking-tight font-display text-white">
                Find the right lawyer.<br />
                <span className="text-gradient">Resolve your case fast.</span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-[#93a1c2] max-w-xl leading-relaxed">
                Connect with bar-verified advocates, submit your case online, and follow every hearing date in one encrypted workspace — transparent guidance across 640+ courts in India.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <a
                  href="#submit"
                  className="px-8 py-3.5 bg-gradient-to-r from-[#5b86ff] to-[#3662e3] text-white rounded-2xl font-bold text-sm shadow-[0_10px_30px_rgba(91,134,255,0.4)] hover:brightness-110 active:scale-98 transition-all flex items-center gap-2"
                >
                  <span>Submit a Case</span>
                  <span>→</span>
                </a>
                <a
                  href="#directory"
                  className="px-8 py-3.5 bg-white/[0.05] border border-white/15 text-[#eaf0fb] hover:text-white rounded-2xl font-semibold text-sm hover:bg-white/[0.08] transition-all flex items-center gap-2"
                >
                  <span>🔍</span>
                  <span>Find a Lawyer</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#93a1c2]">
                {['Free Case Brief', 'No Hidden Fees', 'Fee Held in Escrow', 'Bar Council Verified'].map(item => (
                  <span key={item} className="inline-flex items-center gap-1.5 font-medium">
                    <span className="text-[#4ade9b]">✓</span>
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Right AI Intelligence Visual Showcase */}
            <div className="relative anim-float">
              <div className="absolute -inset-6 rounded-3xl bg-[radial-gradient(circle_at_40%_30%,rgba(91,134,255,0.35),transparent_65%)] blur-2xl pointer-events-none" />
              <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-full bg-[#efb75a]/15 blur-3xl pointer-events-none" />
              
              <div className="relative group overflow-hidden rounded-3xl border border-white/15 bg-[#101827]/90 p-3.5 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:border-white/25">
                
                {/* AI Image Container */}
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src="/ai_legal_hero.jpg"
                    alt="AI Legal Intelligence Platform"
                    className="w-full h-auto object-cover rounded-2xl transform transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b101b]/90 via-transparent to-black/20 pointer-events-none" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b101b]/80 border border-white/15 backdrop-blur-md shadow-lg">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5b86ff]"></span>
                    </span>
                    <span className="text-[11px] font-semibold text-white tracking-wide uppercase font-mono">
                      AI Legal Intelligence
                    </span>
                  </div>

                  {/* Top Right Accuracy Badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-[#efb75a]/20 text-[#efb75a] border border-[#efb75a]/40 backdrop-blur-md">
                    ⚡ Neural Precedent Match
                  </div>

                  {/* Bottom Info Bar Overlay */}
                  <div className="absolute bottom-3 inset-x-3 p-3 rounded-xl bg-[#0b101b]/85 border border-white/10 backdrop-blur-md flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5b86ff]/30 to-[#3662e3]/30 border border-[#5b86ff]/40 flex items-center justify-center text-sm">
                        ⚖️
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white font-display">Automated Case Analysis</p>
                        <p className="text-[10px] text-[#93a1c2]">640+ Indian Courts & Tribunals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#4ade9b]/15 text-[#4ade9b] border border-[#4ade9b]/30">
                        ACTIVE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Highlight Badges */}
                <div className="mt-3 grid grid-cols-2 gap-2.5 px-1 pb-0.5">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[#5b86ff] text-xs">🔒</span>
                    <span className="text-[11px] font-medium text-[#c4d1eb]">AES-256 Vault Synced</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[#efb75a] text-xs">🛡️</span>
                    <span className="text-[11px] font-medium text-[#c4d1eb]">Escrow Protected</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* 4 Pillar Stat Counter Banner */}
          <div className="mt-16 sm:mt-20 grid grid-cols-2 md:grid-cols-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
            {[
              { val: '8+', label: 'Verified Lawyers', desc: 'Bar-council certified' },
              { val: '50+', label: 'Cases Handled', desc: 'Across 640+ courts' },
              { val: '24/7', label: 'Support Available', desc: 'Docket-synced updates' },
              { val: '100%', label: 'Confidentiality', desc: 'AES-256 encrypted vault' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`p-6 sm:p-7 border-b border-r border-white/10 hover:bg-white/[0.03] transition-colors ${
                  i % 2 === 1 ? 'border-r-0 md:border-r' : ''
                } ${i === 3 ? 'md:border-r-0' : ''}`}
              >
                <p className="text-3xl sm:text-4xl font-extrabold font-display text-white">{stat.val}</p>
                <p className="mt-1.5 text-sm font-bold text-[#eaf0fb]">{stat.label}</p>
                <p className="text-xs text-[#6b7799] mt-0.5">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. TRUST MARQUEE TICKER ── */}
      <div className="relative overflow-hidden border-y border-white/[0.08] bg-[#0d1426]/70 py-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#060a14] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#060a14] to-transparent" />
        
        <div className="anim-marquee flex items-center gap-10">
          {[
            'Advocate Verified',
            'Milestone Fee Escrow',
            'AES-256 Encrypted Vault',
            'Live Cause-List Sync',
            '640+ District & High Courts',
            'No Data Resale',
            'Free Case Brief Submission',
            'Transparent Fixed Quotes',
            'Advocate Verified',
            'Milestone Fee Escrow',
            'AES-256 Encrypted Vault',
            'Live Cause-List Sync',
            '640+ District & High Courts',
            'No Data Resale',
            'Free Case Brief Submission',
            'Transparent Fixed Quotes',
          ].map((item, idx) => (
            <span key={idx} className="flex items-center gap-3 text-xs font-mono tracking-wider uppercase text-[#93a1c2] whitespace-nowrap">
              <span>{item}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#efb75a]" />
            </span>
          ))}
        </div>
      </div>

      {/* ── 3. HOW IT WORKS ── */}
      <section id="how" className="py-12 sm:py-16 relative border-b border-white/[0.08] bg-[#0a1020]/60">
        <div aria-hidden="true" className="absolute inset-0 dot-bg opacity-40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
            <span className="eyebrow text-[#5b86ff]">Process Overview</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white mt-2 mb-4 tracking-tight">
              Get legal help in <span className="text-gradient">four simple steps</span>
            </h2>
            <p className="text-[#93a1c2] text-sm sm:text-base">
              Transparent, fast, and structured legal assistance — from first brief to final court order.
            </p>
          </div>

          {/* 4 Process Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                icon: '👤',
                title: 'Create Account',
                body: 'Sign up as a client in under 60 seconds with simple OTP authentication. No upfront fees required.'
              },
              {
                num: '02',
                icon: '🔍',
                title: 'Find a Lawyer',
                body: 'Browse verified advocates by practice area, court jurisdiction, experience, client ratings, and fee.'
              },
              {
                num: '03',
                icon: '📋',
                title: 'Submit Case Details',
                body: 'Fill a structured brief and securely upload evidence documents directly to your encrypted vault.'
              },
              {
                num: '04',
                icon: '✅',
                title: 'Track Hearings',
                body: 'Receive real-time cause-list updates, case milestone alerts, and next hearing date reminders.'
              }
            ].map((step, idx) => (
              <div
                key={step.num}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-7 transition-all duration-300 hover:-translate-y-2 hover:border-[#5b86ff]/40 hover:shadow-2xl"
              >
                <span className="absolute -right-4 -top-6 font-display text-7xl font-extrabold text-white/[0.03] group-hover:text-[#5b86ff]/10 transition-colors">
                  {step.num}
                </span>
                
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#5b86ff] to-[#24398f] text-white flex items-center justify-center text-2xl shadow-lg mb-5 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>

                <span className="eyebrow text-[#5b86ff]">Step {step.num}</span>
                <h3 className="text-lg font-bold text-white mt-1 mb-2.5">{step.title}</h3>
                <p className="text-xs sm:text-sm text-[#93a1c2] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>

          {/* Benchmark Banner */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <p className="text-sm text-[#93a1c2]">
              <span className="font-semibold text-white">Average response time to first consultation:</span>{' '}
              <span className="font-mono text-[#efb75a] font-bold">38 hours</span> across all verified matters.
            </p>
            <a
              href="#submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#5b86ff] hover:bg-[#4975f2] rounded-xl transition shadow-md whitespace-nowrap"
            >
              Start Free Case Brief →
            </a>
          </div>

        </div>
      </section>

      {/* ── 4. WHY LEGALNEXUS / 6 CAPABILITIES ── */}
      <section id="features" className="py-12 sm:py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="eyebrow text-[#5b86ff]">Why LegalNexus</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white mt-2 tracking-tight">
                Built for how legal matters <br className="hidden sm:inline" />
                <span className="text-gradient">actually move</span>
              </h2>
            </div>
            <div className="flex gap-3">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-[#efb75a]/10 text-[#efb75a] border border-[#efb75a]/30">
                🔒 No Data Resale
              </span>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-[#5b86ff]/10 text-[#5b86ff] border border-[#5b86ff]/30">
                ⚡ 640+ Courts Synced
              </span>
            </div>
          </div>

          {/* 6 Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🔍',
                tag: 'AI Assisted',
                title: 'Expert Lawyer Matching',
                desc: 'Describe your dispute once — our smart matching engine shortlists advocate profiles by court jurisdiction, specialty, and historical win rate.'
              },
              {
                icon: '📅',
                tag: 'Real Time',
                title: 'Live Hearing Tracker',
                desc: 'Stay ahead of your court cause list. Automatic hearing date alerts, case stage progress, and WhatsApp/email reminders 48 hours prior.'
              },
              {
                icon: '🔒',
                tag: 'AES-256',
                title: 'Encrypted & Confidential',
                desc: 'End-to-end client confidentiality. Case briefs and evidence uploads are encrypted with strictly privileged advocate access control.'
              },
              {
                icon: '🛡️',
                tag: 'Milestone Escrow',
                title: 'Transparent Fee Escrow',
                desc: 'Funds are securely deposited in escrow and only released to your assigned advocate when milestone deliverables you approve are met.'
              },
              {
                icon: '📊',
                tag: '12 Min Report',
                title: 'Case Strength Assessment',
                desc: 'Gain a plain-language preliminary analysis on court precedents, expected timelines, and realistic legal outcomes before spending money.'
              },
              {
                icon: '💬',
                tag: 'Unified Thread',
                title: 'Single Secure Workspace',
                desc: 'Keep messages, draft pleadings, invoice receipts, and court orders in one structured chronological timeline. No WhatsApp clutter.'
              }
            ].map((cap, i) => (
              <article
                key={cap.title}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-2xl hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl">{cap.icon}</span>
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-semibold text-[#5b86ff] bg-[#5b86ff]/10 border border-[#5b86ff]/25 rounded-md">
                    {cap.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{cap.title}</h3>
                <p className="text-xs sm:text-sm text-[#93a1c2] leading-relaxed">{cap.desc}</p>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* ── 5. INTERACTIVE LEGAL FEE ESTIMATOR ── */}
      <section id="calculator" className="py-12 sm:py-16 relative border-y border-white/[0.08] bg-[#0a1020]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="eyebrow text-[#efb75a]">Pricing Transparency</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white mt-2 mb-3 tracking-tight">
              Interactive <span className="text-gradient-gold">Legal Fee Calculator</span>
            </h2>
            <p className="text-[#93a1c2] text-sm sm:text-base">
              Estimate advocate consultation and litigation expenses based on real Indian court benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Calculator Inputs (8 cols) */}
            <div className="lg:col-span-7 space-y-6 rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8 backdrop-blur-xl">
              
              {/* 1. Case Category */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#93a1c2] mb-3">
                  1. Select Dispute Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CASE_TYPES.map(ct => (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => setCalcType(ct.id)}
                      className={`text-left px-3.5 py-3 rounded-xl border text-xs font-semibold transition-all ${
                        calcType === ct.id
                          ? 'bg-[#5b86ff]/20 border-[#5b86ff] text-white shadow-[0_0_15px_rgba(91,134,255,0.3)]'
                          : 'bg-white/[0.02] border-white/10 text-[#93a1c2] hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      {ct.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Complexity */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#93a1c2] mb-3">
                  2. Dispute Complexity
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {COMPLEXITY_LEVELS.map(cmp => (
                    <button
                      key={cmp.id}
                      type="button"
                      onClick={() => setCalcComplexity(cmp.id)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all ${
                        calcComplexity === cmp.id
                          ? 'bg-[#efb75a]/20 border-[#efb75a] text-white'
                          : 'bg-white/[0.02] border-white/10 text-[#93a1c2] hover:bg-white/[0.05]'
                      }`}
                    >
                      <p className="font-bold text-white mb-0.5">{cmp.label}</p>
                      <p className="text-[10px] text-[#93a1c2]">{cmp.note}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Location & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#93a1c2] mb-2.5">
                    3. Jurisdiction Location
                  </label>
                  <select
                    value={calcLocation}
                    onChange={e => setCalcLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101827] border border-white/15 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#5b86ff]"
                  >
                    {LOCATION_TIERS.map(loc => (
                      <option key={loc.id} value={loc.id} className="bg-[#101827] text-white">
                        {loc.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#93a1c2] mb-2.5">
                    4. Response Urgency
                  </label>
                  <select
                    value={calcUrgency}
                    onChange={e => setCalcUrgency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#101827] border border-white/15 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#5b86ff]"
                  >
                    {URGENCY_TIERS.map(urg => (
                      <option key={urg.id} value={urg.id} className="bg-[#101827] text-white">
                        {urg.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Calculated Fee Breakdown Card (5 cols) */}
            <div className="lg:col-span-5 rounded-3xl border border-white/15 bg-gradient-to-br from-[#101827] to-[#0d1426] p-7 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#efb75a]/10 blur-2xl pointer-events-none" />

              <span className="eyebrow text-[#efb75a]">Estimated Fee Range</span>
              <p className="text-xs text-[#93a1c2] mt-1 mb-4">{calculatedFee.name}</p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl sm:text-4xl font-extrabold font-display text-white">
                  ₹{calculatedFee.min.toLocaleString('en-IN')}
                </span>
                <span className="text-xl text-[#93a1c2]">to</span>
                <span className="text-3xl sm:text-4xl font-extrabold font-display text-gradient-gold">
                  ₹{calculatedFee.max.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="space-y-3.5 border-y border-white/10 py-5 text-xs">
                <div className="flex justify-between items-center text-[#93a1c2]">
                  <span>Typical Duration:</span>
                  <span className="font-mono font-bold text-white">{calculatedFee.days} Days Average</span>
                </div>
                <div className="flex justify-between items-center text-[#93a1c2]">
                  <span>Advocate Milestone Escrow:</span>
                  <span className="font-semibold text-emerald-400">Supported (100% Protected)</span>
                </div>
                <div className="flex justify-between items-center text-[#93a1c2]">
                  <span>Platform Fee:</span>
                  <span className="font-semibold text-white">Included (No Surprise Charges)</span>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="#submit"
                  className="w-full block text-center py-3.5 bg-gradient-to-r from-[#efb75a] to-[#d4993a] text-[#1a1206] font-extrabold text-xs sm:text-sm rounded-xl shadow-lg hover:brightness-105 active:scale-98 transition"
                >
                  Lock This Estimate & Get Matched →
                </a>
                <p className="text-[11px] text-center text-[#6b7799] mt-2.5">
                  Quotes are validated against state bar benchmarks before filing.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── 6. INTERACTIVE CASE TRACKER SIMULATION ── */}
      <section id="tracker" className="py-12 sm:py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="eyebrow text-[#5b86ff]">Cause-List Integration</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white mt-2 mb-3 tracking-tight">
              Live <span className="text-gradient">Case Docket Tracker</span>
            </h2>
            <p className="text-[#93a1c2] text-sm sm:text-base">
              Explore how clients follow real-time cause lists, orders, and hearings in one encrypted interface.
            </p>
          </div>

          {/* Docket Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
            {SAMPLE_DOCKETS.map((doc, idx) => (
              <button
                key={doc.cn}
                type="button"
                onClick={() => setActiveDocketIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  activeDocketIndex === idx
                    ? 'bg-[#5b86ff] text-white shadow-[0_0_15px_rgba(91,134,255,0.4)]'
                    : 'bg-white/[0.04] border border-white/10 text-[#93a1c2] hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                {doc.cn}
              </button>
            ))}
          </div>

          {/* Active Docket View Card */}
          {SAMPLE_DOCKETS[activeDocketIndex] && (() => {
            const activeDoc = SAMPLE_DOCKETS[activeDocketIndex]
            return (
              <div className="max-w-4xl mx-auto rounded-3xl border border-white/15 bg-[#101827]/95 p-7 sm:p-10 shadow-2xl backdrop-blur-2xl">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div>
                    <span className="font-mono text-xs text-[#5b86ff] font-bold">{activeDoc.cn}</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">{activeDoc.title}</h3>
                    <p className="text-xs sm:text-sm text-[#93a1c2] mt-1">{activeDoc.court}</p>
                  </div>
                  <span className={`self-start sm:self-center px-3.5 py-1.5 rounded-full text-xs font-bold border ${activeDoc.statusColor}`}>
                    {activeDoc.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-[11px] font-mono uppercase text-[#6b7799]">Current Stage</p>
                    <p className="text-xs sm:text-sm font-bold text-white mt-1">{activeDoc.stage}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-[11px] font-mono uppercase text-[#6b7799]">Next Listing</p>
                    <p className="text-xs sm:text-sm font-bold text-[#efb75a] mt-1">{activeDoc.next}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-[11px] font-mono uppercase text-[#6b7799]">Lead Advocate</p>
                    <p className="text-xs sm:text-sm font-bold text-white mt-1">{activeDoc.adv}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between items-center text-xs text-[#93a1c2] mb-2">
                    <span>Litigation Milestone Progress</span>
                    <span className="font-mono font-bold text-[#5b86ff]">{activeDoc.progress}% Completed</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#5b86ff] to-[#efb75a] rounded-full transition-all duration-700"
                      style={{ width: `${activeDoc.progress}%` }}
                    />
                  </div>
                </div>

                {/* Quick Interactive Actions */}
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-[#93a1c2] flex items-center gap-2">
                    <span>📁</span>
                    <span>{activeDoc.docs}</span>
                  </span>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => alert(`Next hearing reminder scheduled for ${activeDoc.next}`)}
                      className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-xs font-semibold text-white rounded-xl transition"
                    >
                      🔔 Set Reminder
                    </button>
                    <a
                      href="#contact"
                      className="px-4 py-2 bg-[#5b86ff] hover:bg-[#4975f2] text-xs font-bold text-white rounded-xl transition shadow-md"
                    >
                      💬 Message Advocate
                    </a>
                  </div>
                </div>

              </div>
            )
          })()}

        </div>
      </section>

      {/* ── 7. VERIFIED LAWYER DIRECTORY ── */}
      <section id="directory" className="py-12 sm:py-16 relative border-t border-white/[0.08] bg-[#0a1020]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="eyebrow text-[#5b86ff]">Verified Directory</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white mt-2 tracking-tight">
                Meet Bar-Certified <span className="text-gradient">Advocates</span>
              </h2>
              <p className="text-[#93a1c2] text-xs sm:text-sm mt-2">
                Browse verified advocates across India with verified enrollment and transparent fees.
              </p>
            </div>

            {/* Sort & Search Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Search lawyer, city, specialty..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="px-4 py-2 bg-[#101827] border border-white/15 rounded-xl text-xs text-white placeholder:text-[#6b7799] focus:outline-none focus:border-[#5b86ff]"
              />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3.5 py-2 bg-[#101827] border border-white/15 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#5b86ff]"
              >
                <option value="rating">Top Rated ⭐</option>
                <option value="exp">Most Experienced</option>
                <option value="fee">Lowest Fee First</option>
                <option value="success">Highest Win Rate</option>
              </select>
            </div>
          </div>

          {/* Practice Area Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-10">
            {[
              { id: 'all', label: 'All Practices' },
              { id: 'criminal', label: 'Criminal Law' },
              { id: 'family', label: 'Family & Divorce' },
              { id: 'corporate', label: 'Corporate & Tax' },
              { id: 'property', label: 'Property & Real Estate' },
              { id: 'cyber', label: 'Cyber Crime' },
              { id: 'civil', label: 'Civil & Consumer' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedPractice(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedPractice === tab.id
                    ? 'bg-[#5b86ff] text-white shadow-[0_0_15px_rgba(91,134,255,0.35)]'
                    : 'bg-white/[0.03] border border-white/10 text-[#93a1c2] hover:bg-white/[0.07] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Lawyers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLawyers.slice(0, 6).map(lawyer => (
              <div
                key={lawyer.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#101827]/80 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-[#5b86ff]/40 hover:-translate-y-1.5 hover:shadow-2xl"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#5b86ff] to-[#24398f] text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                        {lawyer.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-base text-white">{lawyer.name}</h3>
                          <span className="text-[#4ade9b] text-xs" title="Bar Council Verified">✓</span>
                        </div>
                        <span className="inline-block mt-0.5 text-[11px] font-semibold text-[#5b86ff] bg-[#5b86ff]/10 px-2 py-0.5 rounded-md">
                          {lawyer.practice}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      {lawyer.availability}
                    </span>
                  </div>

                  <p className="text-xs text-[#93a1c2] line-clamp-2 leading-relaxed mb-4">
                    {lawyer.bio}
                  </p>

                  <div className="grid grid-cols-2 gap-2 border-y border-white/[0.08] py-3 my-3 text-[11px] text-[#93a1c2]">
                    <div>
                      <span className="text-[#6b7799]">Experience:</span>{' '}
                      <span className="text-white font-semibold">{lawyer.exp} Years</span>
                    </div>
                    <div>
                      <span className="text-[#6b7799]">City:</span>{' '}
                      <span className="text-white font-semibold">{lawyer.city}</span>
                    </div>
                    <div>
                      <span className="text-[#6b7799]">Rating:</span>{' '}
                      <span className="text-[#efb75a] font-bold">⭐ {lawyer.rating}</span>
                    </div>
                    <div>
                      <span className="text-[#6b7799]">Win Rate:</span>{' '}
                      <span className="text-emerald-400 font-bold">{lawyer.success}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-[#6b7799] block font-mono">Consultation Fee</span>
                    <span className="text-base font-extrabold text-white">₹{lawyer.fee.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingLawyer(lawyer)}
                    className="px-4 py-2 bg-gradient-to-r from-[#5b86ff] to-[#3a68ea] text-white rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition cursor-pointer"
                  >
                    Book Consultation
                  </button>
                </div>

              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="#submit"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-white rounded-2xl font-bold text-xs sm:text-sm transition"
            >
              <span>Submit Case & Receive Up to 3 Matched Quotes</span>
              <span>→</span>
            </a>
          </div>

        </div>
      </section>

      {/* ── 8. INTERACTIVE 3-STEP CASE SUBMISSION WIZARD ── */}
      <section id="submit" className="py-12 sm:py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="eyebrow text-[#efb75a]">Start Your Matter</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white mt-2 mb-3 tracking-tight">
              Submit a Case, <span className="text-gradient">Get Matched Free</span>
            </h2>
            <p className="text-[#93a1c2] text-xs sm:text-sm">
              Three short steps. No upfront fee, no obligation. You decide which advocate to engage.
            </p>
          </div>

          <div className="rounded-3xl border border-white/15 bg-[#101827]/90 p-7 sm:p-10 shadow-2xl backdrop-blur-2xl">

            {/* ── AUTH GATE: Not logged in ── */}
            {!user ? (
              <div className="text-center py-12 space-y-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#5b86ff]/20 to-[#3662e3]/20 border border-[#5b86ff]/30 flex items-center justify-center text-4xl">
                  🔐
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white font-display mb-2">Login Required</h3>
                  <p className="text-sm text-[#93a1c2] max-w-sm mx-auto leading-relaxed">
                    You need to be logged in to submit a case brief. Create a free account or sign in to get matched with verified advocates.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    to="/auth"
                    className="px-8 py-3.5 bg-gradient-to-r from-[#5b86ff] to-[#3a68ea] text-white text-sm font-extrabold rounded-xl shadow-[0_0_25px_rgba(91,134,255,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span>Log In to Submit</span>
                    <span>→</span>
                  </Link>
                  <Link
                    to="/auth"
                    className="px-8 py-3.5 bg-white/[0.06] border border-white/15 text-[#eaf0fb] text-sm font-bold rounded-xl hover:bg-white/[0.1] transition-all"
                  >
                    Create Free Account
                  </Link>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#93a1c2] pt-2">
                  {['Free to Submit', 'No Hidden Fees', 'AES-256 Encrypted', 'Bar Council Verified'].map(item => (
                    <span key={item} className="inline-flex items-center gap-1.5">
                      <span className="text-[#4ade9b]">✓</span>
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Step Indicators */}
                <div className="grid grid-cols-3 gap-2 mb-8 border-b border-white/10 pb-6 text-center">
                  {[
                    { s: 1, label: 'Dispute Details' },
                    { s: 2, label: 'Court & Urgency' },
                    { s: 3, label: 'Client Vault' },
                  ].map(st => (
                    <div key={st.s} className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                          wizardStep === st.s
                            ? 'bg-[#5b86ff] text-white shadow-[0_0_12px_rgba(91,134,255,0.5)]'
                            : wizardStep > st.s
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/10 text-[#93a1c2]'
                        }`}
                      >
                        {wizardStep > st.s ? '✓' : st.s}
                      </div>
                      <span className={`text-xs font-semibold ${wizardStep === st.s ? 'text-white' : 'text-[#6b7799]'}`}>
                        {st.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Confirmation State */}
                {wizardSubmitted ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 text-3xl flex items-center justify-center mx-auto border border-emerald-500/40">
                      ✓
                    </div>
                    <h3 className="text-2xl font-bold text-white font-display">Case Brief Received!</h3>
                    <p className="text-sm text-[#93a1c2] max-w-md mx-auto">
                      We are notifying verified advocates in {wizardData.city}. Expect up to 3 competitive quotes in your portal within 38 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setWizardSubmitted(false)
                        setWizardStep(1)
                      }}
                      className="px-6 py-2.5 bg-white/10 text-white text-xs font-bold rounded-xl hover:bg-white/15 transition mt-2"
                    >
                      Submit Another Brief
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">

                    {/* STEP 1 */}
                    {wizardStep === 1 && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-mono uppercase text-[#93a1c2] mb-2">Practice Area</label>
                          <select
                            value={wizardData.category}
                            onChange={e => setWizardData({ ...wizardData, category: e.target.value })}
                            className="w-full px-4 py-3 bg-[#0a1020] border border-white/15 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#5b86ff]"
                          >
                            <option>Criminal Law & Bails</option>
                            <option>Family & Divorce</option>
                            <option>Corporate & Tax Litigations</option>
                            <option>Property Title & Partition</option>
                            <option>Cyber Crime & Fraud</option>
                            <option>Consumer Forums & Cheque Bounce</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-[#93a1c2] mb-2">Matter Summary</label>
                          <textarea
                            rows={4}
                            placeholder="Briefly describe what happened, opposite party details, and what relief you seek..."
                            value={wizardData.description}
                            onChange={e => setWizardData({ ...wizardData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-[#0a1020] border border-white/15 rounded-xl text-xs text-white placeholder:text-[#6b7799] focus:outline-none focus:border-[#5b86ff] resize-none"
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setWizardStep(2)}
                            disabled={!wizardData.description}
                            className="px-6 py-3 bg-[#5b86ff] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md hover:brightness-110 transition cursor-pointer"
                          >
                            Continue to Step 2 →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2 */}
                    {wizardStep === 2 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono uppercase text-[#93a1c2] mb-2">Court City / State</label>
                            <input
                              type="text"
                              placeholder="e.g. New Delhi / Mumbai"
                              value={wizardData.city}
                              onChange={e => setWizardData({ ...wizardData, city: e.target.value })}
                              className="w-full px-4 py-3 bg-[#0a1020] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#5b86ff]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono uppercase text-[#93a1c2] mb-2">Preferred Urgency</label>
                            <select
                              value={wizardData.urgency}
                              onChange={e => setWizardData({ ...wizardData, urgency: e.target.value })}
                              className="w-full px-4 py-3 bg-[#0a1020] border border-white/15 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#5b86ff]"
                            >
                              <option>Standard (4–6 days)</option>
                              <option>Priority (48 hours)</option>
                              <option>Urgent (Same-day callback)</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <button
                            type="button"
                            onClick={() => setWizardStep(1)}
                            className="px-5 py-2.5 bg-white/5 text-xs font-semibold text-white rounded-xl hover:bg-white/10"
                          >
                            ← Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setWizardStep(3)}
                            disabled={!wizardData.city}
                            className="px-6 py-3 bg-[#5b86ff] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md hover:brightness-110 transition cursor-pointer"
                          >
                            Continue to Step 3 →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3 */}
                    {wizardStep === 3 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono uppercase text-[#93a1c2] mb-2">Your Full Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Rahul Sharma"
                              value={wizardData.clientName}
                              onChange={e => setWizardData({ ...wizardData, clientName: e.target.value })}
                              className="w-full px-4 py-3 bg-[#0a1020] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#5b86ff]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono uppercase text-[#93a1c2] mb-2">Email Address</label>
                            <input
                              type="email"
                              placeholder="rahul@example.com"
                              value={wizardData.clientEmail}
                              onChange={e => setWizardData({ ...wizardData, clientEmail: e.target.value })}
                              className="w-full px-4 py-3 bg-[#0a1020] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#5b86ff]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-[#93a1c2] mb-2">Phone Number (For Cause List Updates)</label>
                          <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={wizardData.clientPhone}
                            onChange={e => setWizardData({ ...wizardData, clientPhone: e.target.value })}
                            className="w-full px-4 py-3 bg-[#0a1020] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#5b86ff]"
                          />
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <button
                            type="button"
                            onClick={() => setWizardStep(2)}
                            className="px-5 py-2.5 bg-white/5 text-xs font-semibold text-white rounded-xl hover:bg-white/10"
                          >
                            ← Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setWizardSubmitted(true)}
                            disabled={!wizardData.clientName || !wizardData.clientEmail}
                            className="px-8 py-3.5 bg-gradient-to-r from-[#5b86ff] to-[#3a68ea] disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-lg hover:brightness-110 transition cursor-pointer"
                          >
                            Submit Brief Securely (AES-256) →
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </>
            )}

          </div>

        </div>
      </section>



      {/* ── 10. FAQ ACCORDION ── */}
      <section id="faq" className="py-12 sm:py-16 relative">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-[#5b86ff]/10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left Column: Heading & Help Card */}
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#5b86ff]/25 bg-[#5b86ff]/10 px-3.5 py-1 backdrop-blur-md mb-4">
                <span className="text-[#5b86ff] text-xs">💬</span>
                <span className="eyebrow text-[#5b86ff] text-[11px]">Common Questions</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-white tracking-tight leading-[1.15]">
                Frequently Asked <br />
                <span className="text-gradient">Questions</span>
              </h2>
              
              <p className="mt-4 text-[#93a1c2] text-sm sm:text-base leading-relaxed">
                Everything you need to know about advocate verification, client confidentiality, milestone escrow, and court coverage across India.
              </p>

              {/* Quick Help Card */}
              <div className="mt-8 p-5 rounded-2xl border border-white/10 bg-[#101827]/80 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5b86ff]/30 to-[#3662e3]/30 border border-[#5b86ff]/40 flex items-center justify-center text-lg shrink-0">
                    💡
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-display">Have a specific question?</h4>
                    <p className="text-xs text-[#93a1c2]">Our legal coordinators are ready to help.</p>
                  </div>
                </div>
                <a
                  href="#contact"
                  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-semibold text-white transition-all flex items-center justify-center gap-2"
                >
                  <span>Contact Support Team</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* Right Column: Accordion Items */}
            <div className="lg:col-span-7 space-y-4">
              {[
                {
                  id: '01',
                  q: 'How are lawyers on LegalNexus verified?',
                  a: 'Every advocate submits their State Bar Council enrolment number, which we validate against official state records, along with court e-filing history and identity documents. Verification badges show verified credentials, and records are reviewed annually.'
                },
                {
                  id: '02',
                  q: 'Is my case information confidential and privileged?',
                  a: 'Yes, 100%. Case documents and communications are protected under client-attorney privilege and encrypted with AES-256 at rest and TLS 1.3 in transit. Access is limited strictly to you and your assigned advocate.'
                },
                {
                  id: '03',
                  q: 'How does the Milestone Fee Escrow work?',
                  a: 'When you accept an advocate quote, the fee is deposited into a secure escrow account. The money is released in tranches only after you approve that specific milestone (e.g. drafting completed, notice served, or court appearance).'
                },
                {
                  id: '04',
                  q: 'Do you cover District Courts or only High Courts?',
                  a: 'Both. LegalNexus integrates docket cause lists across 640+ district courts, 25 High Courts, consumer forums, tribunals (NCLT, RERA), and the Supreme Court across 28 states and union territories in India.'
                },
                {
                  id: '05',
                  q: 'Can I change my assigned lawyer mid-case?',
                  a: 'Yes. Your encrypted case vault, document history, and timeline travel with you, allowing a new verified advocate to take over without losing momentum.'
                },
                {
                  id: '06',
                  q: 'How do I track real-time court hearing updates?',
                  a: 'Once your case is active, our docket sync automatically pulls cause list schedules and order copies from the court registry, notifying you via dashboard and email whenever a new date or order is recorded.'
                }
              ].map((faq) => (
                <details
                  key={faq.id}
                  className="group rounded-2xl border border-white/10 bg-[#101827]/70 p-5 sm:p-6 hover:border-[#5b86ff]/40 hover:bg-[#101827]/90 transition-all open:border-[#5b86ff]/50 open:bg-[#101827]/95 shadow-lg backdrop-blur-md"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden font-bold text-sm sm:text-base text-[#eaf0fb] group-open:text-white focus:outline-none select-none gap-4">
                    <div className="flex items-center gap-3.5">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[#5b86ff] shrink-0">
                        {faq.id}
                      </span>
                      <span className="leading-snug">{faq.q}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 group-hover:border-[#5b86ff]/40 group-open:bg-[#5b86ff]/20 group-open:border-[#5b86ff]/50 flex items-center justify-center shrink-0 transition-all">
                      <span className="text-[#5b86ff] text-lg font-light group-open:rotate-45 transition-transform duration-200">
                        +
                      </span>
                    </div>
                  </summary>
                  <div className="mt-4 pt-4 border-t border-white/[0.08] text-xs sm:text-sm text-[#93a1c2] leading-relaxed pl-9 sm:pl-10">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ── 11. CONTACT & INQUIRY SECTION ── */}
      <section id="contact" className="py-12 sm:py-16 relative border-t border-white/[0.08] bg-[#0a1020]/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            
            {/* Left Contact Details */}
            <div>
              <span className="eyebrow text-[#efb75a]">Direct Support</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white mt-2 mb-4 tracking-tight">
                Ready to resolve your <br />
                <span className="text-gradient">legal matter?</span>
              </h2>
              <p className="text-[#93a1c2] text-sm sm:text-base leading-relaxed mb-8">
                Speak directly with our case coordinators or send us your inquiry. Our support team replies within one business day.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-[#5b86ff]/20 text-[#5b86ff] flex items-center justify-center font-bold text-lg shrink-0">
                    📧
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-[#6b7799]">Email Support</p>
                    <p className="text-sm font-bold text-white">support@legalnexus.in</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-[#efb75a]/20 text-[#efb75a] flex items-center justify-center font-bold text-lg shrink-0">
                    📞
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-[#6b7799]">Helpline Desk</p>
                    <p className="text-sm font-bold text-white">+91 98765 43210 (Mon–Sat, 9AM–6PM IST)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
                    📍
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-[#6b7799]">Headquarters</p>
                    <p className="text-sm font-bold text-white">Barakhamba Road, Connaught Place, New Delhi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Message Form */}
            <div className="rounded-3xl border border-white/15 bg-[#101827] p-7 sm:p-9 shadow-2xl">
              <h3 className="font-display font-extrabold text-xl text-white mb-1">Send a Message</h3>
              <p className="text-xs text-[#93a1c2] mb-5">Select a category and our case counsellor will get back to you.</p>

              {contactSent && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center">
                  ✓ Message sent! Our case coordinator will reach out shortly.
                </div>
              )}

              {/* Inquiry Topic Selection */}
              <div className="flex flex-wrap gap-2 mb-4">
                {['General enquiry', 'Fee question', 'Lawyer verification'].map(topic => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setContactTopic(topic)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      contactTopic === topic
                        ? 'bg-[#5b86ff] text-white'
                        : 'bg-white/5 border border-white/10 text-[#93a1c2] hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#93a1c2] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Kumar"
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a1020] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#5b86ff]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#93a1c2] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="anand@example.com"
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a1020] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#5b86ff]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#93a1c2] mb-1">Message</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="How can we help you?"
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a1020] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#5b86ff] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#5b86ff] to-[#3a68ea] text-white font-bold text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-98 transition cursor-pointer"
                >
                  Dispatch Message →
                </button>
              </form>

            </div>

          </div>

        </div>
      </section>

      {/* ── CONSULTATION BOOKING MODAL ── */}
      {bookingLawyer && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#101827] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setBookingLawyer(null)}
              className="absolute top-5 right-5 text-[#93a1c2] hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            {bookingSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 text-3xl flex items-center justify-center mx-auto border border-emerald-500/40">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-white font-display">Consultation Requested!</h3>
                <p className="text-xs text-[#93a1c2]">
                  {bookingLawyer.name} has been notified. You will receive a calendar confirmation on your registered email.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3.5 mb-5 border-b border-white/10 pb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5b86ff] to-[#24398f] text-white flex items-center justify-center font-bold text-base">
                    {bookingLawyer.initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{bookingLawyer.name}</h3>
                    <p className="text-xs text-[#5b86ff]">{bookingLawyer.practice} · {bookingLawyer.city}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6 text-xs text-[#93a1c2]">
                  <p>🏛️ <strong>Courts:</strong> {bookingLawyer.courts?.join(', ')}</p>
                  <p>⭐ <strong>Rating:</strong> {bookingLawyer.rating} ({bookingLawyer.reviews} verified reviews)</p>
                  <p>💰 <strong>Consultation Fee:</strong> ₹{bookingLawyer.fee} (Milestone Protected)</p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingLawyer(null)}
                    className="w-1/3 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBookConsultation}
                    className="w-2/3 py-2.5 bg-[#5b86ff] hover:bg-[#4975f2] text-white rounded-xl text-xs font-bold transition shadow-lg"
                  >
                    Confirm Consultation Slot
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
