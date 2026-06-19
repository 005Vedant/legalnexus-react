import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function ClientDashboard() {
  const { user } = useAuth()
  const [cases, setCases] = useState<any[]>([])
  const [lawyers, setLawyers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'submit' | 'lawyers' | 'track'>('overview')
  const [form, setForm] = useState({
    title: '',
    description: '',
    case_type: '',
    case_date: '',
    case_location: '',
    assigned_lawyer_id: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    setLoading(true)
    const [casesRes, lawyersRes] = await Promise.all([
      fetch('/api/cases'),
      fetch('/api/lawyers')
    ])
    const casesData = await casesRes.json()
    const lawyersData = await lawyersRes.json()
    setCases(Array.isArray(casesData) ? casesData : [])
    setLawyers(Array.isArray(lawyersData) ? lawyersData : [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const submitCase = async () => {
    if (!form.title || !form.description) {
      setMessage('Please fill title and description!')
      return
    }
    setSubmitting(true)
    setMessage('')
    const res = await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        case_type: form.case_type,
        hearing_date: form.case_date ? new Date(form.case_date).toISOString() : null,
        case_location: form.case_location,
        assigned_lawyer_id: form.assigned_lawyer_id || null,
        client_id: user?.id,
        status: 'Pending'
      })
    })
    if (res.ok) {
      setMessage('✅ Case submitted successfully!')
      setForm({ title: '', description: '', case_type: '', case_date: '', case_location: '', assigned_lawyer_id: '' })
      fetchData()
      setTimeout(() => setActiveTab('track'), 1500)
    } else {
      setMessage('❌ Failed to submit case. Try again.')
    }
    setSubmitting(false)
  }

  const statusColor: any = {
    'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
    'Hearing Scheduled': 'bg-purple-100 text-purple-700 border-purple-200',
    'Resolved': 'bg-green-100 text-green-700 border-green-200',
    'Closed': 'bg-gray-100 text-gray-700 border-gray-200',
  }

  const statusIcon: any = {
    'Pending': '⏳',
    'In Progress': '🔄',
    'Hearing Scheduled': '📅',
    'Resolved': '✅',
    'Closed': '🔒',
  }

  const filteredLawyers = lawyers.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.specialty || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="flex justify-center items-center h-40">
      <div className="text-gray-600 text-lg">Loading...</div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold">
         Welcome, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Client'} 
        </h1>
        <p className="text-blue-100 mt-1 text-sm">
          LegalNexus — Your trusted legal intelligence platform
        </p>
        <div className="flex gap-3 mt-4 flex-wrap">
          <div className="bg-white/20 rounded-xl p-3 text-center min-w-[80px]">
            <div className="text-2xl font-bold">{cases.length}</div>
            <div className="text-xs text-blue-100">Total Cases</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center min-w-[80px]">
            <div className="text-2xl font-bold">
              {cases.filter(c => c.status === 'Pending').length}
            </div>
            <div className="text-xs text-blue-100">Pending</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center min-w-[80px]">
            <div className="text-2xl font-bold">
              {cases.filter(c => c.status === 'Hearing Scheduled').length}
            </div>
            <div className="text-xs text-blue-100">Hearings</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center min-w-[80px]">
            <div className="text-2xl font-bold">
              {cases.filter(c => c.status === 'Resolved').length}
            </div>
            <div className="text-xs text-blue-100">Resolved</div>
          </div>
        </div>
      </div>

      {/* Platform Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border shadow-sm text-center">
          <div className="text-3xl mb-2">⚖️</div>
          <h3 className="font-bold text-gray-900">Expert Lawyers</h3>
          <p className="text-sm text-gray-500 mt-1">
            Connect with {lawyers.length}+ verified legal professionals
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border shadow-sm text-center">
          <div className="text-3xl mb-2">📋</div>
          <h3 className="font-bold text-gray-900">Case Tracking</h3>
          <p className="text-sm text-gray-500 mt-1">
            Track your case status and hearing dates in real time
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border shadow-sm text-center">
          <div className="text-3xl mb-2">🔒</div>
          <h3 className="font-bold text-gray-900">Secure & Private</h3>
          <p className="text-sm text-gray-500 mt-1">
            Your case details are fully confidential and secure
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'overview', label: '🏠 Overview' },
          { id: 'submit', label: '➕ Submit Case' },
          { id: 'track', label: '📍 Track Cases' },
          { id: 'lawyers', label: '⚖️ Find Lawyers' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {cases.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border">
              <div className="text-5xl mb-3">📂</div>
              <h3 className="font-bold text-gray-900 text-lg">No cases yet</h3>
              <p className="text-gray-500 text-sm mt-1">Submit your first case to get started</p>
              <button
                onClick={() => setActiveTab('submit')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
                Submit a Case
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Recent Cases</h2>
              {cases.slice(0, 3).map(c => (
                <div key={c.id} className="bg-white rounded-2xl p-5 border shadow-sm mb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{c.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">{c.description?.slice(0, 80)}...</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor[c.status]}`}>
                      {statusIcon[c.status]} {c.status}
                    </span>
                  </div>
                  {c.hearing_date && (
                    <div className="mt-2 text-sm text-purple-600 font-medium">
                      📅 Hearing: {new Date(c.hearing_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
              {cases.length > 3 && (
                <button
                  onClick={() => setActiveTab('track')}
                  className="text-blue-600 text-sm font-medium hover:underline">
                  View all {cases.length} cases →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Submit Case Tab */}
      {activeTab === 'submit' && (
        <div className="bg-white rounded-2xl p-6 border shadow-sm max-w-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Submit a New Case</h2>
          <p className="text-gray-500 text-sm mb-5">Fill in your case details and select a lawyer</p>

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.startsWith('✅')
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Case Title *</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Brief title of your case"
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Case Type</label>
                <select
                  value={form.case_type}
                  onChange={e => setForm({ ...form, case_type: e.target.value })}
                  className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select type</option>
                  <option>Criminal Law</option>
                  <option>Family & Divorce</option>
                  <option>Corporate Law</option>
                  <option>Property Law</option>
                  <option>Cybercrime</option>
                  <option>Civil Law</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Case Date</label>
                <input
                  type="date"
                  value={form.case_date}
                  onChange={e => setForm({ ...form, case_date: e.target.value })}
                  className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Case Location</label>
              <input
                value={form.case_location}
                onChange={e => setForm({ ...form, case_location: e.target.value })}
                placeholder="City, Court name..."
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Case Description *</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your case in detail — what happened, when it happened, what help you need..."
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Select Lawyer (optional)</label>
              <select
                value={form.assigned_lawyer_id}
                onChange={e => setForm({ ...form, assigned_lawyer_id: e.target.value })}
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Choose a lawyer...</option>
                {lawyers.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.specialty}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={submitCase}
              disabled={submitting}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? 'Submitting...' : 'Submit Case'}
            </button>
          </div>
        </div>
      )}

      {/* Track Cases Tab */}
      {activeTab === 'track' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">My Cases</h2>
          {cases.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border">
              <div className="text-5xl mb-3">📂</div>
              <p className="text-gray-500">No cases submitted yet</p>
              <button
                onClick={() => setActiveTab('submit')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-medium">
                Submit a Case
              </button>
            </div>
          ) : (
            cases.map(c => {
              const assignedLawyer = lawyers.find(l => l.id === c.assigned_lawyer_id)
              return (
                <div key={c.id} className="bg-white rounded-2xl p-5 border shadow-sm">
                  {/* Case Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{c.title}</h3>
                      {c.case_type && (
                        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                          {c.case_type}
                        </span>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor[c.status]}`}>
                      {statusIcon[c.status]} {c.status}
                    </span>
                  </div>

                  {/* Case Description */}
                  <p className="text-gray-600 text-sm mb-3">{c.description}</p>

                  {/* Case Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    {c.hearing_date && (
                      <div className="bg-purple-50 rounded-xl p-3 text-center">
                        <div className="text-lg">📅</div>
                        <div className="text-xs text-purple-700 font-medium mt-1">Hearing Date</div>
                        <div className="text-xs text-purple-900 font-bold">
                          {new Date(c.hearing_date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    {c.case_location && (
                      <div className="bg-blue-50 rounded-xl p-3 text-center">
                        <div className="text-lg">📍</div>
                        <div className="text-xs text-blue-700 font-medium mt-1">Location</div>
                        <div className="text-xs text-blue-900 font-bold">{c.case_location}</div>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-lg">🕐</div>
                      <div className="text-xs text-gray-700 font-medium mt-1">Submitted</div>
                      <div className="text-xs text-gray-900 font-bold">
                        {new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`rounded-xl p-3 text-center ${statusColor[c.status]}`}>
                      <div className="text-lg">{statusIcon[c.status]}</div>
                      <div className="text-xs font-medium mt-1">Status</div>
                      <div className="text-xs font-bold">{c.status}</div>
                    </div>
                  </div>

                  {/* Assigned Lawyer */}
                  {assignedLawyer && (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      {assignedLawyer.profile_image ? (
                        <img src={assignedLawyer.profile_image} alt={assignedLawyer.name}
                          className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                          {assignedLawyer.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-gray-900">{assignedLawyer.name}</p>
                        <p className="text-xs text-gray-500">{assignedLawyer.specialty}</p>
                      </div>
                      <span className="ml-auto text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                        Your Lawyer
                      </span>
                    </div>
                  )}

                  {/* Notes from lawyer */}
                  {c.notes && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                      <p className="text-xs font-medium text-yellow-700 mb-1">📝 Note from Lawyer:</p>
                      <p className="text-sm text-yellow-900">{c.notes}</p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Find Lawyers Tab */}
      {activeTab === 'lawyers' && (
        <div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or specialty..."
            className="w-full mb-4 p-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLawyers.map(l => (
              <div key={l.id} className="bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-3">
                  {l.profile_image ? (
                    <img src={l.profile_image} alt={l.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-100" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                      {l.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">{l.name}</h3>
                    <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                      {l.specialty}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  {l.experience_years && <p>🏛️ {l.experience_years} years experience</p>}
                  {l.rating && <p>⭐ {l.rating} rating</p>}
                  {l.phone && <p>📞 {l.phone}</p>}
                  {l.email && <p>📧 {l.email}</p>}
                </div>
                <button
                  onClick={() => {
                    setForm(f => ({ ...f, assigned_lawyer_id: l.id }))
                    setActiveTab('submit')
                  }}
                  className="w-full py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 border border-blue-200 transition">
                  Select this Lawyer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}