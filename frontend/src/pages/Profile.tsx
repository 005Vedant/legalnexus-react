import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

/* ── tiny SVG icons ─────────────────────────────────────────────── */
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)
const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)
const IconMapPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)
const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

/* ── style helpers ──────────────────────────────────────────────── */
const inputBase =
  'w-full rounded-xl border border-line bg-card2 px-4 py-3 text-[0.88rem] text-ink placeholder:text-faint outline-none transition focus:border-accent focus:bg-card focus:ring-2 focus:ring-accentsoft'
const inputWithIcon =
  'w-full rounded-xl border border-line bg-card2 pl-9 pr-4 py-3 text-[0.88rem] text-ink placeholder:text-faint outline-none transition focus:border-accent focus:bg-card focus:ring-2 focus:ring-accentsoft'
const selectWithIcon =
  'w-full rounded-xl border border-line bg-card2 pl-9 pr-4 py-3 text-[0.88rem] text-ink outline-none transition focus:border-accent focus:bg-card focus:ring-2 focus:ring-accentsoft appearance-none cursor-pointer'
const labelCls = 'block eyebrow text-faint text-[0.67rem] tracking-wider mb-1.5'

type ProfileForm = {
  first_name: string
  last_name: string
  phone: string
  gender: string
  dob: string
  city: string
  state: string
  language: string
}

type NavTab = 'personal' | 'security' | 'notifications'

