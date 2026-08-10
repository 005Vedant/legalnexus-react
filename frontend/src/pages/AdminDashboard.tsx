import React, { useEffect, useState } from 'react'
import { authFetch } from '../lib/authFetch'

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  'Pending':           { color: '#F59E0B', bg: '#FEF3C7', label: 'Pending' },
  'In Progress':       { color: '#3B82F6', bg: '#EFF6FF', label: 'In Progress' },
  'Hearing Scheduled': { color: '#8B5CF6', bg: '#F5F3FF', label: 'Hearing Scheduled' },
  'Resolved':          { color: '#10B981', bg: '#ECFDF5', label: 'Resolved' },
  'Closed':            { color: '#6B7280', bg: '#F9FAFB', label: 'Closed' },
}

const STATUSES = Object.keys(STATUS_CONFIG)

function StatCard({ label, value, icon, accent }: { label: string; value: number; icon: string; accent: string }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '28px 32px',
      boxShadow: '0 1px 4px rgba(17,24,39,0.07), 0 0 0 1px rgba(17,24,39,0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(17,24,39,0.12), 0 0 0 1px rgba(17,24,39,0.07)'}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.boxShadow = '0 1px 4px rgba(17,24,39,0.07), 0 0 0 1px rgba(17,24,39,0.05)'}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: accent + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#6B7280', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: '#111827', lineHeight: 1.15, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { color: '#6B7280', bg: '#F3F4F6', label: status }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 999,
      background: cfg.bg, color: cfg.color,
      fontSize: 12, fontWeight: 600, letterSpacing: '0.03em',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
      {cfg.label}
    </span>
  )
}

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 1px 4px rgba(17,24,39,0.07), 0 0 0 1px rgba(17,24,39,0.05)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 28px', borderBottom: '1px solid #F3F4F6',
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h2>
        {action}
      </div>
      <div style={{ padding: '0 28px 24px' }}>{children}</div>
    </div>
  )
}

function StyledTable({ headers, rows, emptyMsg }: { headers: string[]; rows: React.ReactNode[][]; emptyMsg: string }) {
  if (rows.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
        {emptyMsg}
      </div>
    )
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{
                textAlign: 'left', padding: '14px 0 10px',
                color: '#6B7280', fontWeight: 600, fontSize: 12,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                borderBottom: '1px solid #F3F4F6',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '13px 0', color: '#374151', verticalAlign: 'middle' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StyledSelect({ value, onChange, children, style = {} }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        fontSize: 13, border: '1px solid #E5E7EB', borderRadius: 8,
        padding: '7px 12px', color: '#374151', background: '#fff',
        outline: 'none', cursor: 'pointer', appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
        paddingRight: 30,
        transition: 'border-color 0.15s',
        ...style,
      }}
      onFocus={(e: React.FocusEvent<HTMLSelectElement>) => e.target.style.borderColor = '#2563EB'}
      onBlur={(e: React.FocusEvent<HTMLSelectElement>) => e.target.style.borderColor = '#E5E7EB'}
    >
      {children}
    </select>
  )
}

