import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import AddLawyerDialog from '../components/AddLawyerDialog'
import { supabase } from '../lib/supabase'
import { authFetch } from '../lib/authFetch'
import { useNavigate } from 'react-router-dom'

const FF = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

type Lawyer = {
  id: string
  name: string
  specialty?: string
  experience_years?: number
  rating?: number
  email?: string
  phone?: string
  profile_image?: string
}

const SPECIALTIES = ['All', 'Criminal Law', 'Family & Divorce', 'Corporate Law', 'Property Law', 'Cybercrime', 'Civil Law', 'Other']

export default function Lawyers() {
  const { role } = useAuth()
  const navigate = useNavigate()
  const [list, setList] = useState<Lawyer[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterSpec, setFilterSpec] = useState('All')
  const [searchFocused, setSearchFocused] = useState(false)

  const fetchList = async () => {
    try {
      setLoading(true)
      const res = await authFetch('/api/lawyers')
      const data = await res.json()
      setList(data)
    } catch (err) {
      console.error('Error fetching lawyers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lawyer?')) return
    await authFetch(`/api/lawyers/${id}`, { method: 'DELETE' })
    fetchList()
  }

  const handlePhotoUpload = async (lawyerId: string, file: File) => {
    try {
      setUploading(lawyerId)
      const ext = file.name.split('.').pop()
      const path = `${lawyerId}.${ext}`
      const { error: uploadError } = await supabase.storage.from('lawyer-photos').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('lawyer-photos').getPublicUrl(path)
      await authFetch(`/api/lawyers/${lawyerId}`, {
        method: 'PUT',
        body: JSON.stringify({ profile_image: data.publicUrl }),
      })
      fetchList()
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(null)
    }
  }

  useEffect(() => { fetchList() }, [])

  const filtered = list.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.specialty || '').toLowerCase().includes(search.toLowerCase())
    const matchSpec = filterSpec === 'All' || l.specialty === filterSpec
    return matchSearch && matchSpec
  })

  /* ── loading ── */
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 260, gap: 16, fontFamily: FF }}>
      <div style={{ width: 38, height: 38, border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: 14, fontWeight: 500, color: '#64748B' }}>Loading lawyers…</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 22px', fontFamily: FF }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' as const }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#1E3A5F,#2563EB)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>⚖️</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.4px' }}>Our Lawyers</h1>
          </div>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0, paddingLeft: 46, fontWeight: 500 }}>
            {filtered.length} verified legal professional{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        {role === 'admin' && <AddLawyerDialog onCreated={() => fetchList()} />}
      </div>

      {/* ── Search + Filter Bar ── */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #F1F5F9', padding: '16px 20px', marginBottom: 28, boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
        {/* search input */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#94A3B8', pointerEvents: 'none' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or specialty…"
            style={{ width: '100%', padding: '11px 14px 11px 38px', border: `1.5px solid ${searchFocused ? '#2563EB' : '#E2E8F0'}`, borderRadius: 10, fontSize: 14, color: '#0F172A', background: searchFocused ? '#fff' : '#F8FAFC', outline: 'none', boxSizing: 'border-box', boxShadow: searchFocused ? '0 0 0 3px rgba(37,99,235,0.10)' : 'none', transition: 'all 0.15s', fontFamily: FF }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* specialty filter pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
          {SPECIALTIES.map(s => (
            <button
              key={s}
              onClick={() => setFilterSpec(s)}
              style={{ padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${filterSpec === s ? '#2563EB' : '#E2E8F0'}`, background: filterSpec === s ? '#EFF6FF' : '#F8FAFC', color: filterSpec === s ? '#2563EB' : '#64748B', transition: 'all 0.15s' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 18, padding: '72px 24px', textAlign: 'center' as const, border: '1.5px solid #F1F5F9' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>👨‍⚖️</div>
          <h3 style={{ fontWeight: 800, fontSize: 18, color: '#0F172A', marginBottom: 8 }}>No lawyers found</h3>
          <p style={{ color: '#94A3B8', fontSize: 14, margin: 0 }}>Try adjusting your search or filter</p>
        </div>
      ) : (
        /* ── Grid ── */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 20 }}>
          {filtered.map(l => (
            <div
              key={l.id}
              style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #F1F5F9', boxShadow: '0 1px 6px rgba(15,23,42,0.05)', overflow: 'hidden', transition: 'all 0.18s', display: 'flex', flexDirection: 'column' as const }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,99,235,0.10)'; e.currentTarget.style.borderColor = '#BFDBFE'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 6px rgba(15,23,42,0.05)'; e.currentTarget.style.borderColor = '#F1F5F9'; e.currentTarget.style.transform = 'none' }}
            >
              {/* card top gradient band */}
              <div style={{ height: 5, background: 'linear-gradient(90deg,#1E3A5F,#2563EB,#60A5FA)' }} />

              {/* avatar section */}
              <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '24px 20px 16px' }}>
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  {l.profile_image ? (
                    <img src={l.profile_image} alt={l.name} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #DBEAFE', boxShadow: '0 4px 12px rgba(37,99,235,0.15)' }} />
                  ) : (
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#1E3A5F,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 30, fontWeight: 800, border: '3px solid #DBEAFE', boxShadow: '0 4px 12px rgba(37,99,235,0.15)' }}>
                      {l.name.charAt(0)}
                    </div>
                  )}

                  {/* online dot decoration */}
                  <div style={{ position: 'absolute', bottom: 3, right: 3, width: 14, height: 14, background: '#10B981', borderRadius: '50%', border: '2px solid #fff' }} />
                </div>

                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 6px', textAlign: 'center' as const, letterSpacing: '-0.2px' }}>{l.name}</h2>

                {l.specialty && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '3px 12px', borderRadius: 999 }}>
                    {l.specialty}
                  </span>
                )}

                {/* admin photo upload */}
                {role === 'admin' && (
                  <label style={{ marginTop: 10, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: uploading === l.id ? '#94A3B8' : '#2563EB', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '4px 12px', borderRadius: 999, transition: 'all 0.15s' }}
                    onMouseEnter={e => { if (uploading !== l.id) { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#BFDBFE' } }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0' }}
                  >
                    <span>{uploading === l.id ? '⏳' : '📷'}</span>
                    {uploading === l.id ? 'Uploading…' : 'Upload Photo'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading === l.id}
                      onChange={e => { const file = e.target.files?.[0]; if (file) handlePhotoUpload(l.id, file) }} />
                  </label>
                )}
              </div>

              {/* divider */}
              <div style={{ borderTop: '1px solid #F8FAFC', margin: '0 20px' }} />

              {/* info rows */}
              <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                {l.experience_years != null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, background: '#F0FDF4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🏛️</div>
                    <div>
                      <p style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: 0 }}>Experience</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{l.experience_years} years</p>
                    </div>
                  </div>
                )}
                {l.rating != null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, background: '#FFFBEB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>⭐</div>
                    <div>
                      <p style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: 0 }}>Rating</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{l.rating} / 5.0</p>
                    </div>
                  </div>
                )}
                {l.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, background: '#EFF6FF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>📧</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: 0 }}>Email</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{l.email}</p>
                    </div>
                  </div>
                )}
                {l.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, background: '#F0FDF4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>📞</div>
                    <div>
                      <p style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: 0 }}>Phone</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{l.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* footer actions */}
              <div style={{ padding: '12px 20px 18px', display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                {role === 'admin' ? (
                  <button
                    onClick={() => handleDelete(l.id)}
                    style={{ width: '100%', padding: '9px 0', background: '#FFF1F2', color: '#BE123C', border: '1px solid #FECDD3', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: FF }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FFE4E6'; e.currentTarget.style.borderColor = '#FDA4AF' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#FFF1F2'; e.currentTarget.style.borderColor = '#FECDD3' }}
                  >
                    🗑️ Delete Lawyer
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/cases')}
                    style={{ width: '100%', padding: '10px 0', background: 'linear-gradient(135deg,#1E3A5F,#2563EB)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 10px rgba(37,99,235,0.25)', transition: 'opacity 0.15s', fontFamily: FF }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    Book Consultation
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}