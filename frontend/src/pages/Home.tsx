import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [lawyers, setLawyers] = useState<any[]>([])
  const [cases, setCases] = useState<any[]>([])
  const [review, setReview] = useState({ name: '', location: '', message: '', rating: 5 })
  const [reviews, setReviews] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactSent, setContactSent] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Use Supabase directly for public data — no auth token needed
    supabase.from('lawyers').select('*').order('created_at', { ascending: true })
      .then(({ data }) => setLawyers(Array.isArray(data) ? data : []))
    supabase.from('reviews').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setReviews(Array.isArray(data) ? data : []))
  }, [])

  const submitReview = async () => {
    if (!review.name || !review.message) { setReviewMessage('error'); return }
    setSubmitting(true)
    const { error } = await supabase.from('reviews').insert(review)
    if (!error) {
      setReviewMessage('success')
      setReview({ name: '', location: '', message: '', rating: 5 })
      supabase.from('reviews').select('*').order('created_at', { ascending: false })
        .then(({ data }) => setReviews(Array.isArray(data) ? data : []))
    }
    setSubmitting(false)
    setTimeout(() => setReviewMessage(''), 3500)
  }

  const handleContactSubmit = () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) return
    const subject = encodeURIComponent(`LegalNexus Contact from ${contactForm.name}`)
    const body = encodeURIComponent(`Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\nMessage:\n${contactForm.message}`)
    window.open(`mailto:vedantsathe3107@gmail.com?subject=${subject}&body=${body}`, '_blank')
    setContactSent(true)
    setContactForm({ name: '', email: '', message: '' })
    setTimeout(() => setContactSent(false), 4000)
  }

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%', padding: '12px 16px', boxSizing: 'border-box' as const,
    border: `1.5px solid ${focusedField === field ? '#2563EB' : '#E2E8F0'}`,
    borderRadius: 12, fontSize: 14, color: '#0F172A',
    background: focusedField === field ? '#fff' : '#F8FAFC',
    outline: 'none',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(37,99,235,0.10)' : 'none',
    transition: 'all 0.15s',
  })

  const navLinks = ['Features', 'Lawyers', 'About', 'FAQ', 'Contact']

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">

      {/* ── STICKY TOP NAVIGATION ── */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-decoration-none">
            <div className="w-9 h-9 bg-gradient-to-br from-slate-900 to-blue-600 rounded-xl flex items-center justify-center text-lg text-white shadow-sm">
              ⚖️
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">LegalNexus</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map(l => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                {l}
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/auth"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
            >
              Login
            </Link>
            <Link
              to="/auth"
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-slate-900 to-blue-600 rounded-xl shadow-md hover:opacity-90 transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
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
          <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-fadeIn">
            {navLinks.map(l => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                {l}
              </a>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl bg-slate-50"
              >
                Login
              </Link>
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-slate-900 to-blue-600 rounded-xl shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-16 sm:py-24 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-300 mb-6 sm:mb-8">
            <span>🏛️</span>
            <span>India's Legal Intelligence Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-5">
            Find the Right Lawyer.<br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
              Resolve Your Case.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10">
            Connect with verified lawyers, submit your case online, track hearing dates, and get legal help — all in one place.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center mb-12 sm:mb-16 max-w-md mx-auto sm:max-w-none">
            <Link
              to="/auth"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-900 rounded-xl font-bold text-base hover:bg-slate-100 shadow-lg hover:shadow-xl transition-all text-center"
            >
              Submit a Case →
            </Link>
            <a
              href="#lawyers"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl font-semibold text-base hover:bg-white/20 transition-all text-center"
            >
              Find a Lawyer
            </a>
          </div>

          {/* Stats Bar (Responsive: 2-col on mobile, 4-col on tablet/desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {[
              { num: `${lawyers.length > 0 ? lawyers.length : 10}+`, label: 'Verified Lawyers' },
              { num: `${cases.length > 0 ? cases.length : 50}+`, label: 'Cases Handled' },
              { num: '24/7', label: 'Support Available' },
              { num: '100%', label: 'Confidential' },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white/10 border border-white/15 backdrop-blur-sm rounded-2xl p-4 sm:p-5 text-center"
              >
                <div className="text-2xl sm:text-3xl font-extrabold text-white">{s.num}</div>
                <div className="text-xs sm:text-sm font-medium text-blue-300 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="bg-slate-50 border-b border-slate-100 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-y-3 gap-x-6 sm:gap-x-10 text-slate-600 text-xs sm:text-sm font-medium">
          {[
            { icon: '🔒', text: 'SSL Secured' },
            { icon: '✅', text: 'Verified Lawyers' },
            { icon: '🇮🇳', text: 'Made in India' },
            { icon: '⚡', text: 'Fast Response' },
            { icon: '🛡️', text: '100% Confidential' },
            { icon: '📱', text: 'Mobile Friendly' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-base">{b.icon}</span>
              <span>{b.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">What we offer</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-3 tracking-tight">
              Everything you need for legal help
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Simple, fast, and confidential legal services built for everyone
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: '🔍', title: 'Find Lawyers', desc: 'Browse verified lawyers by specialization, experience, and rating. Find the perfect match for your case.' },
              { icon: '📋', title: 'Submit Cases Online', desc: 'Submit your case details, upload documents, and select a lawyer — all from your phone or laptop.' },
              { icon: '📅', title: 'Track Hearings', desc: 'Never miss a court date. Get real-time updates on your case status and upcoming hearing dates.' },
              { icon: '🔒', title: 'Fully Confidential', desc: 'Your case details are private and secure. Only you and your assigned lawyer can see them.' },
              { icon: '⚖️', title: 'Expert Lawyers', desc: 'All lawyers on LegalNexus are verified professionals with years of experience in their field.' },
              { icon: '📱', title: 'Works Everywhere', desc: 'Access LegalNexus on any device — mobile, tablet, or desktop. Always available when you need it.' },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-7 hover:bg-white hover:border-blue-300 hover:shadow-xl transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-blue-100/80 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Process</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-3 tracking-tight">
              How it works
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Get legal help in 4 simple, transparent steps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', icon: '👤', title: 'Create Account', desc: 'Sign up as a client in seconds. No credit card required.' },
              { step: '02', icon: '🔍', title: 'Find a Lawyer', desc: 'Browse lawyers by specialty and select the right one.' },
              { step: '03', icon: '📋', title: 'Submit Your Case', desc: 'Fill in your case details and upload any documents.' },
              { step: '04', icon: '✅', title: 'Track Progress', desc: 'Monitor your case status and hearing dates in real time.' },
            ].map((s, i) => (
              <div key={i} className="text-center relative">
                <div className="relative inline-block mb-5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-900 to-blue-600 text-white flex items-center justify-center text-2xl shadow-lg mx-auto">
                    {s.icon}
                  </div>
                  <span className="absolute -top-1 -right-2 bg-blue-100 text-blue-700 text-xs font-black px-2 py-0.5 rounded-md shadow-xs">
                    {s.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Our Advantage</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 mb-3 tracking-tight">
              Why choose LegalNexus?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              We make legal help accessible to everyone
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '⚡', title: 'Fast & Easy', desc: 'Submit your case in minutes. No paperwork, no office visits.' },
              { icon: '💰', title: 'Affordable', desc: 'Transparent pricing. Know consultation details before booking.' },
              { icon: '🎓', title: 'Expert Lawyers', desc: 'Only verified, experienced lawyers with proven track records.' },
              { icon: '🔐', title: 'Privacy First', desc: 'Your personal and case information is always kept private.' },
            ].map((w, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-7 text-center hover:bg-white/10 transition-all duration-200"
              >
                <div className="text-4xl mb-4">{w.icon}</div>
                <h3 className="text-base font-bold text-white mb-2">{w.title}</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LAWYERS SECTION ── */}
      <section id="lawyers" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Our Team</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-3 tracking-tight">
              Meet our lawyers
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Verified legal professionals ready to help you
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {lawyers.slice(0, 6).map(l => (
              <div
                key={l.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    {l.profile_image ? (
                      <img src={l.profile_image} alt={l.name} className="w-14 h-14 rounded-full object-cover border-2 border-blue-100 flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-900 to-blue-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                        {l.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{l.name}</h3>
                      <span className="inline-block mt-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                        {l.specialty}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-6 text-xs text-slate-600">
                    {l.experience_years && <p>🏛️ {l.experience_years} years experience</p>}
                    {l.rating && <p>⭐ {l.rating} rating</p>}
                    {l.phone && <p>📞 {l.phone}</p>}
                  </div>
                </div>

                <Link
                  to="/auth"
                  className="w-full text-center py-2.5 px-4 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all duration-150 border border-blue-200 hover:border-blue-600"
                >
                  Book Consultation
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 sm:mt-14">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-slate-900 to-blue-600 text-white rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all"
            >
              <span>View All Lawyers</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRACTICE AREAS ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Expertise</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-3 tracking-tight">
              Practice Areas
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              We cover all major areas of law across India
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: '⚖️', name: 'Criminal Law' },
              { icon: '👨‍👩‍👧', name: 'Family & Divorce' },
              { icon: '🏢', name: 'Corporate Law' },
              { icon: '🏠', name: 'Property Law' },
              { icon: '💻', name: 'Cybercrime' },
              { icon: '📜', name: 'Civil Law' },
            ].map((area, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 text-center hover:border-blue-300 hover:bg-blue-50/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer shadow-xs"
              >
                <div className="text-3xl mb-2">{area.icon}</div>
                <p className="text-xs font-semibold text-slate-800">{area.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Testimonials</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-3 tracking-tight">
              Client Reviews
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              What our clients say about LegalNexus
            </p>
          </div>

          {reviews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 sm:mb-16">
              {reviews.slice(0, 6).map((r: any, i: number) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex gap-1 mb-3">
                      {[...Array(r.rating || 5)].map((_: any, j: number) => (
                        <span key={j} className="text-amber-400 text-sm">⭐</span>
                      ))}
                    </div>
                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed mb-6 italic">
                      "{r.message}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-900 to-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {r.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-slate-900">{r.name}</p>
                      {r.location && <p className="text-[11px] text-slate-400">{r.location}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Review Form Container */}
          <div className="max-w-xl mx-auto bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
            <h3 className="text-xl font-extrabold text-slate-900 text-center mb-1">Share Your Experience</h3>
            <p className="text-xs text-slate-500 text-center mb-6">Help others by sharing your experience with LegalNexus</p>

            {reviewMessage === 'success' && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-xs font-medium text-center mb-5">
                ✅ Review submitted! Thank you.
              </div>
            )}
            {reviewMessage === 'error' && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-xs font-medium text-center mb-5">
                ⚠️ Please fill in your name and review.
              </div>
            )}

            <div className="space-y-4">
              {/* Stack on small screens, 2-col on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Your Name *</label>
                  <input
                    value={review.name}
                    onChange={e => setReview({ ...review, name: e.target.value })}
                    placeholder="John Smith"
                    style={inputStyle('rev-name')}
                    onFocus={() => setFocusedField('rev-name')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Location</label>
                  <input
                    value={review.location}
                    onChange={e => setReview({ ...review, location: e.target.value })}
                    placeholder="Mumbai, India"
                    style={inputStyle('rev-loc')}
                    onFocus={() => setFocusedField('rev-loc')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReview({ ...review, rating: star })}
                      className={`text-2xl transition-transform hover:scale-125 focus:outline-none ${star <= review.rating ? 'opacity-100' : 'opacity-25'}`}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 font-medium ml-2">{review.rating}/5</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Your Review *</label>
                <textarea
                  value={review.message}
                  onChange={e => setReview({ ...review, message: e.target.value })}
                  placeholder="Share your experience with LegalNexus..."
                  rows={4}
                  style={{ ...inputStyle('rev-msg'), resize: 'none' as const }}
                  onFocus={() => setFocusedField('rev-msg')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>

              <button
                type="button"
                onClick={submitReview}
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-slate-900 to-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ── */}
      <section id="about" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">About Us</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-4 tracking-tight">
              About LegalNexus
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base mb-4">
              LegalNexus is India's modern legal intelligence platform, built to make legal help accessible, affordable, and transparent for everyone.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base mb-4">
              We connect clients with verified lawyers across all practice areas — from criminal law to family disputes, property cases to corporate matters.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base mb-8">
              Founded with a mission to democratize legal services in India, we believe everyone deserves access to quality legal help regardless of their location.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { num: `${lawyers.length > 0 ? lawyers.length : 10}+`, label: 'Verified Lawyers' },
                { num: `${cases.length > 0 ? cases.length : 50}+`, label: 'Cases Handled' },
                { num: '10+', label: 'Cities Covered' },
                { num: '4.9★', label: 'Average Rating' },
              ].map((s, i) => (
                <div key={i} className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-center">
                  <div className="text-xl sm:text-2xl font-extrabold text-blue-600">{s.num}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white rounded-3xl p-7 sm:p-10 shadow-xl">
            <h3 className="text-xl sm:text-2xl font-extrabold mb-6 tracking-tight">Our Mission</h3>
            <div className="space-y-6">
              {[
                { icon: '🎯', title: 'Accessible', desc: 'Legal help for everyone, everywhere in India' },
                { icon: '💎', title: 'Transparent', desc: 'Clear pricing, no hidden fees or surprises' },
                { icon: '🤝', title: 'Trustworthy', desc: 'Verified lawyers with proven track records' },
                { icon: '⚡', title: 'Efficient', desc: 'Fast case submission and real-time updates' },
              ].map((m, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {m.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white mb-1">{m.title}</h4>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LEGAL TIPS ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Resources</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-3 tracking-tight">
              Legal Tips & Guide
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Useful information to help you understand your rights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '📋', category: 'Case Filing', title: 'How to file a case in India', desc: 'Learn the step-by-step process of filing a case in Indian courts and what documents you need.' },
              { icon: '⚖️', category: 'Know Your Rights', title: 'Your rights when arrested', desc: 'Every citizen has fundamental rights when arrested. Know what you can and cannot be asked to do.' },
              { icon: '🏠', category: 'Property Law', title: 'Property dispute resolution', desc: 'Property disputes are common in India. Learn how to resolve them legally and efficiently.' },
            ].map((b, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-200">
                <div className="bg-gradient-to-r from-slate-900 to-blue-600 px-6 py-4 flex items-center gap-3 text-white">
                  <span className="text-2xl">{b.icon}</span>
                  <span className="font-semibold text-xs tracking-wide">{b.category}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-base text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">{b.desc}</p>
                  <Link to="/auth" className="text-xs font-bold text-blue-600 hover:underline">
                    Read more →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">FAQ</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-3 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Everything you need to know about LegalNexus
            </p>
          </div>

          <div className="space-y-3">
            {[
              { q: 'How do I find a lawyer on LegalNexus?', a: 'Simply create a free account, go to the Lawyers section, and browse by specialization. You can select a lawyer and submit your case directly.' },
              { q: 'Is my case information confidential?', a: 'Yes, 100%. Your case details are only visible to you and the lawyer assigned to your case. We never share your information with anyone.' },
              { q: 'How much does it cost to use LegalNexus?', a: 'Creating an account is completely free. You only pay the consultation fee of the lawyer you choose, which is clearly shown on their profile.' },
              { q: 'Can I track my case status?', a: 'Yes! Once you submit a case, you can track its status in real time — including hearing dates, lawyer notes, and case updates.' },
              { q: 'How do I submit my case documents?', a: 'When submitting a case, you can upload documents directly from your phone or laptop. We support PDF, DOC, JPG, and PNG formats.' },
              { q: 'Can I change my assigned lawyer?', a: 'Yes, you can contact our support team to reassign your case to a different lawyer if needed.' },
            ].map((faq, i) => (
              <details key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden group">
                <summary className="p-5 font-semibold text-sm sm:text-base cursor-pointer flex justify-between items-center text-slate-900 focus:outline-none select-none">
                  <span>{faq.q}</span>
                  <span className="text-blue-600 text-xl font-light transition-transform group-open:rotate-45 ml-4 flex-shrink-0">+</span>
                </summary>
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Contact</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-3 tracking-tight">
              Contact Us
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              We're here to help you anytime
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Contact Info & Socials */}
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
                <h3 className="font-bold text-base text-slate-900 mb-6">Get in touch</h3>
                <div className="space-y-5">
                  {[
                    { icon: '📧', label: 'Email', value: 'support@legalnexus.in' },
                    { icon: '📞', label: 'Phone', value: '+91 98765 43210' },
                    { icon: '📍', label: 'Address', value: 'Nagpur, Maharashtra, India' },
                    { icon: '🕐', label: 'Working Hours', value: 'Mon–Sat: 9AM – 6PM' },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-3.5">
                      <div className="w-10 h-10 bg-blue-100/80 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                        {c.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{c.label}</p>
                        <p className="font-semibold text-slate-900 text-xs sm:text-sm">{c.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <h3 className="font-bold text-sm text-slate-900 mb-4">Follow us</h3>
                <div className="flex gap-2.5">
                  {[{ l: 'T', name: 'Twitter' }, { l: 'Li', name: 'LinkedIn' }, { l: 'In', name: 'Instagram' }, { l: 'Fb', name: 'Facebook' }].map((s, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs cursor-pointer hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      {s.l}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Message Form */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
              <h3 className="font-bold text-base text-slate-900 mb-6">Send us a message</h3>
              
              {contactSent && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-xs font-medium mb-5">
                  ✅ Message sent! We'll get back to you soon.
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    placeholder="John Smith"
                    value={contactForm.name}
                    onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                    style={inputStyle('c-name')}
                    onFocus={() => setFocusedField('c-name')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@email.com"
                    value={contactForm.email}
                    onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                    style={inputStyle('c-email')}
                    onFocus={() => setFocusedField('c-email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Message</label>
                  <textarea
                    placeholder="How can we help you?"
                    value={contactForm.message}
                    onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                    rows={4}
                    style={{ ...inputStyle('c-msg'), resize: 'none' as const }}
                    onFocus={() => setFocusedField('c-msg')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleContactSubmit}
                  disabled={!contactForm.name || !contactForm.email || !contactForm.message}
                  className="w-full py-3.5 bg-gradient-to-r from-slate-900 to-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
                >
                  Send Message
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA FOOTER BANNER ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 to-blue-950 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 tracking-tight">
            Ready to get legal help?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
            Join thousands of clients who found the right lawyer on LegalNexus. Create your free account today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center max-w-xs sm:max-w-none mx-auto">
            <Link
              to="/auth"
              className="px-8 py-3.5 bg-white text-slate-900 rounded-xl font-bold text-sm sm:text-base hover:bg-slate-100 shadow-lg transition-all"
            >
              Create Free Account
            </Link>
            <Link
              to="/auth"
              className="px-8 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl font-semibold text-sm sm:text-base hover:bg-white/20 transition-all"
            >
              Login →
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}