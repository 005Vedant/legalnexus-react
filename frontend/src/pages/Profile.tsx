import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const FF = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

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

function FInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [f, setF] = useState(false)
  return (
    <input {...props}
      style={{ ...BASE_INPUT, borderColor: f ? '#2563EB' : '#E2E8F0', boxShadow: f ? '0 0 0 3px rgba(37,99,235,0.10)' : 'none', background: f ? '#fff' : '#F8FAFC', ...(props.disabled ? { background: '#F1F5F9', color: '#94A3B8', borderColor: '#E2E8F0', cursor: 'not-allowed' } : {}) }}
      onFocus={() => !props.disabled && setF(true)}
      onBlur={() => setF(false)}
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

const ROLE_CFG: Record<string, { label: string; icon: string; color: string; bg: string; border: string }> = {
  admin:  { label: 'Admin',  icon: '🛡️', color: '#1E3A5F', bg: '#EFF6FF', border: '#BFDBFE' },
  lawyer: { label: 'Lawyer', icon: '⚖️', color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0' },
  client: { label: 'Client', icon: '👤', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
}

export default function Profile() {
  const { user, role } = useAuth()
  const [form, setForm] = useState({ full_name: '', phone: '', gender: '', age: '' })
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msgType, setMsgType] = useState<'success' | 'error' | ''>('')

  useEffect(() => {
    if (user) {
      setForm(f => ({ ...f, full_name: user.user_metadata?.full_name || '' }))
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => {
          if (data) {
            setForm({
              full_name: data.full_name || user.user_metadata?.full_name || '',
              phone: data.phone || '',
              gender: data.gender || '',
              age: data.age || '',
            })
            if (data.photo_url) setPhotoUrl(data.photo_url)
          }
        })
    }
  }, [user])

  const handlePhotoUpload = async (file: File) => {
    try {
      setUploading(true)
      const ext = file.name.split('.').pop()
      const path = `profiles/${user?.id}.${ext}`
      let bucket = 'profile-photos'
      let { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
      if (error) {
        bucket = 'lawyer-photos'
        const res = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
        if (res.error) throw res.error
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      await supabase.from('profiles').upsert({ id: user?.id, photo_url: data.publicUrl, role })
      setPhotoUrl(data.publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    await supabase.from('profiles').upsert({
      id: user?.id, full_name: form.full_name, phone: form.phone,
      gender: form.gender, age: form.age, role,
    })
    setMsgType('success')
    setSaving(false)
    setTimeout(() => setMsgType(''), 3500)
  }

  const rc = ROLE_CFG[role as string] || ROLE_CFG.client
  const initials = (form.full_name || user?.email || 'U').charAt(0).toUpperCase()

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '36px 20px', fontFamily: FF }}>

      {/* Page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#1E3A5F,#2563EB)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>👤</div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.4px' }}>My Profile</h1>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, fontWeight: 500 }}>Manage your personal information</p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #F1F5F9', boxShadow: '0 4px 24px rgba(15,23,42,0.08)', overflow: 'hidden' }}>

        {/* ── Banner ── */}
        <div style={{ background: 'linear-gradient(145deg,#0F172A 0%,#1E3A5F 55%,#2563EB 100%)', padding: '36px 28px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>

          {/* avatar */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.25)', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }} />
            ) : (
              <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 36, fontWeight: 800, border: '4px solid rgba(255,255,255,0.25)', boxShadow: '0 4px 16px rgba(0,0,0,0.20)' }}>
                {initials}
              </div>
            )}

            {/* upload button */}
            <label style={{ position: 'absolute', bottom: 2, right: 2, width: 30, height: 30, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', border: '2px solid #F1F5F9', transition: 'transform 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span style={{ fontSize: 13 }}>{uploading ? '⏳' : '📷'}</span>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const file = e.target.files?.[0]; if (file) handlePhotoUpload(file) }} />
            </label>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            {form.full_name || user?.email || 'User'}
          </h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '0 0 12px' }}>{user?.email}</p>

          {/* role badge */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)', fontSize: 12, fontWeight: 700, color: '#fff' }}>
            {rc.icon} {rc.label}
          </span>

          {uploading && (
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.60)', marginTop: 10, fontWeight: 500 }}>Uploading photo…</p>
          )}
        </div>

        {/* ── Form ── */}
        <div style={{ padding: '28px 28px 32px' }}>

          {/* feedback */}
          {msgType === 'success' && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 11, padding: '12px 16px', fontSize: 13, color: '#15803D', marginBottom: 24, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              ✅ Profile saved successfully!
            </div>
          )}
          {msgType === 'error' && (
            <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 11, padding: '12px 16px', fontSize: 13, color: '#BE123C', marginBottom: 24, fontWeight: 600 }}>
              ⚠️ Something went wrong. Please try again.
            </div>
          )}

          {/* full name */}
          <div style={{ marginBottom: 16 }}>
            <label style={LABEL_S}>Full Name</label>
            <FInput value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Enter your full name" />
          </div>

          {/* email (disabled) */}
          <div style={{ marginBottom: 16 }}>
            <label style={LABEL_S}>Email Address</label>
            <FInput value={user?.email || ''} disabled placeholder="—" />
          </div>

          {/* phone */}
          <div style={{ marginBottom: 16 }}>
            <label style={LABEL_S}>Phone Number</label>
            <FInput value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
          </div>

          {/* gender + age */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={LABEL_S}>Gender</label>
              <FSelect value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select…</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </FSelect>
            </div>
            <div>
              <label style={LABEL_S}>Age</label>
              <FInput type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="e.g. 28" />
            </div>
          </div>

          {/* role (read-only styled tile) */}
          <div style={{ marginBottom: 24 }}>
            <label style={LABEL_S}>Account Role</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: rc.bg, border: `1.5px solid ${rc.border}`, borderRadius: 10 }}>
              <span style={{ fontSize: 18 }}>{rc.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: rc.color }}>{rc.label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: rc.color, opacity: 0.6, fontWeight: 600 }}>Read-only</span>
            </div>
          </div>

          {/* divider */}
          <div style={{ borderTop: '1px solid #F1F5F9', marginBottom: 22 }} />

          {/* save */}
          <button
            onClick={saveProfile} disabled={saving}
            style={{ width: '100%', padding: '14px 0', background: saving ? '#94A3B8' : 'linear-gradient(135deg,#1E3A5F,#2563EB)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 16px rgba(37,99,235,0.28)', transition: 'all 0.15s', fontFamily: FF, letterSpacing: '0.02em' }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.opacity = '0.88' }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.opacity = '1' }}
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}