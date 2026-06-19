import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const { user, role } = useAuth()
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    gender: '',
    age: '',
  })
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

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
      const { error } = await supabase.storage
        .from('lawyer-photos')
        .upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('lawyer-photos').getPublicUrl(path)
      await supabase.from('profiles').upsert({
        id: user?.id,
        photo_url: data.publicUrl,
        role
      })
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
      id: user?.id,
      full_name: form.full_name,
      phone: form.phone,
      gender: form.gender,
      age: form.age,
      role,
    })
    setMessage('✅ Profile saved successfully!')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const roleLabel = role === 'admin' ? '🛡️ Admin' : role === 'lawyer' ? '⚖️ Lawyer' : '👤 Client'
  const roleBg = role === 'admin' ? 'bg-gray-900 text-white' : role === 'lawyer' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

        {/* Top Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 flex flex-col items-center">

          {/* Photo */}
          <div className="relative mb-3">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-400 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow">
                {(form.full_name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}

            {/* Upload button */}
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-gray-50 transition">
              {uploading ? (
                <span className="text-xs animate-spin">⏳</span>
              ) : (
                <span className="text-sm">📷</span>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handlePhotoUpload(file)
                }}
              />
            </label>
          </div>

          <h2 className="text-xl font-bold text-white">
            {form.full_name || user?.email || 'User'}
          </h2>
          <p className="text-blue-100 text-sm mt-0.5">{user?.email}</p>
          <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${roleBg}`}>
            {roleLabel}
          </span>
          {uploading && (
            <p className="text-blue-100 text-xs mt-2">Uploading photo...</p>
          )}
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">

          {message && (
            <div className="p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
              {message}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              placeholder="Enter your full name"
              className="w-full mt-1 p-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              value={user?.email || ''}
              disabled
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 text-gray-400 bg-gray-50"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="Enter your phone number"
              className="w-full mt-1 p-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <select
                value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value })}
                className="w-full mt-1 p-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                value={form.age}
                onChange={e => setForm({ ...form, age: e.target.value })}
                placeholder="Your age"
                className="w-full mt-1 p-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <input
              value={roleLabel}
              disabled
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 text-gray-400 bg-gray-50"
            />
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}