export default function AdminDashboard() {
  const [lawyers, setLawyers] = useState<any[]>([])
  const [cases, setCases] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  async function loadData() {
    try {
      const [lawyersRes, casesRes, profilesRes] = await Promise.all([
        authFetch('/api/lawyers'),
        authFetch('/api/cases'),
        authFetch('/api/profiles'),
      ])
      const [lawyersData, casesData, profilesData] = await Promise.all([
        lawyersRes.json(), casesRes.json(), profilesRes.json(),
      ])
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
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: 280, gap: 16, color: '#6B7280',
      }}>
        <div style={{
          width: 36, height: 36, border: '3px solid #E5E7EB',
          borderTopColor: '#2563EB', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontSize: 14, fontWeight: 500 }}>Loading dashboard…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  const clients = profiles.filter(p => p.role === 'client')

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: '#F8FAFC', minHeight: '100vh', padding: '32px 24px',
      maxWidth: 1100, margin: '0 auto',
    }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, background: '#1E3A5F',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>⚖️</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#2563EB', letterSpacing: '0.06em', textTransform: 'uppercase' }}>LegalNexus</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>Admin Dashboard</h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
          Manage lawyers, clients, and monitor case activity.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Lawyers"  value={lawyers.length} icon="👨‍⚖️" accent="#2563EB" />
        <StatCard label="Total Cases"    value={cases.length}   icon="📁"    accent="#8B5CF6" />
        <StatCard label="Total Clients"  value={clients.length} icon="👥"    accent="#10B981" />
      </div>

      {/* Cases by Status */}
      <div style={{
        background: '#1E3A5F', borderRadius: 16, padding: '24px 28px', marginBottom: 24,
        boxShadow: '0 4px 24px rgba(30,58,95,0.18)',
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#93C5FD', letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 18px' }}>
          Cases by Status
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
          {STATUSES.map(s => {
            const count = cases.filter(c => (c.status || 'Pending') === s).length
            const cfg = STATUS_CONFIG[s]
            return (
              <div key={s} style={{
                background: 'rgba(255,255,255,0.07)', borderRadius: 12,
                padding: '16px 18px', border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: cfg.color, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>{s}</div>
                <div style={{ fontSize: 30, fontWeight: 700, color: '#fff' }}>{count}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Lawyers Table */}
        <SectionCard title={`Lawyers (${lawyers.length})`}>
          <StyledTable
            headers={['Name', 'Specialization']}
            emptyMsg="No lawyers added yet."
            rows={lawyers.map(l => [
              <span style={{ fontWeight: 500, color: '#111827' }}>{l.name || l.full_name || '—'}</span>,
              <span style={{ color: '#6B7280' }}>{l.specialty || '—'}</span>,
            ])}
          />
        </SectionCard>

        {/* Clients Table */}
        <SectionCard title={`Clients (${clients.length})`}>
          <StyledTable
            headers={['Name', 'Phone', 'Gender', 'Age']}
            emptyMsg="No clients found."
            rows={clients.map(c => [
              <span style={{ fontWeight: 500, color: '#111827' }}>{c.full_name || '—'}</span>,
              c.phone || '—',
              c.gender || '—',
              c.age || '—',
            ])}
          />
        </SectionCard>

        {/* Cases */}
        <SectionCard title={`Recent Cases (${cases.length})`}>
          {cases.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
              No cases submitted yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 20 }}>
              {cases.map(c => (
                <div key={c.id} style={{
                  border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 22px',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.borderColor = '#BFDBFE'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.07)'
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.borderColor = '#E5E7EB'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Case header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
                        {c.title || c.case_title}
                      </h3>
                      {(c.case_type || c.type) && (
                        <span style={{
                          fontSize: 12, fontWeight: 500, color: '#2563EB',
                          background: '#EFF6FF', padding: '2px 9px', borderRadius: 6,
                        }}>
                          {c.case_type || c.type}
                        </span>
                      )}
                    </div>
                    <StatusPill status={c.status || 'Pending'} />
                  </div>

                  {/* Description */}
                  {(c.description || c.case_description) && (
                    <p style={{ margin: '12px 0 0', fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
                      {c.description || c.case_description}
                    </p>
                  )}

                  {/* Meta */}
                  <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 12 }}>
                    {(c.case_location || c.location) && (
                      <span style={{ fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>📍</span> {c.case_location || c.location}
                      </span>
                    )}
                    {c.hearing_date && (
                      <span style={{ fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>📅</span> {new Date(c.hearing_date).toLocaleDateString()}
                      </span>
                    )}
                    {c.created_at && (
                      <span style={{ fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>🕐</span> {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16,
                    paddingTop: 16, borderTop: '1px solid #F3F4F6',
                  }}>
                    {/* Assign Lawyer */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                        Assign Lawyer
                      </label>
                      <StyledSelect
                        value={c.assigned_lawyer_id || ''}
                        onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                          await authFetch(`/api/cases/${c.id}`, {
                            method: 'PUT',
                            body: JSON.stringify({ assigned_lawyer_id: e.target.value || null }),
                          })
                          loadData()
                        }}
                        style={{ width: '100%' }}
                      >
                        <option value="">Select lawyer…</option>
                        {lawyers.map(l => (
                          <option key={l.id} value={l.id}>
                            {l.name} — {l.specialty}
                          </option>
                        ))}
                      </StyledSelect>
                      {c.assigned_lawyer_id && (
                        <p style={{ fontSize: 11, color: '#10B981', marginTop: 5, fontWeight: 500 }}>
                          ✓ {lawyers.find(l => l.id === c.assigned_lawyer_id)?.name || 'Assigned'}
                        </p>
                      )}
                    </div>

                    {/* Update Status */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                        Update Status
                      </label>
                      <StyledSelect
                        value={c.status || 'Pending'}
                        onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                          await authFetch(`/api/cases/${c.id}`, {
                            method: 'PUT',
                            body: JSON.stringify({ status: e.target.value }),
                          })
                          loadData()
                        }}
                        style={{ width: '100%' }}
                      >
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </StyledSelect>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

      </div>
    </div>
  )
}