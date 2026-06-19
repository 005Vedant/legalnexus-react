import React, { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const [lawyers, setLawyers] = useState<any[]>([])
  const [cases, setCases] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()

    const interval = setInterval(() => {
      loadData()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  async function loadData() {
    try {
      const [lawyersRes, casesRes, profilesRes] = await Promise.all([
        fetch('http://localhost:4000/api/lawyers'),
        fetch('http://localhost:4000/api/cases'),
        fetch('http://localhost:4000/api/profiles')
      ])

      const lawyersData = await lawyersRes.json()
      const casesData = await casesRes.json()
      const profilesData = await profilesRes.json()

      setLawyers(Array.isArray(lawyersData) ? lawyersData : [])
      setCases(Array.isArray(casesData) ? casesData : [])
      setProfiles(Array.isArray(profilesData) ? profilesData : [])
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading Dashboard...
      </div>
    )
  }

  const clients = profiles.filter(
    (profile) => profile.role === 'client'
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage lawyers, clients and monitor case activity across LegalNexus.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">
            Total Lawyers
          </h2>

          <p className="text-4xl font-bold mt-3">
            {lawyers.length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">
            Total Cases
          </h2>

          <p className="text-4xl font-bold mt-3">
            {cases.length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">
            Total Clients
          </h2>

          <p className="text-4xl font-bold mt-3">
            {clients.length}
          </p>
        </div>

      </div>

      {/* Lawyers */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Lawyers
        </h2>

        {lawyers.length === 0 ? (
          <p className="text-gray-500">
            No lawyers added yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Specialization</th>
                </tr>
              </thead>

              <tbody>
                {lawyers.map((lawyer) => (
                  <tr key={lawyer.id} className="border-b">
                    <td className="py-2">
                      {lawyer.name || lawyer.full_name || '-'}
                    </td>

                    <td className="py-2">
                      {lawyer.specialty || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clients */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Clients
        </h2>

        {clients.length === 0 ? (
          <p className="text-gray-500">
            No clients found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Phone</th>
                  <th className="text-left py-2">Gender</th>
                  <th className="text-left py-2">Age</th>
                </tr>
              </thead>

              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b">
                    <td className="py-2">
                      {client.full_name || '-'}
                    </td>

                    <td className="py-2">
                      {client.phone || '-'}
                    </td>

                    <td className="py-2">
                      {client.gender || '-'}
                    </td>

                    <td className="py-2">
                      {client.age || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cases */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Recent Cases
        </h2>

        {cases.length === 0 ? (
          <p className="text-gray-500">
            No cases submitted yet.
          </p>
        ) : (
          <div className="space-y-4">
            {cases.map((c) => (
              <div
                key={c.id}
                className="border rounded-xl p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">
                      {c.title || c.case_title}
                    </h3>

                    {(c.case_type || c.type) && (
                      <p className="text-sm text-blue-600">
                        {c.case_type || c.type}
                      </p>
                    )}
                  </div>

                  <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
                    {c.status || 'pending'}
                  </span>
                </div>

                {(c.description || c.case_description) && (
                  <p className="mt-2 text-gray-600">
                    {c.description || c.case_description}
                  </p>
                )}

                <div className="mt-3 text-sm text-gray-500 space-y-1">

                  {(c.case_location || c.location) && (
                    <div>
                      📍 {c.case_location || c.location}
                    </div>
                  )}

                  {c.hearing_date && (
                    <div>
                      📅 {new Date(c.hearing_date).toLocaleDateString()}
                    </div>
                  )}

                  {c.created_at && (
                    <div>
                      🕐 {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  )}

                </div>

                {/* Assign Lawyer */}
<div className="mt-3">
  <label className="text-xs font-medium text-gray-500 block mb-1">
    Assign Lawyer
  </label>
  <div className="flex gap-2">
    <select
      defaultValue={c.assigned_lawyer_id || ''}
      onChange={async e => {
        await fetch(`/api/cases/${c.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assigned_lawyer_id: e.target.value || null })
        })
        loadData()
      }}
      className="flex-1 text-sm border rounded-xl px-3 py-2 text-gray-700 focus:outline-none">
      <option value="">Select lawyer...</option>
      {lawyers.map(l => (
        <option key={l.id} value={l.id}>
          {l.name} — {l.specialty}
        </option>
      ))}
    </select>
  </div>
  {c.assigned_lawyer_id && (
    <p className="text-xs text-green-600 mt-1 font-medium">
      ✅ Assigned to: {lawyers.find(l => l.id === c.assigned_lawyer_id)?.name || 'Unknown'}
    </p>
  )}
</div>

{/* Update Status */}
<div className="mt-3">
  <label className="text-xs font-medium text-gray-500 block mb-1">
    Update Status
  </label>
  <select
    value={c.status}
    onChange={async e => {
      await fetch(`/api/cases/${c.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: e.target.value })
      })
      loadData()
    }}
    className="w-full text-sm border rounded-xl px-3 py-2 text-gray-700 focus:outline-none">
    <option>Pending</option>
    <option>In Progress</option>
    <option>Hearing Scheduled</option>
    <option>Resolved</option>
    <option>Closed</option>
  </select>
</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}