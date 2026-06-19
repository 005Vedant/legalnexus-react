import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

interface ProfileFormProps {
  profileForm: any
  setProfileForm: (f: any) => void
  saving: boolean
  message: string
  userEmail: string
  isNew: boolean
  onSave: () => void
}

function LawyerProfileForm({ profileForm, setProfileForm, saving, message, userEmail, isNew, onSave }: ProfileFormProps) {
  const [uploading, setUploading] = useState(false)

  const handlePhotoUpload = async (file: File) => {
    try {
      setUploading(true)
      const ext = file.name.split('.').pop()
      const path = `lawyers/${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from('lawyer-photos')
        .upload(path, file, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from('lawyer-photos').getPublicUrl(path)
        setProfileForm({ ...profileForm, profile_image: data.publicUrl })
      }
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {isNew && (
        <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-sm mb-2">
          👋 Welcome! Please create your lawyer profile to get started.
        </div>
      )}

      <div className="flex flex-col items-center mb-2">
        {profileForm.profile_image ? (
          <img src={profileForm.profile_image} alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-green-100 mb-2" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-green-100 mb-2">
            {profileForm.name?.charAt(0) || '⚖️'}
          </div>
        )}
        <label className="cursor-pointer">
          <span className="text-sm text-green-600 hover:underline font-medium">
            {uploading ? '⏳ Uploading...' : '📷 Upload Profile Photo'}
          </span>
          <input type="file" accept="image/*" className="hidden" disabled={uploading}
            onChange={e => { const file = e.target.files?.[0]; if (file) handlePhotoUpload(file) }} />
        </label>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Full Name</label>
        <input value={profileForm.name}
          onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
          placeholder="Adv. Your Name"
          className="w-full mt-1 p-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Specialization</label>
        <select value={profileForm.specialty}
          onChange={e => setProfileForm({ ...profileForm, specialty: e.target.value })}
          className="w-full mt-1 p-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">Select specialty</option>
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
        <label className="text-sm font-medium text-gray-700">Experience (years)</label>
        <input type="number" value={profileForm.experience_years}
          onChange={e => setProfileForm({ ...profileForm, experience_years: e.target.value })}
          placeholder="5"
          className="w-full mt-1 p-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Phone</label>
        <input value={profileForm.phone}
          onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
          placeholder="9876543210"
          className="w-full mt-1 p-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Email</label>
        <input value={userEmail} disabled
          className="w-full mt-1 p-3 rounded-xl border border-gray-200 text-gray-400 bg-gray-50" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Bio</label>
        <textarea value={profileForm.bio}
          onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
          placeholder="Write a short bio about yourself..."
          className="w-full mt-1 p-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none" />
      </div>
      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${
          message.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>
      )}
      <button onClick={onSave} disabled={saving}
        className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50">
        {saving ? 'Saving...' : isNew ? 'Create My Profile' : 'Save Profile'}
      </button>
    </div>
  )
}

interface CaseCardProps {
  c: any
  showActions: boolean
  updateCaseStatus: (id: string, status: string) => void
  saveNote: (id: string) => void
  saveHearing: (id: string) => void
  noteInputs: { [key: string]: string }
  setNoteInputs: (f: any) => void
  hearingInputs: { [key: string]: string }
  setHearingInputs: (f: any) => void
}

function CaseCard({ c, showActions, updateCaseStatus, saveNote, saveHearing, noteInputs, setNoteInputs, hearingInputs, setHearingInputs }: CaseCardProps) {
  const statusColor: any = {
    'Pending': 'bg-yellow-100 text-yellow-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Hearing Scheduled': 'bg-purple-100 text-purple-700',
    'Resolved': 'bg-green-100 text-green-700',
    'Closed': 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="bg-white rounded-2xl p-5 border shadow-sm">
      <div className="flex items-start justify-between mb-3">
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
      {c.document_url && (
        <a href={c.document_url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-3">
          📎 View case document
        </a>
      )}
      {c.notes && (
        <div className="mb-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
          <p className="text-xs font-medium text-yellow-700 mb-1">📝 Note:</p>
          <p className="text-sm text-yellow-900">{c.notes}</p>
        </div>
      )}
      {showActions && (
        <div className="space-y-3 mt-3 border-t pt-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Update Status</label>
            <select value={c.status} onChange={e => updateCaseStatus(c.id, e.target.value)}
              className="w-full text-sm border rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>Pending</option>
              <option>In Progress</option>
              <option>Hearing Scheduled</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Set Hearing Date</label>
            <div className="flex gap-2">
              <input type="datetime-local"
                value={hearingInputs[c.id] || ''}
                onChange={e => setHearingInputs((prev: any) => ({ ...prev, [c.id]: e.target.value }))}
                className="flex-1 text-sm border rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" />
              <button onClick={() => saveHearing(c.id)}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700">
                📅 Set
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Add Note for Client</label>
            <div className="flex gap-2">
              <input value={noteInputs[c.id] || ''}
                onChange={e => setNoteInputs((prev: any) => ({ ...prev, [c.id]: e.target.value }))}
                placeholder="Write a note..."
                className="flex-1 text-sm border rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" />
              <button onClick={() => saveNote(c.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700">
                💾 Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LawyerDashboard() {
  const { user } = useAuth()
  const [cases, setCases] = useState<any[]>([])
  const [allCases, setAllCases] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'mycases' | 'allcases' | 'profile'>('overview')
  const [profileForm, setProfileForm] = useState({
    name: '', bio: '', specialty: '',
    experience_years: '', phone: '', email: '',
    profile_image: ''
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [noteInputs, setNoteInputs] = useState<{ [key: string]: string }>({})
  const [hearingInputs, setHearingInputs] = useState<{ [key: string]: string }>({})

  const fetchData = async () => {
    setLoading(true)
    const casesRes = await fetch('/api/cases')
    const casesData = await casesRes.json()
    setAllCases(Array.isArray(casesData) ? casesData : [])

    // First try by user_id
    let profileData = null

    if (user?.id) {
      const { data } = await supabase
        .from('lawyers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      profileData = data
    }

    // If not found, try by email and auto-link
    if (!profileData && user?.email) {
      const { data: byEmail } = await supabase
        .from('lawyers')
        .select('*')
        .eq('email', user.email)
        .maybeSingle()

      if (byEmail) {
        await supabase
          .from('lawyers')
          .update({ user_id: user.id })
          .eq('id', byEmail.id)
        profileData = { ...byEmail, user_id: user.id }
      }
    }

    if (profileData) {
      setProfile(profileData)
      setProfileForm({
        name: profileData.name || '',
        bio: profileData.bio || '',
        specialty: profileData.specialty || '',
        experience_years: profileData.experience_years || '',
        phone: profileData.phone || '',
        email: profileData.email || user?.email || '',
        profile_image: profileData.profile_image || '',
      })
      const assigned = casesData.filter((c: any) => c.assigned_lawyer_id === profileData.id)
      setCases(assigned)
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const createProfile = async () => {
    if (!profileForm.name) {
      setMessage('❌ Please enter your name!')
      return
    }
    setSaving(true)
    const res = await fetch('/api/lawyers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: profileForm.name,
        specialty: profileForm.specialty,
        experience_years: profileForm.experience_years ? Number(profileForm.experience_years) : null,
        phone: profileForm.phone,
        email: user?.email,
        bio: profileForm.bio,
        profile_image: profileForm.profile_image || null,
        user_id: user?.id,
      })
    })
    if (res.ok) {
      setMessage('✅ Profile created successfully!')
      fetchData()
    } else {
      setMessage('❌ Failed to create profile. Try again.')
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const saveProfile = async () => {
    setSaving(true)
    if (profile) {
      await fetch(`/api/lawyers/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileForm,
          experience_years: profileForm.experience_years ? Number(profileForm.experience_years) : null,
          user_id: user?.id,
        })
      })
      setMessage('✅ Profile updated!')
    }
    setSaving(false)
    fetchData()
    setTimeout(() => setMessage(''), 3000)
  }

  const updateCaseStatus = async (caseId: string, status: string) => {
    await fetch(`/api/cases/${caseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    fetchData()
  }

  const saveNote = async (caseId: string) => {
    const note = noteInputs[caseId]
    if (!note) return
    await fetch(`/api/cases/${caseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: note })
    })
    setNoteInputs(prev => ({ ...prev, [caseId]: '' }))
    fetchData()
  }

  const saveHearing = async (caseId: string) => {
    const date = hearingInputs[caseId]
    if (!date) return
    await fetch(`/api/cases/${caseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hearing_date: new Date(date).toISOString(),
        status: 'Hearing Scheduled'
      })
    })
    await fetch('/api/hearings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        case_id: caseId,
        hearing_date: new Date(date).toISOString(),
        created_by: user?.id
      })
    })
    setHearingInputs(prev => ({ ...prev, [caseId]: '' }))
    fetchData()
  }

  if (loading) return (
    <div className="flex justify-center items-center h-40">
      <div className="text-gray-600 text-lg">Loading...</div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold">
          Welcome, {profile?.name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Lawyer'} ⚖️
        </h1>
        <p className="text-green-100 mt-1 text-sm">LegalNexus — Manage your cases and clients</p>
        <div className="flex gap-3 mt-4 flex-wrap">
          <div className="bg-white/20 rounded-xl p-3 text-center min-w-[80px]">
            <div className="text-2xl font-bold">{cases.length}</div>
            <div className="text-xs text-green-100">My Cases</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center min-w-[80px]">
            <div className="text-2xl font-bold">{cases.filter(c => c.status === 'Pending').length}</div>
            <div className="text-xs text-green-100">Pending</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center min-w-[80px]">
            <div className="text-2xl font-bold">{cases.filter(c => c.status === 'Hearing Scheduled').length}</div>
            <div className="text-xs text-green-100">Hearings</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center min-w-[80px]">
            <div className="text-2xl font-bold">{cases.filter(c => c.status === 'Resolved').length}</div>
            <div className="text-xs text-green-100">Resolved</div>
          </div>
        </div>
      </div>

      {!profile && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
          <p className="text-yellow-800 font-medium">
            ⚠️ Your lawyer profile is not set up yet. Please complete your profile.
          </p>
          <button onClick={() => setActiveTab('profile')}
            className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-xl text-sm font-medium hover:bg-yellow-700">
            Setup Profile →
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'mycases', label: `📋 My Cases (${cases.length})` },
          { id: 'allcases', label: `📁 All Cases (${allCases.length})` },
          { id: 'profile', label: '👤 My Profile' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-green-600 text-white shadow'
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-2xl p-4 border shadow-sm text-center">
              <div className="text-3xl mb-2">📋</div>
              <h3 className="font-bold text-gray-900 text-2xl">{cases.length}</h3>
              <p className="text-sm text-gray-500 mt-1">Assigned Cases</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border shadow-sm text-center">
              <div className="text-3xl mb-2">📅</div>
              <h3 className="font-bold text-gray-900 text-2xl">
                {cases.filter(c => c.status === 'Hearing Scheduled').length}
              </h3>
              <p className="text-sm text-gray-500 mt-1">Upcoming Hearings</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border shadow-sm text-center">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="font-bold text-gray-900 text-2xl">
                {cases.filter(c => c.status === 'Resolved').length}
              </h3>
              <p className="text-sm text-gray-500 mt-1">Resolved Cases</p>
            </div>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Recent Assigned Cases</h2>
          {cases.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border">
              <div className="text-5xl mb-3">📂</div>
              <p className="text-gray-500">No cases assigned yet</p>
            </div>
          ) : (
            cases.slice(0, 3).map(c => (
              <CaseCard key={c.id} c={c} showActions={false}
                updateCaseStatus={updateCaseStatus} saveNote={saveNote} saveHearing={saveHearing}
                noteInputs={noteInputs} setNoteInputs={setNoteInputs}
                hearingInputs={hearingInputs} setHearingInputs={setHearingInputs} />
            ))
          )}
          {cases.length > 3 && (
            <button onClick={() => setActiveTab('mycases')}
              className="text-green-600 text-sm font-medium hover:underline">
              View all {cases.length} assigned cases →
            </button>
          )}
        </div>
      )}

      {activeTab === 'mycases' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">My Assigned Cases</h2>
          {cases.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border">
              <div className="text-5xl mb-3">📂</div>
              <p className="text-gray-500">No cases assigned to you yet</p>
            </div>
          ) : (
            cases.map(c => (
              <CaseCard key={c.id} c={c} showActions={true}
                updateCaseStatus={updateCaseStatus} saveNote={saveNote} saveHearing={saveHearing}
                noteInputs={noteInputs} setNoteInputs={setNoteInputs}
                hearingInputs={hearingInputs} setHearingInputs={setHearingInputs} />
            ))
          )}
        </div>
      )}

      {activeTab === 'allcases' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">All Cases</h2>
          {allCases.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border">
              <p className="text-gray-500">No cases found</p>
            </div>
          ) : (
            allCases.map(c => (
              <CaseCard key={c.id} c={c} showActions={false}
                updateCaseStatus={updateCaseStatus} saveNote={saveNote} saveHearing={saveHearing}
                noteInputs={noteInputs} setNoteInputs={setNoteInputs}
                hearingInputs={hearingInputs} setHearingInputs={setHearingInputs} />
            ))
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl p-6 border shadow-sm max-w-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Lawyer Profile</h2>
          <LawyerProfileForm
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            saving={saving}
            message={message}
            userEmail={user?.email || ''}
            isNew={!profile}
            onSave={!profile ? createProfile : saveProfile}
          />
        </div>
      )}
    </div>
  )
}