import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import AddLawyerDialog from '../components/AddLawyerDialog'
import { supabase } from '../lib/supabase'

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

export default function Lawyers() {
  const { role } = useAuth()
  const [list, setList] = useState<Lawyer[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchList = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/lawyers')
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
    await fetch(`/api/lawyers/${id}`, { method: 'DELETE' })
    fetchList()
  }

  const handlePhotoUpload = async (lawyerId: string, file: File) => {
    try {
      setUploading(lawyerId)
      const ext = file.name.split('.').pop()
      const path = `${lawyerId}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('lawyer-photos')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage
        .from('lawyer-photos')
        .getPublicUrl(path)
      await fetch(`/api/lawyers/${lawyerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_image: data.publicUrl })
      })
      fetchList()
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(null)
    }
  }

  useEffect(() => { fetchList() }, [])

  const filtered = list.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.specialty || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="flex justify-center items-center h-40">
      <div className="text-gray-800 text-lg font-medium">Loading lawyers...</div>
    </div>
  )

  return (
    <section className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Our Lawyers</h1>
        {/* Only admin can add lawyers */}
        {role === 'admin' && <AddLawyerDialog onCreated={() => fetchList()} />}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name or specialty..."
        className="w-full mb-5 p-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {filtered.length === 0 ? (
        <p className="text-gray-600 font-medium">No lawyers found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((l) => (
            <div key={l.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">

              {/* Photo */}
              <div className="flex flex-col items-center pt-6 px-4">
                {l.profile_image ? (
                  <img src={l.profile_image} alt={l.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-100" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-blue-100">
                    {l.name.charAt(0)}
                  </div>
                )}

                {/* Upload photo — admin only */}
                {role === 'admin' && (
                  <label className="mt-2 cursor-pointer">
                    <span className="text-xs text-blue-600 hover:underline font-medium">
                      {uploading === l.id ? 'Uploading...' : '📷 Upload Photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading === l.id}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handlePhotoUpload(l.id, file)
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <h2 className="text-lg font-bold text-gray-900 text-center">{l.name}</h2>
                {l.specialty && (
                  <div className="flex justify-center mt-1">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium">
                      {l.specialty}
                    </span>
                  </div>
                )}
                <div className="mt-3 space-y-1">
                  {l.experience_years && (
                    <p className="text-sm text-gray-800">🏛️ <span className="font-medium">{l.experience_years} years</span> experience</p>
                  )}
                  {l.rating && (
                    <p className="text-sm text-yellow-600">⭐ <span className="font-medium">{l.rating}</span> rating</p>
                  )}
                  {l.email && <p className="text-sm text-gray-800">📧 {l.email}</p>}
                  {l.phone && <p className="text-sm text-gray-800">📞 {l.phone}</p>}
                </div>

                {/* Delete — admin only */}
                {role === 'admin' && (
                  <button
                    onClick={() => handleDelete(l.id)}
                    className="mt-4 w-full py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors border border-red-200">
                    🗑️ Delete Lawyer
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