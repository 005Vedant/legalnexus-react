import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function Cases() {
  const { user, role } = useAuth()
  const [cases, setCases] = useState<any[]>([])
  const [lawyers, setLawyers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    title: '', description: '', case_type: '',
    case_date: '', case_location: '', assigned_lawyer_id: ''
  })
  const [caseFile, setCaseFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)

  const statusColor: any = {
    'Pending': 'bg-yellow-100 text-yellow-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Hearing Scheduled': 'bg-purple-100 text-purple-700',
    'Resolved': 'bg-green-100 text-green-700',
    'Closed': 'bg-gray-100 text-gray-700',
  }

  const fetchData = async () => {
    setLoading(true)
    const [casesRes, lawyersRes] = await Promise.all([
      fetch('/api/cases'),
      fetch('/api/lawyers')
    ])
    setCases(await casesRes.json())
    setLawyers(await lawyersRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const submitCase = async () => {
    if (!form.title || !form.description) {
      setMessage('❌ Please fill title and description!')
      return
    }
    setSubmitting(true)
    setMessage('')

    let document_url = null

    // Upload file if selected
    if (caseFile) {
      const ext = caseFile.name.split('.').pop()
      const path = `${user?.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('case-documents')
        .upload(path, caseFile, { upsert: true })
      if (!uploadError) {
        const { data } = supabase.storage
          .from('case-documents')
          .getPublicUrl(path)
        document_url = data.publicUrl
      }
    }

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
        status: 'Pending',
        document_url,
      })
    })
    if (res.ok) {
      setMessage('✅ Case submitted successfully!')
      setForm({ title: '', description: '', case_type: '', case_date: '', case_location: '', assigned_lawyer_id: '' })
      setCaseFile(null)
      setShowForm(false)
      fetchData()
    } else {
      setMessage('❌ Failed to submit. Try again.')
    }
    setSubmitting(false)
  }

  const deleteCase = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case?')) return
    await fetch(`/api/cases/${id}`, { method: 'DELETE' })
    fetchData()
  }

  if (loading) return <div className="text-center py-10 text-gray-600">Loading...</div>

  return (
    <section className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cases</h1>
        {role === 'client' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
            {showForm ? '✕ Cancel' : '➕ Submit Case'}
          </button>
        )}
      </div>

      {/* Submit Case Form */}
      {showForm && role === 'client' && (
        <div className="bg-white rounded-2xl p-6 border shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">New Case</h2>
          {message && (
            <div className={`mb-3 p-3 rounded-lg text-sm ${
              message.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Case Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Brief title of your case"
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Case Type</label>
                <select value={form.case_type} onChange={e => setForm({ ...form, case_type: e.target.value })}
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
                <input type="date" value={form.case_date} onChange={e => setForm({ ...form, case_date: e.target.value })}
                  className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Case Location</label>
              <input value={form.case_location} onChange={e => setForm({ ...form, case_location: e.target.value })}
                placeholder="City, Court name..."
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Case Description *</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your case in detail..."
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Select Lawyer </label>
              <select value={form.assigned_lawyer_id} onChange={e => setForm({ ...form, assigned_lawyer_id: e.target.value })}
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Choose a lawyer...</option>
                {lawyers.map(l => (
                  <option key={l.id} value={l.id}>{l.name} — {l.specialty}</option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="text-sm font-medium text-gray-700">Upload Case Document </label>
              <div className="mt-1 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-400 transition">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={e => setCaseFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="case-file"
                />
                <label htmlFor="case-file" className="cursor-pointer">
                  <div className="text-3xl mb-2">📎</div>
                  {caseFile ? (
                    <p className="text-sm text-green-600 font-medium">✅ {caseFile.name}</p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 font-medium">Click to upload document</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG supported</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <button onClick={submitCase} disabled={submitting}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Case'}
            </button>
          </div>
        </div>
      )}

      {/* Cases List */}
      <div className="space-y-4">
        {cases.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border">
            <div className="text-5xl mb-3">📂</div>
            <p className="text-gray-500">No cases found</p>
          </div>
        ) : (
          cases.map(c => (
            <div key={c.id} className="bg-white rounded-2xl p-5 border shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{c.title}</h3>
                  {c.case_type && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                      {c.case_type}
                    </span>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[c.status]}`}>
                  {c.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-3">{c.description}</p>
              <div className="flex gap-4 text-sm text-gray-500 flex-wrap mb-3">
                {c.case_location && <span>📍 {c.case_location}</span>}
                {c.hearing_date && (
                  <span className="text-purple-600 font-medium">
                    📅 {new Date(c.hearing_date).toLocaleDateString()}
                  </span>
                )}
                <span>🕐 {new Date(c.created_at).toLocaleDateString()}</span>
              </div>

              {/* Document link */}
              {c.document_url && (
                <a href={c.document_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-3">
                  📎 View uploaded document
                </a>
              )}

              {c.notes && (
                <div className="mt-2 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800 border border-yellow-200">
                  📝 {c.notes}
                </div>
              )}

              {/* Delete button — client only */}
              {role === 'client' && (
                <button
                  onClick={() => deleteCase(c.id)}
                  className="mt-3 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 border border-red-200 transition">
                  🗑️ Delete Case
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}