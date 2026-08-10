import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { authFetch } from '../lib/authFetch'

// ─── Design tokens ────────────────────────────────────────────────────────────
// Palette: Deep navy (#0F1C2E) · Slate (#1E3A5F) · Gold accent (#C9A84C)
// Gold light (#F0E0A8) · Off-white (#F7F8FA) · Muted (#6B7A8D)
// Type: system-ui stack for UI, Georgia for display names
// Signature: gold left-border on case cards + gold stat glow

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  .ld-root * { box-sizing: border-box; }

  .ld-root {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #0F1C2E;
    background: #F7F8FA;
    min-height: 100vh;
  }

  /* ── Header banner ── */
  .ld-hero {
    background: linear-gradient(135deg, #0F1C2E 0%, #1E3A5F 100%);
    border-radius: 20px;
    padding: 32px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }
  .ld-hero::before {
    content: '⚖';
    position: absolute;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 120px;
    opacity: 0.05;
    line-height: 1;
  }
  .ld-hero-greeting {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #C9A84C;
    margin-bottom: 6px;
  }
  .ld-hero-name {
    font-size: 28px;
    font-weight: 700;
    color: #FFFFFF;
    margin: 0 0 4px;
    font-family: Georgia, serif;
  }
  .ld-hero-sub {
    font-size: 13px;
    color: #7A9EC0;
    margin: 0 0 24px;
  }
  .ld-hero-stats {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .ld-stat-pill {
    background: rgba(201, 168, 76, 0.12);
    border: 1px solid rgba(201, 168, 76, 0.25);
    border-radius: 12px;
    padding: 12px 20px;
    text-align: center;
    min-width: 90px;
  }
  .ld-stat-pill-num {
    font-size: 24px;
    font-weight: 700;
    color: #C9A84C;
    display: block;
    line-height: 1;
  }
  .ld-stat-pill-label {
    font-size: 11px;
    color: #7A9EC0;
    margin-top: 4px;
    display: block;
    letter-spacing: 0.5px;
  }

  /* ── Profile card ── */
  .ld-profile-card {
    background: #FFFFFF;
    border: 1px solid #E4E9F0;
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 1px 4px rgba(15,28,46,0.06);
  }
  .ld-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #C9A84C;
    flex-shrink: 0;
  }
  .ld-avatar-placeholder {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1E3A5F, #0F1C2E);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #C9A84C;
    font-size: 20px;
    font-weight: 700;
    border: 3px solid #C9A84C;
    flex-shrink: 0;
  }
  .ld-profile-name {
    font-weight: 700;
    font-size: 16px;
    color: #0F1C2E;
    margin: 0 0 2px;
  }
  .ld-profile-meta {
    font-size: 13px;
    color: #6B7A8D;
    margin: 0;
  }
  .ld-profile-phone {
    font-size: 13px;
    color: #6B7A8D;
    margin-top: 4px;
  }
  .ld-profile-count {
    margin-left: auto;
    text-align: right;
    font-size: 13px;
    color: #6B7A8D;
  }
  .ld-profile-count strong {
    display: block;
    font-size: 22px;
    font-weight: 700;
    color: #0F1C2E;
  }

  /* ── Warning banner ── */
  .ld-warning {
    background: #FFFBEB;
    border: 1px solid #F59E0B;
    border-radius: 14px;
    padding: 16px 20px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .ld-warning-text {
    font-size: 14px;
    font-weight: 500;
    color: #92400E;
  }
  .ld-warning-btn {
    padding: 8px 16px;
    background: #D97706;
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s;
  }
  .ld-warning-btn:hover { background: #B45309; }

  /* ── Tabs ── */
  .ld-tabs {
    display: flex;
    gap: 6px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  .ld-tab {
    padding: 9px 18px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid #DDE3EC;
    background: #FFFFFF;
    color: #6B7A8D;
    cursor: pointer;
    transition: all 0.15s;
  }
  .ld-tab:hover { border-color: #C9A84C; color: #0F1C2E; }
  .ld-tab.active {
    background: #0F1C2E;
    color: #C9A84C;
    border-color: #0F1C2E;
    font-weight: 600;
  }

  /* ── Section heading ── */
  .ld-section-title {
    font-size: 16px;
    font-weight: 700;
    color: #0F1C2E;
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ld-section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #E4E9F0;
  }

  /* ── Overview grid ── */
  .ld-overview-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 28px;
  }
  @media (max-width: 600px) { .ld-overview-grid { grid-template-columns: 1fr; } }
  .ld-overview-card {
    background: #FFFFFF;
    border: 1px solid #E4E9F0;
    border-radius: 16px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 1px 4px rgba(15,28,46,0.05);
  }
  .ld-overview-icon {
    font-size: 26px;
    margin-bottom: 10px;
  }
  .ld-overview-num {
    font-size: 32px;
    font-weight: 700;
    color: #0F1C2E;
    display: block;
    line-height: 1;
  }
  .ld-overview-label {
    font-size: 12px;
    color: #6B7A8D;
    margin-top: 6px;
    letter-spacing: 0.4px;
  }

  /* ── Case card ── */
  .ld-case-card {
    background: #FFFFFF;
    border: 1px solid #E4E9F0;
    border-left: 4px solid #C9A84C;
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 12px;
    box-shadow: 0 1px 4px rgba(15,28,46,0.05);
    transition: box-shadow 0.15s;
  }
  .ld-case-card:hover { box-shadow: 0 4px 16px rgba(15,28,46,0.1); }
  .ld-case-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 10px;
    gap: 12px;
  }
  .ld-case-title {
    font-size: 16px;
    font-weight: 700;
    color: #0F1C2E;
    margin: 0 0 4px;
  }
  .ld-case-type-badge {
    font-size: 11px;
    font-weight: 600;
    color: #1E3A5F;
    background: #EBF2FB;
    border-radius: 6px;
    padding: 2px 8px;
    display: inline-block;
  }
  .ld-status-badge {
    font-size: 11px;
    font-weight: 600;
    border-radius: 20px;
    padding: 4px 12px;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .status-Pending { background: #FEF9C3; color: #713F12; }
  .status-InProgress { background: #DBEAFE; color: #1E40AF; }
  .status-HearingScheduled { background: #EDE9FE; color: #5B21B6; }
  .status-Resolved { background: #D1FAE5; color: #065F46; }
  .status-Closed { background: #F3F4F6; color: #374151; }

  .ld-case-desc {
    font-size: 14px;
    color: #6B7A8D;
    margin: 0 0 12px;
    line-height: 1.55;
  }
  .ld-case-meta {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    font-size: 13px;
    color: #6B7A8D;
    margin-bottom: 12px;
  }
  .ld-case-meta-hearing {
    color: #5B21B6;
    font-weight: 500;
  }
  .ld-doc-link {
    font-size: 13px;
    color: #1E3A5F;
    font-weight: 500;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 12px;
    border-bottom: 1px solid #7A9EC0;
    padding-bottom: 1px;
  }
  .ld-doc-link:hover { color: #C9A84C; border-color: #C9A84C; }
  .ld-note-box {
    background: #FFFDF0;
    border: 1px solid #F0E0A8;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 12px;
  }
  .ld-note-label {
    font-size: 11px;
    font-weight: 700;
    color: #92400E;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .ld-note-text {
    font-size: 13px;
    color: #78350F;
    line-height: 1.5;
  }

  /* ── Case actions ── */
  .ld-actions {
    border-top: 1px solid #E4E9F0;
    padding-top: 16px;
    margin-top: 8px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  @media (max-width: 600px) { .ld-actions { grid-template-columns: 1fr; } }
  .ld-action-group { display: flex; flex-direction: column; gap: 6px; }
  .ld-action-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #6B7A8D;
  }
  .ld-input, .ld-select {
    width: 100%;
    border: 1px solid #DDE3EC;
    border-radius: 9px;
    padding: 9px 12px;
    font-size: 13px;
    color: #0F1C2E;
    background: #FAFBFC;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
  }
  .ld-input:focus, .ld-select:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
  .ld-input-row { display: flex; gap: 8px; }
  .ld-btn-set {
    padding: 9px 14px;
    background: #1E3A5F;
    color: #FFFFFF;
    border: none;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s;
    font-family: inherit;
  }
  .ld-btn-set:hover { background: #0F1C2E; }
  .ld-btn-save {
    padding: 9px 14px;
    background: #C9A84C;
    color: #0F1C2E;
    border: none;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s;
    font-family: inherit;
  }
  .ld-btn-save:hover { background: #B8922A; }

  /* ── Empty state ── */
  .ld-empty {
    background: #FFFFFF;
    border: 1px solid #E4E9F0;
    border-radius: 16px;
    padding: 48px 24px;
    text-align: center;
  }
  .ld-empty-icon { font-size: 40px; margin-bottom: 12px; }
  .ld-empty-text { font-size: 14px; color: #6B7A8D; }

  /* ── View all link ── */
  .ld-view-all {
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
  .ld-view-all:hover { color: #0F1C2E; }

  /* ── Profile form ── */
  .ld-profile-panel {
    background: #FFFFFF;
    border: 1px solid #E4E9F0;
    border-radius: 20px;
    padding: 28px;
    max-width: 520px;
    box-shadow: 0 1px 4px rgba(15,28,46,0.06);
  }
  .ld-profile-panel-title {
    font-size: 18px;
    font-weight: 700;
    color: #0F1C2E;
    margin: 0 0 24px;
    font-family: Georgia, serif;
  }
  .ld-welcome-banner {
    background: #EBF2FB;
    border: 1px solid #BFDBFE;
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 13px;
    color: #1E3A5F;
    margin-bottom: 20px;
    font-weight: 500;
  }
  .ld-avatar-upload-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;
  }
  .ld-avatar-lg {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #C9A84C;
    margin-bottom: 10px;
  }
  .ld-avatar-lg-placeholder {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1E3A5F, #0F1C2E);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #C9A84C;
    font-size: 28px;
    font-weight: 700;
    border: 4px solid #C9A84C;
    margin-bottom: 10px;
  }
  .ld-upload-label {
    font-size: 13px;
    font-weight: 600;
    color: #1E3A5F;
    cursor: pointer;
    border-bottom: 1px solid #7A9EC0;
    padding-bottom: 1px;
  }
  .ld-upload-label:hover { color: #C9A84C; border-color: #C9A84C; }
  .ld-field { margin-bottom: 16px; }
  .ld-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #6B7A8D;
    margin-bottom: 6px;
  }
  .ld-field-input {
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
  .ld-field-input:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
  .ld-field-input:disabled { background: #F1F3F6; color: #9CA3AF; cursor: not-allowed; }
  textarea.ld-field-input { resize: vertical; min-height: 90px; }
  .ld-msg {
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 16px;
  }
  .ld-msg-ok { background: #D1FAE5; color: #065F46; }
  .ld-msg-err { background: #FEE2E2; color: #991B1B; }
  .ld-submit-btn {
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
  }
  .ld-submit-btn:hover { background: #1E3A5F; }
  .ld-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Loading ── */
  .ld-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 160px;
    gap: 12px;
  }
  .ld-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #DDE3EC;
    border-top-color: #C9A84C;
    border-radius: 50%;
    animation: ld-spin 0.7s linear infinite;
  }
  @keyframes ld-spin { to { transform: rotate(360deg); } }
  .ld-loading-text { font-size: 14px; color: #6B7A8D; font-weight: 500; }
`

// ─── helpers ─────────────────────────────────────────────────────────────────
function statusClass(s: string) {
  return 'ld-status-badge status-' + s.replace(/\s+/g, '')
}

// ─── LawyerProfileForm ────────────────────────────────────────────────────────
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
    <div className="ld-profile-panel">
      <h2 className="ld-profile-panel-title">
        {isNew ? 'Create Your Profile' : 'My Lawyer Profile'}
      </h2>

      {isNew && (
        <div className="ld-welcome-banner">
          Welcome to LegalNexus. Complete your profile so clients and administrators can find and assign cases to you.
        </div>
      )}

      <div className="ld-avatar-upload-wrap">
        {profileForm.profile_image ? (
          <img src={profileForm.profile_image} alt="Profile" className="ld-avatar-lg" />
        ) : (
          <div className="ld-avatar-lg-placeholder">
            {profileForm.name?.charAt(0) || '⚖'}
          </div>
        )}
        <label className="ld-upload-label">
          {uploading ? 'Uploading…' : 'Change photo'}
          <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading}
            onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f) }} />
        </label>
      </div>

      <div className="ld-field">
        <label className="ld-label">Full Name</label>
        <input className="ld-field-input" value={profileForm.name}
          onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
          placeholder="Adv. Your Name" />
      </div>

      <div className="ld-field">
        <label className="ld-label">Specialization</label>
        <select className="ld-field-input" value={profileForm.specialty}
          onChange={e => setProfileForm({ ...profileForm, specialty: e.target.value })}>
          <option value="">Select an area of practice</option>
          {['Criminal Law','Family & Divorce','Corporate Law','Property Law','Cybercrime','Civil Law','Other']
            .map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="ld-field">
        <label className="ld-label">Years of Experience</label>
        <input className="ld-field-input" type="number" value={profileForm.experience_years}
          onChange={e => setProfileForm({ ...profileForm, experience_years: e.target.value })}
          placeholder="e.g. 8" />
      </div>

      <div className="ld-field">
        <label className="ld-label">Phone</label>
        <input className="ld-field-input" value={profileForm.phone}
          onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
          placeholder="9876543210" />
      </div>

      <div className="ld-field">
        <label className="ld-label">Email</label>
        <input className="ld-field-input" value={userEmail} disabled />
      </div>

      <div className="ld-field">
        <label className="ld-label">Bio</label>
        <textarea className="ld-field-input" value={profileForm.bio}
          onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
          placeholder="A short professional bio visible to clients and the team…" />
      </div>

      {message && (
        <div className={`ld-msg ${message.startsWith('✅') ? 'ld-msg-ok' : 'ld-msg-err'}`}>
          {message}
        </div>
      )}

      <button className="ld-submit-btn" onClick={onSave} disabled={saving}>
        {saving ? 'Saving…' : isNew ? 'Create Profile' : 'Save Changes'}
      </button>
    </div>
  )
}

// ─── CaseCard ─────────────────────────────────────────────────────────────────
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
  return (
    <div className="ld-case-card">
      <div className="ld-case-header">
        <div>
          <h3 className="ld-case-title">{c.title}</h3>
          {c.case_type && <span className="ld-case-type-badge">{c.case_type}</span>}
        </div>
        <span className={statusClass(c.status)}>{c.status}</span>
      </div>

      {c.description && <p className="ld-case-desc">{c.description}</p>}

      <div className="ld-case-meta">
        {c.case_location && <span>📍 {c.case_location}</span>}
        {c.hearing_date && (
          <span className="ld-case-meta-hearing">
            📅 {new Date(c.hearing_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
        <span>Filed {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>

      {c.document_url && (
        <a href={c.document_url} target="_blank" rel="noopener noreferrer" className="ld-doc-link">
          📎 View case document
        </a>
      )}

      {c.notes && (
        <div className="ld-note-box">
          <div className="ld-note-label">Lawyer's Note</div>
          <p className="ld-note-text">{c.notes}</p>
        </div>
      )}

      {showActions && (
        <div className="ld-actions">
          <div className="ld-action-group">
            <div className="ld-action-label">Update Status</div>
            <select className="ld-select" value={c.status}
              onChange={e => updateCaseStatus(c.id, e.target.value)}>
              {['Pending','In Progress','Hearing Scheduled','Resolved','Closed'].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="ld-action-group">
            <div className="ld-action-label">Hearing Date</div>
            <div className="ld-input-row">
              <input type="datetime-local" className="ld-input"
                value={hearingInputs[c.id] || ''}
                onChange={e => setHearingInputs((p: any) => ({ ...p, [c.id]: e.target.value }))} />
              <button className="ld-btn-set" onClick={() => saveHearing(c.id)}>Set</button>
            </div>
          </div>

          <div className="ld-action-group" style={{ gridColumn: '1 / -1' }}>
            <div className="ld-action-label">Note for Client</div>
            <div className="ld-input-row">
              <input className="ld-input" value={noteInputs[c.id] || ''}
                onChange={e => setNoteInputs((p: any) => ({ ...p, [c.id]: e.target.value }))}
                placeholder="Write a note visible to the client…" />
              <button className="ld-btn-save" onClick={() => saveNote(c.id)}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── LawyerDashboard (main) ───────────────────────────────────────────────────
export default function LawyerDashboard() {
  const { user } = useAuth()
  const [cases, setCases] = useState<any[]>([])
  const [allCases, setAllCases] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'mycases' | 'allcases' | 'profile'>('overview')
  const [profileForm, setProfileForm] = useState({
    name: '', bio: '', specialty: '',
    experience_years: '', phone: '', email: '', profile_image: ''
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [noteInputs, setNoteInputs] = useState<{ [key: string]: string }>({})
  const [hearingInputs, setHearingInputs] = useState<{ [key: string]: string }>({})

  const fetchData = async () => {
    setLoading(true)
    let casesData: any[] = []
    try {
      const casesRes = await authFetch('/api/cases')
      if (casesRes.ok) {
        casesData = await casesRes.json()
        setAllCases(Array.isArray(casesData) ? casesData : [])
      }
    } catch (err) {
      console.error('Failed to load cases:', err)
    }

    let profileData = null
    if (user?.id) {
      const { data } = await supabase.from('lawyers').select('*').eq('user_id', user.id).maybeSingle()
      profileData = data
    }
    if (!profileData && user?.email) {
      const { data: byEmail } = await supabase.from('lawyers').select('*').eq('email', user.email).maybeSingle()
      if (byEmail) {
        await supabase.from('lawyers').update({ user_id: user.id }).eq('id', byEmail.id)
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
      setCases(casesData.filter((c: any) => c.assigned_lawyer_id === profileData.id))
    }
    setLoading(false)
  }


  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const createProfile = async () => {
    if (profile?.id) {
      return saveProfile();
    }
    if (!profileForm.name) { setMessage('❌ Please enter your full name.'); return }
    setSaving(true)
    const res = await authFetch('/api/lawyers', {
      method: 'POST',
      body: JSON.stringify({
        name: profileForm.name, specialty: profileForm.specialty,
        experience_years: profileForm.experience_years ? Number(profileForm.experience_years) : null,
        phone: profileForm.phone, email: user?.email,
        bio: profileForm.bio, profile_image: profileForm.profile_image || null,
        user_id: user?.id,
      })
    })
    if (res.ok) {
      const data = await res.json()
      setProfile(data)
      setMessage('✅ Profile created successfully!')
      fetchData()
    } else {
      setMessage('❌ Could not create profile. Please try again.')
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3500)
  }

  const saveProfile = async () => {
    setSaving(true)
    if (profile) {
      await authFetch(`/api/lawyers/${profile.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...profileForm,
          experience_years: profileForm.experience_years ? Number(profileForm.experience_years) : null,
          user_id: user?.id,
        })
      })
      setMessage('✅ Profile updated.')
      fetchData()
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3500)
  }

  const updateCaseStatus = async (caseId: string, status: string) => {
    await authFetch(`/api/cases/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
    fetchData()
  }

  const saveNote = async (caseId: string) => {
    const note = noteInputs[caseId]; if (!note) return
    await authFetch(`/api/cases/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify({ notes: note })
    })
    setNoteInputs(p => ({ ...p, [caseId]: '' }))
    fetchData()
  }

  const saveHearing = async (caseId: string) => {
    const date = hearingInputs[caseId]; if (!date) return
    await authFetch(`/api/cases/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify({ hearing_date: new Date(date).toISOString(), status: 'Hearing Scheduled' })
    })
    await authFetch('/api/hearings', {
      method: 'POST',
      body: JSON.stringify({ case_id: caseId, hearing_date: new Date(date).toISOString(), created_by: user?.id })
    })
    setHearingInputs(p => ({ ...p, [caseId]: '' }))
    fetchData()
  }

  const firstName = profile?.name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Counsel'

  if (loading) return (
    <div className="ld-root">
      <style>{styles}</style>
      <div className="ld-loading">
        <div className="ld-spinner" />
        <span className="ld-loading-text">Loading your dashboard…</span>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview',  label: 'Overview' },
    { id: 'mycases',   label: `My Cases (${cases.length})` },
    { id: 'allcases',  label: `All Cases (${allCases.length})` },
    { id: 'profile',   label: 'Profile' },
  ]

  return (
    <div className="ld-root">
      <style>{styles}</style>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

        {/* Hero */}
        <div className="ld-hero">
          <div className="ld-hero-greeting">LegalNexus — Lawyer Portal</div>
          <h1 className="ld-hero-name">Welcome back, {firstName}</h1>
          <p className="ld-hero-sub">Here's what's happening with your caseload today.</p>
          <div className="ld-hero-stats">
            {[
              { num: cases.length,                                             label: 'Total Cases' },
              { num: cases.filter(c => c.status === 'Pending').length,         label: 'Pending' },
              { num: cases.filter(c => c.status === 'Hearing Scheduled').length, label: 'Hearings' },
              { num: cases.filter(c => c.status === 'Resolved').length,        label: 'Resolved' },
            ].map((s, i) => (
              <div className="ld-stat-pill" key={i}>
                <span className="ld-stat-pill-num">{s.num}</span>
                <span className="ld-stat-pill-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Profile summary card */}
        {profile && (
          <div className="ld-profile-card">
            {profile.profile_image
              ? <img src={profile.profile_image} alt={profile.name} className="ld-avatar" />
              : <div className="ld-avatar-placeholder">{profile.name?.charAt(0)}</div>}
            <div>
              <p className="ld-profile-name">{profile.name}</p>
              <p className="ld-profile-meta">{profile.specialty}{profile.experience_years ? ` · ${profile.experience_years} yrs experience` : ''}</p>
              <p className="ld-profile-phone">{profile.phone || 'No phone on file'}</p>
            </div>
            <div className="ld-profile-count">
              <strong>{cases.length}</strong>
              cases assigned
            </div>
          </div>
        )}

        {/* No profile warning */}
        {!profile && (
          <div className="ld-warning">
            <span className="ld-warning-text">⚠️ Your lawyer profile is not set up. Complete it so cases can be assigned to you.</span>
            <button className="ld-warning-btn" onClick={() => setActiveTab('profile')}>
              Set up profile →
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="ld-tabs">
          {tabs.map(t => (
            <button key={t.id} className={`ld-tab${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id as any)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div>
            <div className="ld-overview-grid">
              <div className="ld-overview-card">
                <div className="ld-overview-icon">📋</div>
                <span className="ld-overview-num">{cases.length}</span>
                <div className="ld-overview-label">Assigned Cases</div>
              </div>
              <div className="ld-overview-card">
                <div className="ld-overview-icon">📅</div>
                <span className="ld-overview-num">{cases.filter(c => c.status === 'Hearing Scheduled').length}</span>
                <div className="ld-overview-label">Upcoming Hearings</div>
              </div>
              <div className="ld-overview-card">
                <div className="ld-overview-icon">✅</div>
                <span className="ld-overview-num">{cases.filter(c => c.status === 'Resolved').length}</span>
                <div className="ld-overview-label">Resolved Cases</div>
              </div>
            </div>

            <div className="ld-section-title">Recent Cases</div>
            {cases.length === 0
              ? <div className="ld-empty"><div className="ld-empty-icon">📂</div><p className="ld-empty-text">No cases assigned to you yet.</p></div>
              : cases.slice(0, 3).map(c => (
                  <CaseCard key={c.id} c={c} showActions={false}
                    updateCaseStatus={updateCaseStatus} saveNote={saveNote} saveHearing={saveHearing}
                    noteInputs={noteInputs} setNoteInputs={setNoteInputs}
                    hearingInputs={hearingInputs} setHearingInputs={setHearingInputs} />
                ))}
            {cases.length > 3 && (
              <button className="ld-view-all" onClick={() => setActiveTab('mycases')}>
                View all {cases.length} cases →
              </button>
            )}
          </div>
        )}

        {/* My Cases */}
        {activeTab === 'mycases' && (
          <div>
            <div className="ld-section-title">My Assigned Cases</div>
            {cases.length === 0
              ? <div className="ld-empty"><div className="ld-empty-icon">📂</div><p className="ld-empty-text">No cases assigned to you yet.</p></div>
              : cases.map(c => (
                  <CaseCard key={c.id} c={c} showActions={true}
                    updateCaseStatus={updateCaseStatus} saveNote={saveNote} saveHearing={saveHearing}
                    noteInputs={noteInputs} setNoteInputs={setNoteInputs}
                    hearingInputs={hearingInputs} setHearingInputs={setHearingInputs} />
                ))}
          </div>
        )}

        {/* All Cases */}
        {activeTab === 'allcases' && (
          <div>
            <div className="ld-section-title">All Cases</div>
            {allCases.length === 0
              ? <div className="ld-empty"><p className="ld-empty-text">No cases in the system yet.</p></div>
              : allCases.map(c => (
                  <CaseCard key={c.id} c={c} showActions={false}
                    updateCaseStatus={updateCaseStatus} saveNote={saveNote} saveHearing={saveHearing}
                    noteInputs={noteInputs} setNoteInputs={setNoteInputs}
                    hearingInputs={hearingInputs} setHearingInputs={setHearingInputs} />
                ))}
          </div>
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <LawyerProfileForm
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            saving={saving}
            message={message}
            userEmail={user?.email || ''}
            isNew={!profile}
            onSave={!profile ? createProfile : saveProfile}
          />
        )}

      </div>
    </div>
  )
}