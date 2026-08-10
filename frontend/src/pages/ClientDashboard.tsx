import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { authFetch } from '../lib/authFetch'

// ─── Design tokens (matches LawyerDashboard: navy #0F1C2E · slate #1E3A5F · gold #C9A84C) ──

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  .cd-root * { box-sizing: border-box; }
  .cd-root {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #0F1C2E;
    background: #F7F8FA;
    min-height: 100vh;
  }

  /* ── Hero ── */
  .cd-hero {
    background: linear-gradient(135deg, #0F1C2E 0%, #1E3A5F 100%);
    border-radius: 20px;
    padding: 32px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }
  .cd-hero::before {
    content: '§';
    position: absolute;
    right: 28px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 140px;
    opacity: 0.04;
    line-height: 1;
    font-family: Georgia, serif;
  }
  .cd-hero-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #C9A84C;
    margin-bottom: 6px;
  }
  .cd-hero-name {
    font-size: 28px;
    font-weight: 700;
    color: #FFFFFF;
    margin: 0 0 4px;
    font-family: Georgia, serif;
  }
  .cd-hero-sub {
    font-size: 13px;
    color: #7A9EC0;
    margin: 0 0 24px;
  }
  .cd-hero-stats {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .cd-stat-pill {
    background: rgba(201,168,76,0.12);
    border: 1px solid rgba(201,168,76,0.25);
    border-radius: 12px;
    padding: 12px 20px;
    text-align: center;
    min-width: 90px;
  }
  .cd-stat-num {
    font-size: 24px;
    font-weight: 700;
    color: #C9A84C;
    display: block;
    line-height: 1;
  }
  .cd-stat-label {
    font-size: 11px;
    color: #7A9EC0;
    margin-top: 4px;
    display: block;
    letter-spacing: 0.5px;
  }

  /* ── Feature cards ── */
  .cd-feature-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 16px;
  }
  @media (max-width: 680px) { .cd-feature-grid { grid-template-columns: 1fr; } }
  .cd-feature-card {
    background: #FFFFFF;
    border: 1px solid #E4E9F0;
    border-radius: 16px;
    padding: 22px 20px;
    text-align: center;
    box-shadow: 0 1px 4px rgba(15,28,46,0.05);
  }
  .cd-feature-icon { font-size: 28px; margin-bottom: 10px; }
  .cd-feature-title {
    font-size: 14px;
    font-weight: 700;
    color: #0F1C2E;
    margin-bottom: 4px;
  }
  .cd-feature-desc {
    font-size: 13px;
    color: #6B7A8D;
    line-height: 1.5;
  }

  /* ── Info row ── */
  .cd-info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 24px;
  }
  @media (max-width: 680px) { .cd-info-grid { grid-template-columns: 1fr; } }
  .cd-info-card {
    background: #FFFFFF;
    border: 1px solid #E4E9F0;
    border-left: 4px solid #C9A84C;
    border-radius: 14px;
    padding: 18px 20px;
    box-shadow: 0 1px 4px rgba(15,28,46,0.05);
  }
  .cd-info-card-title {
    font-size: 14px;
    font-weight: 700;
    color: #0F1C2E;
    margin-bottom: 10px;
  }
  .cd-info-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .cd-info-list li {
    font-size: 13px;
    color: #6B7A8D;
  }
  .cd-support-btn {
    display: inline-block;
    margin-top: 12px;
    padding: 8px 16px;
    background: #0F1C2E;
    color: #C9A84C;
    font-size: 13px;
    font-weight: 600;
    border-radius: 8px;
    text-decoration: none;
    transition: background 0.15s;
  }
  .cd-support-btn:hover { background: #1E3A5F; }

  /* ── Tabs ── */
  .cd-tabs {
    display: flex;
    gap: 6px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  .cd-tab {
    padding: 9px 18px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid #DDE3EC;
    background: #FFFFFF;
    color: #6B7A8D;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
  }
  .cd-tab:hover { border-color: #C9A84C; color: #0F1C2E; }
  .cd-tab.active {
    background: #0F1C2E;
    color: #C9A84C;
    border-color: #0F1C2E;
    font-weight: 600;
  }

  /* ── Section title ── */
  .cd-section-title {
    font-size: 16px;
    font-weight: 700;
    color: #0F1C2E;
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cd-section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #E4E9F0;
  }

  /* ── Empty state ── */
  .cd-empty {
    background: #FFFFFF;
    border: 1px solid #E4E9F0;
    border-radius: 16px;
    padding: 52px 24px;
    text-align: center;
    box-shadow: 0 1px 4px rgba(15,28,46,0.05);
  }
  .cd-empty-icon { font-size: 40px; margin-bottom: 12px; }
  .cd-empty-title { font-size: 16px; font-weight: 700; color: #0F1C2E; margin-bottom: 6px; }
  .cd-empty-sub { font-size: 14px; color: #6B7A8D; margin-bottom: 20px; }
  .cd-primary-btn {
    padding: 10px 22px;
    background: #0F1C2E;
    color: #C9A84C;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;
  }
  .cd-primary-btn:hover { background: #1E3A5F; }
  .cd-primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Case preview card (overview) ── */
  .cd-case-preview {
    background: #FFFFFF;
    border: 1px solid #E4E9F0;
    border-left: 4px solid #C9A84C;
    border-radius: 14px;
    padding: 18px 20px;
    margin-bottom: 12px;
    box-shadow: 0 1px 4px rgba(15,28,46,0.05);
    transition: box-shadow 0.15s;
  }
  .cd-case-preview:hover { box-shadow: 0 4px 16px rgba(15,28,46,0.1); }
  .cd-case-preview-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }
  .cd-case-title {
    font-size: 15px;
    font-weight: 700;
    color: #0F1C2E;
    margin: 0 0 4px;
  }
  .cd-case-desc-short {
    font-size: 13px;
    color: #6B7A8D;
    margin: 0;
    line-height: 1.5;
  }
  .cd-hearing-tag {
    font-size: 13px;
    color: #5B21B6;
    font-weight: 500;
    margin-top: 8px;
  }
  .cd-view-all {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 600;
    color: #C9A84C;
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    margin-top: 8px;
    font-family: inherit;
  }
  .cd-view-all:hover { color: #0F1C2E; }

  /* ── Status badges ── */
  .cd-status-badge {
    font-size: 11px;
    font-weight: 600;
    border-radius: 20px;
    padding: 4px 12px;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .s-Pending { background: #FEF9C3; color: #713F12; }
  .s-InProgress { background: #DBEAFE; color: #1E40AF; }
  .s-HearingScheduled { background: #EDE9FE; color: #5B21B6; }
  .s-Resolved { background: #D1FAE5; color: #065F46; }
  .s-Closed { background: #F3F4F6; color: #374151; }

  /* ── Submit form ── */
  .cd-form-panel {
    background: #FFFFFF;
    border: 1px solid #E4E9F0;
    border-radius: 20px;
    padding: 28px;
    max-width: 620px;
    box-shadow: 0 1px 4px rgba(15,28,46,0.06);
  }
  .cd-form-title {
    font-size: 18px;
    font-weight: 700;
    color: #0F1C2E;
    font-family: Georgia, serif;
    margin: 0 0 4px;
  }
  .cd-form-sub {
    font-size: 13px;
    color: #6B7A8D;
    margin: 0 0 24px;
  }
  .cd-field { margin-bottom: 16px; }
  .cd-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    color: #6B7A8D;
    margin-bottom: 6px;
  }
  .cd-input, .cd-select, .cd-textarea {
    width: 100%;
    border: 1px solid #DDE3EC;
    border-radius: 10px;
    padding: 11px 14px;
    font-size: 14px;
    color: #0F1C2E;
    background: #FAFBFC;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
  }
  .cd-input:focus, .cd-select:focus, .cd-textarea:focus {
    border-color: #C9A84C;
    box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
  }
  .cd-textarea { resize: vertical; min-height: 110px; }
  .cd-two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  @media (max-width: 520px) { .cd-two-col { grid-template-columns: 1fr; } }
  .cd-msg {
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 16px;
  }
  .cd-msg-ok { background: #D1FAE5; color: #065F46; }
  .cd-msg-err { background: #FEE2E2; color: #991B1B; }
  .cd-submit-btn {
    width: 100%;
    padding: 13px;
    background: #0F1C2E;
    color: #C9A84C;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    letter-spacing: 0.3px;
    transition: background 0.15s;
    margin-top: 4px;
  }
  .cd-submit-btn:hover { background: #1E3A5F; }
  .cd-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Track case card ── */
  .cd-track-card {
    background: #FFFFFF;
    border: 1px solid #E4E9F0;
    border-left: 4px solid #C9A84C;
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 14px;
    box-shadow: 0 1px 4px rgba(15,28,46,0.05);
    transition: box-shadow 0.15s;
  }
  .cd-track-card:hover { box-shadow: 0 4px 16px rgba(15,28,46,0.1); }
  .cd-track-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 10px;
    gap: 12px;
  }
  .cd-track-title {
    font-size: 16px;
    font-weight: 700;
    color: #0F1C2E;
    margin: 0 0 4px;
  }
  .cd-type-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    color: #1E3A5F;
    background: #EBF2FB;
    border-radius: 6px;
    padding: 2px 8px;
  }
  .cd-track-desc {
    font-size: 14px;
    color: #6B7A8D;
    margin: 0 0 14px;
    line-height: 1.55;
  }
  .cd-detail-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 14px;
  }
  @media (max-width: 620px) { .cd-detail-grid { grid-template-columns: repeat(2, 1fr); } }
  .cd-detail-tile {
    border-radius: 11px;
    padding: 12px 10px;
    text-align: center;
    border: 1px solid #E4E9F0;
    background: #FAFBFC;
  }
  .cd-detail-tile-icon { font-size: 18px; margin-bottom: 4px; }
  .cd-detail-tile-label { font-size: 10px; font-weight: 600; color: #6B7A8D; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 2px; }
  .cd-detail-tile-val { font-size: 12px; font-weight: 700; color: #0F1C2E; }
  .cd-lawyer-strip {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #F7F8FA;
    border: 1px solid #E4E9F0;
    border-radius: 12px;
    padding: 12px 14px;
    margin-bottom: 12px;
  }
  .cd-lawyer-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #C9A84C;
    flex-shrink: 0;
  }
  .cd-lawyer-avatar-ph {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg,#1E3A5F,#0F1C2E);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #C9A84C;
    font-size: 16px;
    font-weight: 700;
    border: 2px solid #C9A84C;
    flex-shrink: 0;
  }
  .cd-lawyer-name { font-size: 14px; font-weight: 700; color: #0F1C2E; margin: 0 0 2px; }
  .cd-lawyer-spec { font-size: 12px; color: #6B7A8D; margin: 0; }
  .cd-your-lawyer-tag {
    margin-left: auto;
    font-size: 11px;
    font-weight: 600;
    color: #065F46;
    background: #D1FAE5;
    border-radius: 20px;
    padding: 4px 10px;
    white-space: nowrap;
  }
  .cd-note-box {
    background: #FFFDF0;
    border: 1px solid #F0E0A8;
    border-radius: 10px;
    padding: 12px 14px;
    margin-top: 4px;
  }
  .cd-note-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #92400E;
    margin-bottom: 4px;
  }
  .cd-note-text { font-size: 13px; color: #78350F; line-height: 1.5; }

  /* ── Lawyer directory ── */
  .cd-search {
    width: 100%;
    border: 1px solid #DDE3EC;
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 14px;
    color: #0F1C2E;
    background: #FFFFFF;
    font-family: inherit;
    outline: none;
    margin-bottom: 20px;
    transition: border-color 0.15s;
    box-shadow: 0 1px 4px rgba(15,28,46,0.04);
  }
  .cd-search:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
  .cd-lawyers-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  @media (max-width: 860px) { .cd-lawyers-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 560px) { .cd-lawyers-grid { grid-template-columns: 1fr; } }
  .cd-lawyer-card {
    background: #FFFFFF;
    border: 1px solid #E4E9F0;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 1px 4px rgba(15,28,46,0.05);
    transition: box-shadow 0.15s, transform 0.15s;
  }
  .cd-lawyer-card:hover { box-shadow: 0 6px 20px rgba(15,28,46,0.1); transform: translateY(-1px); }
  .cd-lawyer-card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }
  .cd-lawyer-card-avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #C9A84C;
    flex-shrink: 0;
  }
  .cd-lawyer-card-avatar-ph {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg,#1E3A5F,#0F1C2E);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #C9A84C;
    font-size: 20px;
    font-weight: 700;
    border: 2px solid #C9A84C;
    flex-shrink: 0;
  }
  .cd-lawyer-card-name { font-size: 15px; font-weight: 700; color: #0F1C2E; margin: 0 0 4px; }
  .cd-lawyer-card-spec {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    color: #1E3A5F;
    background: #EBF2FB;
    border-radius: 6px;
    padding: 2px 8px;
  }
  .cd-lawyer-detail { font-size: 13px; color: #6B7A8D; margin-bottom: 4px; }
  .cd-lawyer-details { margin-bottom: 16px; }
  .cd-select-lawyer-btn {
    width: 100%;
    padding: 10px;
    background: #FAFBFC;
    color: #0F1C2E;
    border: 1px solid #DDE3EC;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
  }
  .cd-select-lawyer-btn:hover {
    background: #0F1C2E;
    color: #C9A84C;
    border-color: #0F1C2E;
  }

  /* ── Loading ── */
  .cd-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 160px;
    gap: 12px;
  }
  .cd-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #DDE3EC;
    border-top-color: #C9A84C;
    border-radius: 50%;
    animation: cd-spin 0.7s linear infinite;
  }
  @keyframes cd-spin { to { transform: rotate(360deg); } }
  .cd-loading-text { font-size: 14px; color: #6B7A8D; font-weight: 500; }
`

function statusClass(s: string) {
  return 'cd-status-badge s-' + s.replace(/\s+/g, '')
}

const STATUS_ICON: Record<string, string> = {
  'Pending': '⏳',
  'In Progress': '🔄',
  'Hearing Scheduled': '📅',
  'Resolved': '✅',
  'Closed': '🔒',
}

export default function ClientDashboard() {
  const { user } = useAuth()
  const [cases, setCases] = useState<any[]>([])
  const [lawyers, setLawyers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'submit' | 'lawyers' | 'track'>('overview')
  const [form, setForm] = useState({
    title: '', description: '', case_type: '',
    case_date: '', case_location: '', assigned_lawyer_id: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [casesRes, lawyersRes] = await Promise.all([
        authFetch('/api/cases'),
        authFetch('/api/lawyers')
      ])
      const casesData = await casesRes.json()
      const lawyersData = await lawyersRes.json()
      setCases(Array.isArray(casesData) ? casesData : [])
      setLawyers(Array.isArray(lawyersData) ? lawyersData : [])
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const submitCase = async () => {
    if (!form.title || !form.description) {
      setMessage('❌ Please fill in the case title and description.')
      return
    }
    setSubmitting(true)
    setMessage('')
    const res = await authFetch('/api/cases', {
      method: 'POST',
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        case_type: form.case_type,
        hearing_date: form.case_date ? new Date(form.case_date).toISOString() : null,
        case_location: form.case_location,
        assigned_lawyer_id: form.assigned_lawyer_id || null,
        client_id: user?.id,
        status: 'Pending',
      })
    })
    if (res.ok) {
      setMessage('✅ Case submitted successfully.')
      setForm({ title: '', description: '', case_type: '', case_date: '', case_location: '', assigned_lawyer_id: '' })
      fetchData()
      setTimeout(() => setActiveTab('track'), 1500)
    } else {
      setMessage('❌ Could not submit case. Please try again.')
    }
    setSubmitting(false)
  }

  const filteredLawyers = lawyers.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.specialty || '').toLowerCase().includes(search.toLowerCase())
  )

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Client'

  if (loading) return (
    <div className="cd-root">
      <style>{styles}</style>
      <div className="cd-loading">
        <div className="cd-spinner" />
        <span className="cd-loading-text">Loading your dashboard…</span>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'submit',   label: 'Submit a Case' },
    { id: 'track',    label: `My Cases (${cases.length})` },
    { id: 'lawyers',  label: 'Find a Lawyer' },
  ]

  return (
    <div className="cd-root">
      <style>{styles}</style>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>

        {/* Hero */}
        <div className="cd-hero">
          <div className="cd-hero-eyebrow">LegalNexus — Client Portal</div>
          <h1 className="cd-hero-name">Welcome, {firstName}</h1>
          <p className="cd-hero-sub">Track your cases, find legal counsel, and stay informed at every step.</p>
          <div className="cd-hero-stats">
            {[
              { num: cases.length,                                              label: 'Total Cases' },
              { num: cases.filter(c => c.status === 'Pending').length,          label: 'Pending' },
              { num: cases.filter(c => c.status === 'Hearing Scheduled').length, label: 'Hearings' },
              { num: cases.filter(c => c.status === 'Resolved').length,         label: 'Resolved' },
            ].map((s, i) => (
              <div className="cd-stat-pill" key={i}>
                <span className="cd-stat-num">{s.num}</span>
                <span className="cd-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature overview */}
        <div className="cd-feature-grid">
          <div className="cd-feature-card">
            <div className="cd-feature-icon">⚖️</div>
            <div className="cd-feature-title">Verified Lawyers</div>
            <p className="cd-feature-desc">Browse {lawyers.length}+ legal professionals by specialty and experience.</p>
          </div>
          <div className="cd-feature-card">
            <div className="cd-feature-icon">📋</div>
            <div className="cd-feature-title">Case Tracking</div>
            <p className="cd-feature-desc">Real-time status updates and hearing dates — always in the loop.</p>
          </div>
          <div className="cd-feature-card">
            <div className="cd-feature-icon">🔒</div>
            <div className="cd-feature-title">Fully Confidential</div>
            <p className="cd-feature-desc">Your case details are private and accessible only to you and your lawyer.</p>
          </div>
        </div>

        {/* Info strip */}
        <div className="cd-info-grid">
          <div className="cd-info-card">
            <div className="cd-info-card-title">Contact Support</div>
            <p style={{ fontSize: 13, color: '#6B7A8D', marginBottom: 0, lineHeight: 1.5 }}>
              Need urgent help? Reach our support team directly.
            </p>
            <a href="mailto:vedantsathe3107@gmail.com" className="cd-support-btn">Email Support</a>
          </div>
          <div className="cd-info-card">
            <div className="cd-info-card-title">Recommended Lawyers</div>
            <ul className="cd-info-list">
              {lawyers.slice(0, 3).map(l => (
                <li key={l.id}>{l.name} — <span style={{ color: '#C9A84C', fontWeight: 600 }}>{l.specialty}</span></li>
              ))}
              {lawyers.length === 0 && <li>No lawyers listed yet.</li>}
            </ul>
          </div>
          <div className="cd-info-card">
            <div className="cd-info-card-title">Quick Actions</div>
            <ul className="cd-info-list">
              <li style={{ cursor: 'pointer', color: '#1E3A5F', fontWeight: 500 }}
                onClick={() => setActiveTab('submit')}>📋 Submit a new case</li>
              <li style={{ cursor: 'pointer', color: '#1E3A5F', fontWeight: 500 }}
                onClick={() => setActiveTab('track')}>📍 Track existing cases</li>
              <li style={{ cursor: 'pointer', color: '#1E3A5F', fontWeight: 500 }}
                onClick={() => setActiveTab('lawyers')}>⚖️ Browse lawyers</li>
            </ul>
          </div>
        </div>

        {/* Tabs */}
        <div className="cd-tabs">
          {tabs.map(t => (
            <button key={t.id} className={`cd-tab${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id as any)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div>
            {cases.length === 0 ? (
              <div className="cd-empty">
                <div className="cd-empty-icon">📂</div>
                <div className="cd-empty-title">No cases yet</div>
                <p className="cd-empty-sub">Submit your first case to get started with LegalNexus.</p>
                <button className="cd-primary-btn" onClick={() => setActiveTab('submit')}>Submit a Case</button>
              </div>
            ) : (
              <div>
                <div className="cd-section-title">Recent Cases</div>
                {cases.slice(0, 3).map(c => (
                  <div key={c.id} className="cd-case-preview">
                    <div className="cd-case-preview-header">
                      <div>
                        <h3 className="cd-case-title">{c.title}</h3>
                        <p className="cd-case-desc-short">{c.description?.slice(0, 90)}{c.description?.length > 90 ? '…' : ''}</p>
                      </div>
                      <span className={statusClass(c.status)}>{STATUS_ICON[c.status]} {c.status}</span>
                    </div>
                    {c.hearing_date && (
                      <div className="cd-hearing-tag">
                        📅 Hearing: {new Date(c.hearing_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                ))}
                {cases.length > 3 && (
                  <button className="cd-view-all" onClick={() => setActiveTab('track')}>
                    View all {cases.length} cases →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Submit Case ── */}
        {activeTab === 'submit' && (
          <div className="cd-form-panel">
            <h2 className="cd-form-title">Submit a New Case</h2>
            <p className="cd-form-sub">Fill in the details below. Fields marked * are required.</p>

            {message && (
              <div className={`cd-msg ${message.startsWith('✅') ? 'cd-msg-ok' : 'cd-msg-err'}`}>
                {message}
              </div>
            )}

            <div className="cd-field">
              <label className="cd-label">Case Title *</label>
              <input className="cd-input" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Brief title of your case" />
            </div>

            <div className="cd-two-col">
              <div className="cd-field">
                <label className="cd-label">Case Type</label>
                <select className="cd-select" value={form.case_type}
                  onChange={e => setForm({ ...form, case_type: e.target.value })}>
                  <option value="">Select type</option>
                  {['Criminal Law','Family & Divorce','Corporate Law','Property Law','Cybercrime','Civil Law','Other']
                    .map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="cd-field">
                <label className="cd-label">Case Date</label>
                <input className="cd-input" type="date" value={form.case_date}
                  onChange={e => setForm({ ...form, case_date: e.target.value })} />
              </div>
            </div>

            <div className="cd-field">
              <label className="cd-label">Location</label>
              <input className="cd-input" value={form.case_location}
                onChange={e => setForm({ ...form, case_location: e.target.value })}
                placeholder="City, court name…" />
            </div>

            <div className="cd-field">
              <label className="cd-label">Case Description *</label>
              <textarea className="cd-textarea" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe what happened, when it happened, and what help you need…" />
            </div>

            <div className="cd-field">
              <label className="cd-label">Preferred Lawyer (optional)</label>
              <select className="cd-select" value={form.assigned_lawyer_id}
                onChange={e => setForm({ ...form, assigned_lawyer_id: e.target.value })}>
                <option value="">Choose a lawyer…</option>
                {lawyers.map(l => (
                  <option key={l.id} value={l.id}>{l.name} — {l.specialty}</option>
                ))}
              </select>
            </div>

            <button className="cd-submit-btn" onClick={submitCase} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Case'}
            </button>
          </div>
        )}

        {/* ── Track Cases ── */}
        {activeTab === 'track' && (
          <div>
            <div className="cd-section-title">My Cases</div>
            {cases.length === 0 ? (
              <div className="cd-empty">
                <div className="cd-empty-icon">📂</div>
                <div className="cd-empty-title">No cases submitted yet</div>
                <p className="cd-empty-sub">Once you submit a case it will appear here with live status updates.</p>
                <button className="cd-primary-btn" onClick={() => setActiveTab('submit')}>Submit a Case</button>
              </div>
            ) : (
              cases.map(c => {
                const lawyer = lawyers.find(l => l.id === c.assigned_lawyer_id)
                return (
                  <div key={c.id} className="cd-track-card">
                    <div className="cd-track-header">
                      <div>
                        <h3 className="cd-track-title">{c.title}</h3>
                        {c.case_type && <span className="cd-type-badge">{c.case_type}</span>}
                      </div>
                      <span className={statusClass(c.status)}>{STATUS_ICON[c.status]} {c.status}</span>
                    </div>

                    {c.description && <p className="cd-track-desc">{c.description}</p>}

                    <div className="cd-detail-grid">
                      {c.hearing_date && (
                        <div className="cd-detail-tile">
                          <div className="cd-detail-tile-icon">📅</div>
                          <div className="cd-detail-tile-label">Hearing</div>
                          <div className="cd-detail-tile-val">
                            {new Date(c.hearing_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      )}
                      {c.case_location && (
                        <div className="cd-detail-tile">
                          <div className="cd-detail-tile-icon">📍</div>
                          <div className="cd-detail-tile-label">Location</div>
                          <div className="cd-detail-tile-val">{c.case_location}</div>
                        </div>
                      )}
                      <div className="cd-detail-tile">
                        <div className="cd-detail-tile-icon">🗓</div>
                        <div className="cd-detail-tile-label">Submitted</div>
                        <div className="cd-detail-tile-val">
                          {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                      <div className="cd-detail-tile" style={{ borderColor: '#C9A84C', background: '#FFFDF0' }}>
                        <div className="cd-detail-tile-icon">{STATUS_ICON[c.status]}</div>
                        <div className="cd-detail-tile-label">Status</div>
                        <div className="cd-detail-tile-val">{c.status}</div>
                      </div>
                    </div>

                    {lawyer && (
                      <div className="cd-lawyer-strip">
                        {lawyer.profile_image
                          ? <img src={lawyer.profile_image} alt={lawyer.name} className="cd-lawyer-avatar" />
                          : <div className="cd-lawyer-avatar-ph">{lawyer.name.charAt(0)}</div>}
                        <div>
                          <p className="cd-lawyer-name">{lawyer.name}</p>
                          <p className="cd-lawyer-spec">{lawyer.specialty}</p>
                        </div>
                        <span className="cd-your-lawyer-tag">Your Lawyer</span>
                      </div>
                    )}

                    {c.notes && (
                      <div className="cd-note-box">
                        <div className="cd-note-label">Note from your lawyer</div>
                        <p className="cd-note-text">{c.notes}</p>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ── Find Lawyers ── */}
        {activeTab === 'lawyers' && (
          <div>
            <div className="cd-section-title">Legal Professionals</div>
            <input className="cd-search" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or area of practice…" />
            {filteredLawyers.length === 0 ? (
              <div className="cd-empty">
                <div className="cd-empty-icon">🔍</div>
                <p className="cd-empty-sub">No lawyers match your search.</p>
              </div>
            ) : (
              <div className="cd-lawyers-grid">
                {filteredLawyers.map(l => (
                  <div key={l.id} className="cd-lawyer-card">
                    <div className="cd-lawyer-card-header">
                      {l.profile_image
                        ? <img src={l.profile_image} alt={l.name} className="cd-lawyer-card-avatar" />
                        : <div className="cd-lawyer-card-avatar-ph">{l.name.charAt(0)}</div>}
                      <div>
                        <p className="cd-lawyer-card-name">{l.name}</p>
                        {l.specialty && <span className="cd-lawyer-card-spec">{l.specialty}</span>}
                      </div>
                    </div>
                    <div className="cd-lawyer-details">
                      {l.experience_years && <p className="cd-lawyer-detail">🏛 {l.experience_years} yrs experience</p>}
                      {l.rating && <p className="cd-lawyer-detail">⭐ {l.rating} rating</p>}
                      {l.phone && <p className="cd-lawyer-detail">📞 {l.phone}</p>}
                      {l.email && <p className="cd-lawyer-detail">✉ {l.email}</p>}
                    </div>
                    <button className="cd-select-lawyer-btn"
                      onClick={() => { setForm(f => ({ ...f, assigned_lawyer_id: l.id })); setActiveTab('submit') }}>
                      Select &amp; Submit Case
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}