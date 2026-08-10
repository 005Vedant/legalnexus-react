import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { authFetch } from '../lib/authFetch'

const FF = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

const STATUS_CFG: Record<string, { color: string; bg: string; border: string; dot: string; label: string }> = {
  'Pending':           { color: '#92400E', bg: '#FFFBEB', border: '#FDE68A', dot: '#F59E0B', label: '⏳ Pending' },
  'In Progress':       { color: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6', label: '🔄 In Progress' },
  'Hearing Scheduled': { color: '#5B21B6', bg: '#F5F3FF', border: '#DDD6FE', dot: '#8B5CF6', label: '📅 Hearing Scheduled' },
  'Resolved':          { color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981', label: '✅ Resolved' },
  'Closed':            { color: '#374151', bg: '#F9FAFB', border: '#E5E7EB', dot: '#6B7280', label: '🔒 Closed' },
}

const BASE_INPUT: React.CSSProperties = {
  fontFamily: FF, width: '100%', padding: '11px 14px',
  border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14,
  color: '#0F172A', background: '#F8FAFC', outline: 'none',
  boxSizing: 'border-box', transition: 'all 0.15s',
}

const LABEL_S: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: '#475569', textTransform: 'uppercase',
  letterSpacing: '0.06em', marginBottom: 6,
}

/* ── tiny reusable components ── */
function FInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [f, setF] = useState(false)
  return (
    <input {...props}
      style={{ ...BASE_INPUT, borderColor: f ? '#2563EB' : '#E2E8F0', boxShadow: f ? '0 0 0 3px rgba(37,99,235,0.10)' : 'none', background: f ? '#fff' : '#F8FAFC' }}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
    />
  )
}

function FSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [f, setF] = useState(false)
  return (
    <select {...props}
      style={{ ...BASE_INPUT, borderColor: f ? '#2563EB' : '#E2E8F0', boxShadow: f ? '0 0 0 3px rgba(37,99,235,0.10)' : 'none', background: f ? '#fff' : '#F8FAFC', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 36, cursor: 'pointer' }}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
    >
      {props.children}
    </select>
  )
}

function FTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [f, setF] = useState(false)
  return (
    <textarea {...props}
      style={{ ...BASE_INPUT, borderColor: f ? '#2563EB' : '#E2E8F0', boxShadow: f ? '0 0 0 3px rgba(37,99,235,0.10)' : 'none', background: f ? '#fff' : '#F8FAFC', height: 120, resize: 'none' }}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
    />
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={LABEL_S}>{label}</label>
      {children}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const c = STATUS_CFG[status] || STATUS_CFG['Pending']
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' as const }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, flexShrink: 0, display: 'inline-block' }} />
      {c.label}
    </span>
  )
}

function MetaChip({ icon, label, value, accent }: { icon: string; label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ background: accent ? '#F5F3FF' : '#F8FAFC', border: `1px solid ${accent ? '#DDD6FE' : '#F1F5F9'}`, borderRadius: 11, padding: '10px 14px', textAlign: 'center' as const }}>
      <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
      <p style={{ fontSize: 10, color: accent ? '#7C3AED' : '#94A3B8', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 12, color: accent ? '#4C1D95' : '#0F172A', fontWeight: 700, marginTop: 3 }}>{value}</p>
    </div>
  )
}

