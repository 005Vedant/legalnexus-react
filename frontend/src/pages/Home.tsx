import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const [lawyers, setLawyers] = useState<any[]>([])
  const [cases, setCases] = useState<any[]>([])
  const [review, setReview] = useState({ name: '', location: '', message: '', rating: 5 })
  const [reviews, setReviews] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')

  useEffect(() => {
    fetch('/api/lawyers').then(r => r.json()).then(d => setLawyers(Array.isArray(d) ? d : []))
    fetch('/api/cases').then(r => r.json()).then(d => setCases(Array.isArray(d) ? d : []))
    fetch('/api/reviews').then(r => r.json()).then(d => setReviews(Array.isArray(d) ? d : [])).catch(() => setReviews([]))
  }, [])

  const submitReview = async () => {
    if (!review.name || !review.message) {
      setReviewMessage('❌ Please fill name and review!')
      return
    }
    setSubmitting(true)
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    })
    if (res.ok) {
      setReviewMessage('✅ Review submitted! Thank you.')
      setReview({ name: '', location: '', message: '', rating: 5 })
      fetch('/api/reviews').then(r => r.json()).then(d => setReviews(Array.isArray(d) ? d : []))
    }
    setSubmitting(false)
    setTimeout(() => setReviewMessage(''), 3000)
  }

  return (
    <div className="min-h-screen bg-white">

      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-xl font-bold text-gray-900">⚖️ LegalNexus</div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition">Features</a>
            <a href="#lawyers" className="text-sm text-gray-600 hover:text-gray-900 transition">Lawyers</a>
            <a href="#about" className="text-sm text-gray-600 hover:text-gray-900 transition">About</a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition">FAQ</a>
            <a href="#contact" className="text-sm text-gray-600 hover:text-gray-900 transition">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition">
              Login
            </Link>
            <Link to="/auth" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-medium transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="inline-block bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            India's Legal Intelligence Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Find the Right Lawyer.<br />
            <span className="text-blue-300">Resolve Your Case.</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with verified lawyers, submit your case online, track hearing dates,
            and get legal help — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/auth" className="px-8 py-3.5 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition text-lg shadow-lg">
              Submit a Case →
            </Link>
            <a href="#lawyers" className="px-8 py-3.5 bg-white/10 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition text-lg">
              Find a Lawyer
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { num: `${lawyers.length}+`, label: 'Verified Lawyers' },
              { num: `${cases.length}+`, label: 'Cases Handled' },
              { num: '24/7', label: 'Support Available' },
              { num: '100%', label: 'Confidential' },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
                <div className="text-3xl font-bold">{s.num}</div>
                <div className="text-blue-200 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-6 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8">
            {[
              { icon: '🔒', text: 'SSL Secured' },
              { icon: '✅', text: 'Verified Lawyers' },
              { icon: '🇮🇳', text: 'Made in India' },
              { icon: '⚡', text: 'Fast Response' },
              { icon: '🛡️', text: '100% Confidential' },
              { icon: '📱', text: 'Mobile Friendly' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-500">
                <span className="text-xl">{b.icon}</span>
                <span className="text-sm font-medium">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need for legal help</h2>
            <p className="text-gray-500 mt-3 text-lg">Simple, fast, and confidential legal services</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🔍', title: 'Find Lawyers', desc: 'Browse verified lawyers by specialization, experience, and rating. Find the perfect match for your case.' },
              { icon: '📋', title: 'Submit Cases Online', desc: 'Submit your case details, upload documents, and select a lawyer — all from your phone or laptop.' },
              { icon: '📅', title: 'Track Hearings', desc: 'Never miss a court date. Get real-time updates on your case status and upcoming hearing dates.' },
              { icon: '🔒', title: 'Fully Confidential', desc: 'Your case details are private and secure. Only you and your assigned lawyer can see them.' },
              { icon: '⚖️', title: 'Expert Lawyers', desc: 'All lawyers on LegalNexus are verified professionals with years of experience.' },
              { icon: '📱', title: 'Works Everywhere', desc: 'Access LegalNexus on any device — mobile, tablet, or desktop. Always available.' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">How it works</h2>
            <p className="text-gray-500 mt-3 text-lg">Get legal help in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', icon: '👤', title: 'Create Account', desc: 'Sign up as a client in seconds. No credit card needed.' },
              { step: '2', icon: '🔍', title: 'Find a Lawyer', desc: 'Browse lawyers by specialty and select the right one.' },
              { step: '3', icon: '📋', title: 'Submit Your Case', desc: 'Fill in your case details and upload any documents.' },
              { step: '4', icon: '✅', title: 'Track Progress', desc: 'Monitor your case status and hearing dates in real time.' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg">
                  {s.step}
                </div>
                <div className="text-4xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Why choose LegalNexus?</h2>
            <p className="text-blue-100 mt-3 text-lg">We make legal help accessible to everyone</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '⚡', title: 'Fast & Easy', desc: 'Submit your case in minutes. No paperwork, no office visits.' },
              { icon: '💰', title: 'Affordable', desc: 'Transparent pricing. Know the consultation fee before booking.' },
              { icon: '🎓', title: 'Expert Lawyers', desc: 'Only verified, experienced lawyers with proven track records.' },
              { icon: '🔐', title: 'Privacy First', desc: 'Your personal and case information is always kept private.' },
            ].map((w, i) => (
              <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition">
                <div className="text-4xl mb-4">{w.icon}</div>
                <h3 className="font-bold text-white text-lg mb-2">{w.title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="lawyers" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Meet our lawyers</h2>
            <p className="text-gray-500 mt-3 text-lg">Verified legal professionals ready to help you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lawyers.slice(0, 6).map(l => (
              <div key={l.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-4">
                  {l.profile_image ? (
                    <img src={l.profile_image} alt={l.name} className="w-14 h-14 rounded-full object-cover border-2 border-blue-100" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                      {l.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">{l.name}</h3>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">{l.specialty}</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                  {l.experience_years && <p>🏛️ {l.experience_years} years experience</p>}
                  {l.rating && <p>⭐ {l.rating} rating</p>}
                  {l.phone && <p>📞 {l.phone}</p>}
                </div>
                <Link to="/auth" className="block text-center py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 border border-blue-200 transition">
                  Book Consultation
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/auth" className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-md">
              View All Lawyers →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Practice Areas</h2>
            <p className="text-gray-500 mt-3 text-lg">We cover all major areas of law</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: '⚖️', name: 'Criminal Law' },
              { icon: '👨‍👩‍👧', name: 'Family & Divorce' },
              { icon: '🏢', name: 'Corporate Law' },
              { icon: '🏠', name: 'Property Law' },
              { icon: '💻', name: 'Cybercrime' },
              { icon: '📜', name: 'Civil Law' },
            ].map((area, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-5 text-center hover:bg-blue-50 hover:border-blue-200 transition cursor-pointer border border-gray-100">
                <div className="text-3xl mb-2">{area.icon}</div>
                <p className="text-sm font-medium text-gray-700">{area.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Client Reviews</h2>
            <p className="text-gray-500 mt-3 text-lg">What our clients say about us</p>
          </div>

          {reviews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {reviews.slice(0, 6).map((r: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(r.rating || 5)].map((_: any, j: number) => (
                      <span key={j} className="text-yellow-400">⭐</span>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">"{r.message}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {r.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                      {r.location && <p className="text-gray-500 text-xs">{r.location}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Share Your Experience</h3>
            <p className="text-gray-500 text-sm text-center mb-6">Help others by sharing your experience with LegalNexus</p>

            {reviewMessage && (
              <div className={`mb-4 p-3 rounded-xl text-sm font-medium text-center ${
                reviewMessage.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {reviewMessage}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Your Name *</label>
                  <input
                    value={review.name}
                    onChange={e => setReview({ ...review, name: e.target.value })}
                    placeholder="John Smith"
                    className="w-full mt-1 p-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <input
                    value={review.location}
                    onChange={e => setReview({ ...review, location: e.target.value })}
                    placeholder="Mumbai, India"
                    className="w-full mt-1 p-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Rating</label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setReview({ ...review, rating: star })}
                      className={`text-2xl transition ${star <= review.rating ? 'opacity-100' : 'opacity-30'}`}>
                      ⭐
                    </button>
                  ))}
                  <span className="text-sm text-gray-500 ml-2 self-center">{review.rating}/5</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Your Review *</label>
                <textarea
                  value={review.message}
                  onChange={e => setReview({ ...review, message: e.target.value })}
                  placeholder="Share your experience with LegalNexus..."
                  className="w-full mt-1 p-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-none"
                />
              </div>

              <button
                onClick={submitReview}
                disabled={submitting}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">About LegalNexus</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                LegalNexus is India's modern legal intelligence platform, built to make legal help
                accessible, affordable, and transparent for everyone.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                We connect clients with verified lawyers across all practice areas — from criminal law
                to family disputes, property cases to corporate matters.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Founded with a mission to democratize legal services in India, we believe everyone
                deserves access to quality legal help regardless of their location or background.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { num: `${lawyers.length}+`, label: 'Verified Lawyers' },
                  { num: `${cases.length}+`, label: 'Cases Handled' },
                  { num: '10+', label: 'Cities Covered' },
                  { num: '4.9★', label: 'Average Rating' },
                ].map((s, i) => (
                  <div key={i} className="bg-blue-50 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{s.num}</div>
                    <div className="text-sm text-gray-600 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Our Mission</h3>
              <div className="space-y-5">
                {[
                  { icon: '🎯', title: 'Accessible', desc: 'Legal help for everyone, everywhere in India' },
                  { icon: '💎', title: 'Transparent', desc: 'Clear pricing, no hidden fees or surprises' },
                  { icon: '🤝', title: 'Trustworthy', desc: 'Verified lawyers with proven track records' },
                  { icon: '⚡', title: 'Efficient', desc: 'Fast case submission and real-time updates' },
                ].map((m, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <p className="font-semibold text-white">{m.title}</p>
                      <p className="text-blue-100 text-sm">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Legal Tips & Guide</h2>
            <p className="text-gray-500 mt-3 text-lg">Useful information to help you understand your rights</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '📋', category: 'Case Filing', title: 'How to file a case in India', desc: 'Learn the step-by-step process of filing a case in Indian courts and what documents you need.' },
              { icon: '⚖️', category: 'Know Your Rights', title: 'Your rights when arrested', desc: 'Every citizen has fundamental rights when arrested. Know what you can and cannot be asked to do.' },
              { icon: '🏠', category: 'Property Law', title: 'Property dispute resolution', desc: 'Property disputes are common in India. Learn how to resolve them legally and efficiently.' },
            ].map((b, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className="bg-blue-600 p-5 flex items-center gap-3">
                  <span className="text-3xl">{b.icon}</span>
                  <span className="text-white font-medium">{b.category}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{b.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{b.desc}</p>
                  <Link to="/auth" className="text-blue-600 text-sm font-medium hover:underline">
                    Read more →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-500 mt-3 text-lg">Everything you need to know about LegalNexus</p>
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
              <details key={i} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 cursor-pointer group">
                <summary className="font-semibold text-gray-900 list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-blue-600 text-xl font-light">+</span>
                </summary>
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Contact Us</h2>
            <p className="text-gray-500 mt-3 text-lg">We are here to help you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 text-lg mb-5">Get in touch</h3>
                <div className="space-y-4">
                  {[
                    { icon: '📧', label: 'Email', value: 'support@legalnexus.in' },
                    { icon: '📞', label: 'Phone', value: '+91 98765 43210' },
                    { icon: '📍', label: 'Address', value: 'Nagpur, Maharashtra, India' },
                    { icon: '🕐', label: 'Working Hours', value: 'Mon-Sat: 9AM - 6PM' },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        {c.icon}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{c.label}</p>
                        <p className="font-medium text-gray-900 text-sm">{c.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Follow us</h3>
                <div className="flex gap-3">
                  {['T', 'Li', 'In', 'Fb'].map((s, i) => (
                    <div key={i} className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold hover:bg-blue-100 cursor-pointer transition border border-blue-100">
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 text-lg mb-5">Send us a message</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Your Name</label>
                  <input type="text" placeholder="John Smith"
                    className="w-full mt-1 p-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" placeholder="john@email.com"
                    className="w-full mt-1 p-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <textarea placeholder="How can we help you?"
                    className="w-full mt-1 p-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-none" />
                </div>
                <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get legal help?</h2>
          <p className="text-blue-100 text-lg mb-10 leading-relaxed">
            Join thousands of clients who found the right lawyer on LegalNexus.
            Create your free account today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth" className="px-8 py-3.5 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition text-lg shadow-lg">
              Create Free Account
            </Link>
            <Link to="/auth" className="px-8 py-3.5 bg-white/10 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition text-lg">
              Login →
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}