export default function Profile() {
  const { user, role } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<ProfileForm>({
    first_name: '',
    last_name: '',
    phone: '',
    gender: '',
    dob: '',
    city: '',
    state: '',
    language: '',
  })
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<NavTab>('personal')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  /* load profile from supabase */
  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const meta = user.user_metadata || {}
        const fullName: string = data?.full_name || meta.full_name || ''
        const parts = fullName.trim().split(/\s+/)
        setForm({
          first_name: data?.first_name || parts[0] || '',
          last_name: data?.last_name || parts.slice(1).join(' ') || '',
          phone: data?.phone || '',
          gender: data?.gender || '',
          dob: data?.dob || '',
          city: data?.city || '',
          state: data?.state || '',
          language: data?.language || 'English',
        })
        if (data?.photo_url) setPhotoUrl(data.photo_url)
      })
  }, [user])

  /* derive display values */
  const displayName =
    [form.first_name, form.last_name].filter(Boolean).join(' ') ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'User'

  const initials = displayName
    .split(/\s+/)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  /* profile strength heuristic */
  const fields = [form.first_name, form.last_name, user?.email, form.phone, form.gender, form.dob, form.city, form.state, form.language, role]
  const filled = fields.filter(Boolean).length
  const strength = Math.round((filled / fields.length) * 100)

  /* photo upload */
  const handlePhoto = async (file: File) => {
    if (!user) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `profiles/${user.id}.${ext}`
      let bucket = 'profile-photos'
      let { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
      if (error) {
        bucket = 'lawyer-photos'
        const r = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
        if (r.error) throw r.error
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      await supabase.from('profiles').upsert({ id: user.id, photo_url: data.publicUrl, role })
      setPhotoUrl(data.publicUrl)
      showToast('Profile photo updated.')
    } catch {
      showToast('Failed to upload photo.', false)
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = async () => {
    if (!user) return
    await supabase.from('profiles').upsert({ id: user.id, photo_url: null, role })
    setPhotoUrl(null)
    showToast('Photo removed.')
  }

  /* save */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      const full_name = [form.first_name, form.last_name].filter(Boolean).join(' ')
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        gender: form.gender,
        dob: form.dob,
        city: form.city,
        state: form.state,
        language: form.language,
        role,
      })
      if (error) throw error
      showToast('Profile saved successfully.')
    } catch {
      showToast('Could not save profile.', false)
    } finally {
      setSaving(false)
    }
  }

  const set = (k: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const navItems: { id: NavTab; label: string; sub: string; Icon: React.FC }[] = [
    { id: 'personal', label: 'Personal details', sub: 'Name, contact and location', Icon: IconUser },
    { id: 'security', label: 'Security', sub: 'Password and signed-in devices', Icon: IconLock },
    { id: 'notifications', label: 'Notifications', sub: 'Alerts and communication', Icon: IconBell },
  ]

  const indiaStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
  ]

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">

      {/* ── Toast ───────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-2xl anim-rise ${toast.ok ? 'border-good/30 bg-good/10 text-good' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
          <span className={`grid size-5 place-items-center rounded-md ${toast.ok ? 'bg-good/20' : 'bg-red-500/20'}`}>
            <IconCheck />
          </span>
          {toast.msg}
        </div>
      )}

      {/* ── Page body ────────────────────────────────────────── */}
      <div className="flex-1 px-4 sm:px-8 py-8 max-w-[1100px] mx-auto w-full">

        {/* Back link */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-[0.78rem] text-muted hover:text-ink transition mb-6 cursor-pointer"
        >
          <IconArrowLeft />
          <span>Client dashboard</span>
        </button>

        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="eyebrow text-accent text-[0.65rem] mb-1">ACCOUNT SETTINGS</p>
            <h1 className="font-display text-[clamp(2rem,4vw,2.8rem)] font-bold text-inkstrong leading-tight">
              My profile
            </h1>
            <p className="mt-1 text-[0.85rem] text-muted">
              Manage your identity, security, and communication preferences.
            </p>
          </div>
          {/* Verified badge */}
          <div className="mt-1 flex items-center gap-1.5 rounded-full border border-good/40 bg-good/10 px-3.5 py-1.5 text-[0.7rem] font-semibold text-good shrink-0">
            <IconCheck />
            <span>VERIFIED CLIENT</span>
          </div>
        </div>

        {/* Two-panel layout */}
        <div className="flex gap-5 items-start">

          {/* ── Left sidebar ─────────────────────────────────── */}
          <div className="w-[270px] shrink-0 space-y-4">

            {/* Avatar card */}
            <div className="rounded-2xl border border-line bg-cardsolid p-5 flex flex-col items-center text-center">
              {/* Avatar square */}
              <div className="relative mb-4">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="size-[88px] rounded-2xl object-cover border-2 border-line shadow-lg"
                  />
                ) : (
                  <div
                    className="size-[88px] rounded-2xl flex items-center justify-center text-white text-2xl font-display font-bold shadow-lg border-2 border-white/10"
                    style={{ background: 'linear-gradient(135deg,#4F6EF7 0%,#2547D0 100%)' }}
                  >
                    {initials}
                  </div>
                )}
                {/* Plus badge */}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 size-6 rounded-full bg-accent flex items-center justify-center text-white text-sm shadow cursor-pointer hover:brightness-110 transition"
                >
                  +
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhoto(f) }} />
              </div>

              <p className="font-semibold text-inkstrong text-[0.95rem]">{displayName}</p>
              <p className="text-[0.72rem] text-muted mt-0.5 mb-3">{user?.email}</p>

              {/* CLIENT ACCOUNT pill */}
              <div className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accentsoft px-3 py-1 text-[0.65rem] font-semibold text-accent mb-4">
                <IconUser />
                <span>CLIENT ACCOUNT</span>
              </div>

              {/* Profile strength bar */}
              <div className="w-full mb-4">
                <div className="flex justify-between text-[0.65rem] text-muted mb-1.5">
                  <span>Profile strength</span>
                  <span className="text-inkstrong font-semibold">{strength}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-card2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${strength}%`, background: 'linear-gradient(90deg,#4F6EF7,#34D399)' }}
                  />
                </div>
              </div>

              {/* Photo buttons */}
              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 rounded-xl bg-card2 border border-line py-2 text-[0.75rem] font-medium text-ink hover:bg-card transition cursor-pointer disabled:opacity-50"
                >
                  {uploading ? 'Uploading…' : 'Change photo'}
                </button>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="flex-1 rounded-xl bg-card2 border border-line py-2 text-[0.75rem] font-medium text-muted hover:text-red-400 hover:border-red-400/30 transition cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Nav items */}
            <div className="rounded-2xl border border-line bg-cardsolid overflow-hidden">
              {navItems.map(({ id, label, sub, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition cursor-pointer border-b border-line last:border-b-0 ${activeTab === id ? 'bg-accentsoft' : 'hover:bg-card2'}`}
                >
                  <span className={`grid size-7 shrink-0 place-items-center rounded-lg ${activeTab === id ? 'bg-accent text-white' : 'bg-card2 text-muted'}`}>
                    <Icon />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[0.82rem] font-medium leading-tight ${activeTab === id ? 'text-accent' : 'text-ink'}`}>{label}</p>
                    <p className="text-[0.67rem] text-muted leading-tight mt-0.5">{sub}</p>
                  </div>
                  <IconArrowRight />
                </button>
              ))}
            </div>
          </div>

          {/* ── Right form panel ─────────────────────────────── */}
          <div className="flex-1 min-w-0 rounded-2xl border border-line bg-cardsolid">
            <form onSubmit={handleSave}>
              {activeTab === 'personal' && (
                <div className="p-6 sm:p-8">
                  {/* Panel header */}
                  <p className="eyebrow text-accent text-[0.65rem] mb-1">PERSONAL DETAILS</p>
                  <div className="flex items-start justify-between mb-6 pb-5 border-b border-line">
                    <div>
                      <h2 className="text-[1.35rem] font-display font-semibold text-inkstrong">Your information</h2>
                    </div>
                    <p className="text-[0.75rem] text-muted text-right leading-relaxed max-w-[220px]">
                      Used for advocate communication, case filing, and hearing reminders.
                    </p>
                  </div>

                  {/* Grid form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">

                    {/* First Name */}
                    <div>
                      <label className={labelCls}>FIRST NAME</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"><IconUser /></span>
                        <input type="text" value={form.first_name} onChange={set('first_name')} placeholder="First name" className={inputWithIcon} />
                      </div>
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className={labelCls}>LAST NAME</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"><IconUser /></span>
                        <input type="text" value={form.last_name} onChange={set('last_name')} placeholder="Last name" className={inputWithIcon} />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={labelCls} style={{ marginBottom: 0 }}>EMAIL ADDRESS</label>
                        <span className="flex items-center gap-1 text-[0.65rem] text-good font-medium">
                          <IconCheck /> Verified
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"><IconMail /></span>
                        <div className="relative">
                          <input type="email" value={user?.email || ''} disabled className={`${inputWithIcon} opacity-60 cursor-not-allowed`} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-good"><IconCheck /></span>
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className={labelCls}>PHONE NUMBER</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"><IconPhone /></span>
                        <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" className={inputWithIcon} />
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className={labelCls}>GENDER</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none"><IconUser /></span>
                        <select value={form.gender} onChange={set('gender')} className={selectWithIcon}>
                          <option value="" className="bg-cardsolid">Select…</option>
                          <option value="Male" className="bg-cardsolid">Male</option>
                          <option value="Female" className="bg-cardsolid">Female</option>
                          <option value="Non-binary" className="bg-cardsolid">Non-binary</option>
                          <option value="Prefer not to say" className="bg-cardsolid">Prefer not to say</option>
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5"><polyline points="6 9 12 15 18 9" /></svg>
                        </span>
                      </div>
                    </div>

                    {/* Date of birth */}
                    <div>
                      <label className={labelCls}>DATE OF BIRTH</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none"><IconCalendar /></span>
                        <input type="date" value={form.dob} onChange={set('dob')} className={`${inputWithIcon} [color-scheme:dark]`} />
                      </div>
                    </div>

                    {/* City */}
                    <div>
                      <label className={labelCls}>CITY</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"><IconMapPin /></span>
                        <input type="text" value={form.city} onChange={set('city')} placeholder="e.g. Nagpur" className={inputWithIcon} />
                      </div>
                    </div>

                    {/* State */}
                    <div>
                      <label className={labelCls}>STATE</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none"><IconMapPin /></span>
                        <select value={form.state} onChange={set('state')} className={selectWithIcon}>
                          <option value="" className="bg-cardsolid">Select state…</option>
                          {indiaStates.map(s => (
                            <option key={s} value={s} className="bg-cardsolid">{s}</option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5"><polyline points="6 9 12 15 18 9" /></svg>
                        </span>
                      </div>
                    </div>

                    {/* Preferred Language */}
                    <div>
                      <label className={labelCls}>PREFERRED LANGUAGE</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none"><IconGlobe /></span>
                        <select value={form.language} onChange={set('language')} className={selectWithIcon}>
                          <option value="English" className="bg-cardsolid">English</option>
                          <option value="Hindi" className="bg-cardsolid">Hindi</option>
                          <option value="Marathi" className="bg-cardsolid">Marathi</option>
                          <option value="Tamil" className="bg-cardsolid">Tamil</option>
                          <option value="Telugu" className="bg-cardsolid">Telugu</option>
                          <option value="Kannada" className="bg-cardsolid">Kannada</option>
                          <option value="Bengali" className="bg-cardsolid">Bengali</option>
                          <option value="Gujarati" className="bg-cardsolid">Gujarati</option>
                          <option value="Punjabi" className="bg-cardsolid">Punjabi</option>
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5"><polyline points="6 9 12 15 18 9" /></svg>
                        </span>
                      </div>
                    </div>

                    {/* Account Role — read-only */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={labelCls} style={{ marginBottom: 0 }}>ACCOUNT ROLE</label>
                        <span className="text-[0.65rem] text-faint">Read only</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent"><IconShield /></span>
                        <input
                          type="text"
                          value={role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Client'}
                          disabled
                          className={`${inputWithIcon} opacity-70 cursor-not-allowed text-accent`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save row */}
                  <div className="mt-6 pt-5 border-t border-line flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[0.73rem] text-muted">
                      <span className="text-good"><IconShield /></span>
                      Changes are encrypted and audit logged.
                    </span>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 rounded-xl bg-accent text-white px-5 py-2.5 text-[0.85rem] font-semibold shadow-[0_6px_20px_-8px_var(--glow-a)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          Save changes
                          <IconArrowRight />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="p-8 text-center py-20">
                  <div className="grid size-12 place-items-center rounded-xl bg-card2 border border-line mx-auto mb-4 text-muted">
                    <IconLock />
                  </div>
                  <p className="text-inkstrong font-semibold mb-1">Security settings</p>
                  <p className="text-muted text-sm">Password management and device sessions — coming soon.</p>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="p-8 text-center py-20">
                  <div className="grid size-12 place-items-center rounded-xl bg-card2 border border-line mx-auto mb-4 text-muted">
                    <IconBell />
                  </div>
                  <p className="text-inkstrong font-semibold mb-1">Notification preferences</p>
                  <p className="text-muted text-sm">Email, SMS, and in-app alert settings — coming soon.</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* ── Footer strip ─────────────────────────────────────── */}
      <footer className="border-t border-line px-6 py-3 flex items-center justify-between text-[0.72rem] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="text-good"><IconShield /></span>
          Personal data is encrypted and never sold.
        </span>
        <nav className="flex items-center gap-4">
          <a href="mailto:support@legalnexus.in" className="hover:text-ink transition">Contact support</a>
          <span className="text-line">·</span>
          <a href="#" className="hover:text-ink transition">Privacy help</a>
          <span className="text-line">·</span>
          <button type="button" onClick={() => navigate('/dashboard')} className="hover:text-ink transition cursor-pointer">Client dashboard</button>
        </nav>
      </footer>
    </div>
  )
}