/* ── main component ── */
export default function Cases() {
  const { user, role } = useAuth()
  const [cases, setCases] = useState<any[]>([])
  const [lawyers, setLawyers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', description: '', case_type: '', case_date: '', case_location: '', assigned_lawyer_id: '' })
  const [caseFile, setCaseFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [msgType, setMsgType] = useState<'success' | 'error' | ''>('')
  const [showForm, setShowForm] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [casesRes, lawyersRes] = await Promise.all([
        authFetch('/api/cases'),
        authFetch('/api/lawyers')
      ])
      setCases(casesRes.ok ? await casesRes.json() : [])
      setLawyers(lawyersRes.ok ? await lawyersRes.json() : [])
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const submitCase = async () => {
    if (!form.title || !form.description) { setMsgType('error'); return }
    setSubmitting(true); setMsgType('')
    let document_url = null
    if (caseFile) {
      const ext = caseFile.name.split('.').pop()
      const path = `${user?.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('case-documents').upload(path, caseFile, { upsert: true })
      if (!uploadError) {
        const { data } = supabase.storage.from('case-documents').getPublicUrl(path)
        document_url = data.publicUrl
      }
    }
    const res = await authFetch('/api/cases', {
      method: 'POST',
      body: JSON.stringify({ title: form.title, description: form.description, case_type: form.case_type, hearing_date: form.case_date ? new Date(form.case_date).toISOString() : null, case_location: form.case_location, assigned_lawyer_id: form.assigned_lawyer_id || null, client_id: user?.id, status: 'Pending', document_url }),
    })
    if (res.ok) {
      setMsgType('success')
      setForm({ title: '', description: '', case_type: '', case_date: '', case_location: '', assigned_lawyer_id: '' })
      setCaseFile(null); setShowForm(false); fetchData()
    } else { setMsgType('error') }
    setSubmitting(false)
  }

  const deleteCase = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case?')) return
    await authFetch(`/api/cases/${id}`, { method: 'DELETE' })
    fetchData()
  }

  /* ── loading ── */
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 260, gap: 16, fontFamily: FF }}>
      <div style={{ width: 38, height: 38, border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: 14, fontWeight: 500, color: '#64748B' }}>Loading cases…</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  /* ── page ── */
  return (
    <section style={{ maxWidth: 880, margin: '0 auto', padding: '36px 22px', fontFamily: FF }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' as const }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#1E3A5F,#2563EB)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>📋</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.4px' }}>
              {role === 'client' ? 'My Cases' : 'All Cases'}
            </h1>
          </div>
          <p style={{ color: '#94A3B8', fontSize: 13, margin: 0, paddingLeft: 46, fontWeight: 500 }}>
            {role === 'client'
              ? `${cases.length} case${cases.length !== 1 ? 's' : ''} submitted`
              : `${cases.length} case${cases.length !== 1 ? 's' : ''} in the system`}
          </p>
        </div>

        {role === 'client' && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ padding: '11px 22px', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.15s', background: showForm ? '#F1F5F9' : 'linear-gradient(135deg,#1E3A5F,#2563EB)', color: showForm ? '#64748B' : '#fff', boxShadow: showForm ? 'none' : '0 4px 14px rgba(37,99,235,0.30)', letterSpacing: '0.01em' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {showForm ? '✕  Cancel' : '＋  Submit New Case'}
          </button>
        )}
      </div>

      {/* ── Submit Form ── */}
      {showForm && role === 'client' && (
        <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #E2E8F0', boxShadow: '0 8px 32px rgba(15,23,42,0.10)', marginBottom: 32, overflow: 'hidden' }}>

          {/* form header */}
          <div style={{ background: 'linear-gradient(135deg,#0F172A 0%,#1E3A5F 50%,#2563EB 100%)', padding: '24px 30px' }}>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>Submit a New Case</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 5 }}>Fill in your case details below — all information is kept confidential.</p>
          </div>

          <div style={{ padding: '30px' }}>
            {/* feedback */}
            {msgType === 'success' && (
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 11, padding: '12px 16px', fontSize: 13, color: '#15803D', marginBottom: 22, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                ✅ Case submitted successfully!
              </div>
            )}
            {msgType === 'error' && (
              <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 11, padding: '12px 16px', fontSize: 13, color: '#BE123C', marginBottom: 22, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                ⚠️ Please fill in the case title and description.
              </div>
            )}

            <Field label="Case Title *">
              <FInput value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Brief title of your case" />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={LABEL_S}>Case Type</label>
                <FSelect value={form.case_type} onChange={e => setForm({ ...form, case_type: e.target.value })}>
                  <option value="">Select type…</option>
                  {['Criminal Law','Family & Divorce','Corporate Law','Property Law','Cybercrime','Civil Law','Other'].map(o => <option key={o}>{o}</option>)}
                </FSelect>
              </div>
              <div>
                <label style={LABEL_S}>Case Date</label>
                <FInput type="date" value={form.case_date} onChange={e => setForm({ ...form, case_date: e.target.value })} />
              </div>
            </div>

            <Field label="Case Location">
              <FInput value={form.case_location} onChange={e => setForm({ ...form, case_location: e.target.value })} placeholder="City, Court name…" />
            </Field>

            <Field label="Case Description *">
              <FTextarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your case in detail — what happened, when it happened, what help you need…" />
            </Field>

            <Field label="Select Lawyer">
              <FSelect value={form.assigned_lawyer_id} onChange={e => setForm({ ...form, assigned_lawyer_id: e.target.value })}>
                <option value="">Choose a lawyer…</option>
                {lawyers.map(l => <option key={l.id} value={l.id}>{l.name} — {l.specialty}</option>)}
              </FSelect>
            </Field>

            {/* File upload */}
            <div style={{ marginBottom: 24 }}>
              <label style={LABEL_S}>Upload Case Document</label>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) setCaseFile(f) }}
                style={{ border: `2px dashed ${dragOver ? '#2563EB' : caseFile ? '#10B981' : '#CBD5E1'}`, borderRadius: 13, padding: '32px 20px', textAlign: 'center' as const, background: dragOver ? '#EFF6FF' : caseFile ? '#F0FDF4' : '#F8FAFC', transition: 'all 0.15s', cursor: 'pointer' }}
              >
                <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={e => setCaseFile(e.target.files?.[0] || null)} style={{ display: 'none' }} id="case-file" />
                <label htmlFor="case-file" style={{ cursor: 'pointer', display: 'block' }}>
                  <div style={{ fontSize: 34, marginBottom: 10 }}>{caseFile ? '✅' : '📎'}</div>
                  {caseFile ? (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#065F46', margin: 0 }}>{caseFile.name}</p>
                      <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 5 }}>Click to change file</p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: 0 }}>Click or drag & drop to upload</p>
                      <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 5 }}>PDF, DOC, DOCX, JPG, PNG — Max 10MB</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <button
              onClick={submitCase} disabled={submitting}
              style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(135deg,#1E3A5F,#2563EB)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, boxShadow: '0 4px 16px rgba(37,99,235,0.30)', transition: 'opacity 0.15s', letterSpacing: '0.02em' }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.opacity = '0.88' }}
              onMouseLeave={e => { if (!submitting) e.currentTarget.style.opacity = '1' }}
            >
              {submitting ? 'Submitting…' : 'Submit Case →'}
            </button>
          </div>
        </div>
      )}

      {/* ── Cases List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {cases.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 18, padding: '72px 24px', textAlign: 'center' as const, border: '1.5px solid #F1F5F9', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
            <div style={{ fontSize: 56, marginBottom: 18 }}>📂</div>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: '#0F172A', marginBottom: 8 }}>No cases found</h3>
            <p style={{ color: '#94A3B8', fontSize: 14, margin: 0 }}>
              {role === 'client' ? 'Submit your first case to get started' : 'No cases in the system yet'}
            </p>
            {role === 'client' && (
              <button
                onClick={() => setShowForm(true)}
                style={{ marginTop: 24, padding: '12px 32px', background: 'linear-gradient(135deg,#1E3A5F,#2563EB)', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.28)' }}
              >
                Submit a Case
              </button>
            )}
          </div>
        ) : (
          cases.map(c => {
            const lawyer = lawyers.find(l => l.id === c.assigned_lawyer_id)
            return (
              <div
                key={c.id}
                style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #F1F5F9', boxShadow: '0 1px 6px rgba(15,23,42,0.05)', overflow: 'hidden', transition: 'box-shadow 0.18s, border-color 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,99,235,0.10)'; e.currentTarget.style.borderColor = '#BFDBFE' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 6px rgba(15,23,42,0.05)'; e.currentTarget.style.borderColor = '#F1F5F9' }}
              >
                {/* top accent strip */}
                <div style={{ height: 4, background: STATUS_CFG[c.status]?.dot ? `linear-gradient(90deg,${STATUS_CFG[c.status].dot},transparent)` : 'linear-gradient(90deg,#2563EB,transparent)' }} />

                {/* header */}
                <div style={{ padding: '20px 24px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' as const }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 10px', letterSpacing: '-0.3px' }}>{c.title}</h3>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, alignItems: 'center' }}>
                        {c.case_type && (
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '3px 11px', borderRadius: 999 }}>{c.case_type}</span>
                        )}
                        <StatusPill status={c.status || 'Pending'} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* body */}
                <div style={{ padding: '0 24px 24px' }}>
                  <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.75, marginBottom: 20 }}>{c.description}</p>

                  {/* meta chips */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 10, marginBottom: 18 }}>
                    {c.case_location && <MetaChip icon="📍" label="Location" value={c.case_location} />}
                    {c.hearing_date && <MetaChip icon="📅" label="Hearing" value={new Date(c.hearing_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} accent />}
                    <MetaChip icon="🕐" label="Submitted" value={new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
                  </div>

                  {/* assigned lawyer */}
                  {lawyer && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: 13, padding: '13px 16px', marginBottom: 16 }}>
                      {lawyer.profile_image ? (
                        <img src={lawyer.profile_image} alt={lawyer.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #6EE7B7', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#065F46,#10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                          {lawyer.name?.charAt(0)}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{lawyer.name}</p>
                        <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>{lawyer.specialty}</p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#065F46', background: '#D1FAE5', border: '1px solid #A7F3D0', padding: '4px 12px', borderRadius: 999, whiteSpace: 'nowrap' as const }}>✓ Your Lawyer</span>
                    </div>
                  )}

                  {/* document link */}
                  {c.document_url && (
                    <div style={{ marginBottom: 16 }}>
                      <a
                        href={c.document_url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '8px 16px', borderRadius: 10, textDecoration: 'none', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#DBEAFE'; e.currentTarget.style.color = '#1D4ED8' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.color = '#2563EB' }}
                      >
                        📎 View Case Document
                      </a>
                    </div>
                  )}

                  {/* lawyer note */}
                  {c.notes && (
                    <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '13px 16px', marginBottom: 16 }}>
                      <p style={{ fontSize: 10, fontWeight: 800, color: '#92400E', marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>📝 Note from Lawyer</p>
                      <p style={{ fontSize: 13, color: '#78350F', lineHeight: 1.65, margin: 0 }}>{c.notes}</p>
                    </div>
                  )}

                  {/* delete */}
                  {role === 'client' && (
                    <button
                      onClick={() => deleteCase(c.id)}
                      style={{ padding: '8px 18px', background: '#FFF1F2', color: '#BE123C', border: '1px solid #FECDD3', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: FF }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FFE4E6'; e.currentTarget.style.borderColor = '#FDA4AF' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#FFF1F2'; e.currentTarget.style.borderColor = '#FECDD3' }}
                    >
                      🗑️ Delete Case
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}