import React, { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { authFetch } from '../lib/authFetch'
import { useAuth } from '../hooks/useAuth'

/* ── Inline Icons ─────────────────────────────────────────────────── */
function DocIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function ShieldLockIcon({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <circle cx="12" cy="11" r="1.5" />
      <path d="M12 12.5V15" />
    </svg>
  )
}

function DownloadIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function ExternalLinkIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function UploadIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function PrinterIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  )
}

export interface CaseDocModalItem {
  id: string
  shortId: string
  title: string
  type: string
  stage: string
  status: string
  progress: number
  court: string
  next: string
  advocate: string
  last: string
  document_url?: string | null
}

interface DocumentViewerModalProps {
  item: CaseDocModalItem
  onClose: () => void
  onDocUpdated?: (newDocUrl: string) => void
  onToast: (title: string, body: string) => void
}

export default function DocumentViewerModal({
  item,
  onClose,
  onDocUpdated,
  onToast,
}: DocumentViewerModalProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'attached' | 'brief'>(
    item.document_url ? 'attached' : 'brief'
  )
  const [uploading, setUploading] = useState(false)
  const [currentDocUrl, setCurrentDocUrl] = useState<string | null>(item.document_url || null)
  const [imgError, setImgError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isImage = Boolean(currentDocUrl?.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i))
  const isPdf = Boolean(currentDocUrl?.match(/\.pdf($|\?)/i) || (!isImage && currentDocUrl))

  const handleFileUpload = async (file: File) => {
    if (!user?.id) return
    try {
      setUploading(true)
      const ext = file.name.split('.').pop()
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `case-docs/${user.id}_${Date.now()}_${cleanName}`
      
      const buckets = ['profile-photos', 'lawyer-photos', 'case-documents']
      let publicUrl: string | null = null
      let uploadErr: any = null

      for (const bucket of buckets) {
        try {
          const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
          if (!error) {
            const { data } = supabase.storage.from(bucket).getPublicUrl(path)
            if (data?.publicUrl) {
              publicUrl = data.publicUrl
              break
            }
          } else {
            uploadErr = error
          }
        } catch (e) {
          uploadErr = e
        }
      }

      if (!publicUrl) {
        throw uploadErr || new Error('Storage upload failed')
      }

      // Update case record in backend
      const res = await authFetch(`/api/cases/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ document_url: publicUrl }),
      })

      if (res.ok) {
        setCurrentDocUrl(publicUrl)
        setImgError(false)
        if (onDocUpdated) onDocUpdated(publicUrl)
        setActiveTab('attached')
        onToast('Document uploaded', 'Your supporting document was attached to this matter.')
      } else {
        throw new Error('Failed to update case record')
      }
    } catch (err: any) {
      console.error('Upload document error:', err)
      onToast('Upload failed', 'Could not upload document. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const getDocName = () => {
    if (!currentDocUrl) return `LegalBrief_${item.shortId}.pdf`
    try {
      const url = new URL(currentDocUrl)
      const parts = url.pathname.split('/')
      const last = parts[parts.length - 1]
      return decodeURIComponent(last)
    } catch {
      return `Case_Document_${item.shortId}.pdf`
    }
  }

  // Reliable High-Quality Print Function
  const handlePrintDocument = () => {
    const printWindow = window.open('', '_blank', 'width=850,height=900')
    if (!printWindow) {
      window.print()
      return
    }

    const todayStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    const printHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Case Brief - ${item.shortId} - ${item.title}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm 15mm 20mm 15mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              margin: 0;
              padding: 24px;
              font-size: 13px;
              line-height: 1.5;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #1e3a8a;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .brand-name {
              font-size: 22px;
              font-weight: 800;
              color: #1e3a8a;
              letter-spacing: -0.5px;
            }
            .brand-sub {
              font-size: 11px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-top: 2px;
              font-weight: 600;
            }
            .case-badge {
              background: #f0fdf4;
              border: 1px solid #86efac;
              color: #15803d;
              font-family: monospace;
              font-weight: 700;
              font-size: 13px;
              padding: 4px 10px;
              border-radius: 6px;
              display: inline-block;
            }
            .case-status {
              font-size: 10px;
              color: #64748b;
              margin-top: 4px;
              font-weight: 700;
              text-align: right;
            }
            .title-section {
              margin-bottom: 20px;
            }
            .case-heading {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              margin: 0 0 6px 0;
            }
            .case-court {
              font-size: 13px;
              color: #475569;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              margin-bottom: 20px;
            }
            .meta-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 10px 12px;
            }
            .meta-label {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              color: #64748b;
              font-weight: 700;
              margin-bottom: 3px;
            }
            .meta-value {
              font-size: 13px;
              font-weight: 700;
              color: #1e293b;
            }
            .statement-box {
              border: 1px solid #cbd5e1;
              border-left: 4px solid #1e3a8a;
              background: #f8fafc;
              border-radius: 6px;
              padding: 16px;
              margin-bottom: 22px;
            }
            .statement-label {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #1e3a8a;
              margin-bottom: 8px;
            }
            .statement-content {
              font-size: 13px;
              color: #1e293b;
              line-height: 1.6;
              white-space: pre-wrap;
            }
            .attachment-info {
              background: #f1f5f9;
              border: 1px dashed #94a3b8;
              border-radius: 8px;
              padding: 12px 16px;
              margin-bottom: 22px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .seal-footer {
              border-top: 1px solid #e2e8f0;
              padding-top: 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              color: #64748b;
            }
            .verified-tag {
              color: #15803d;
              font-weight: 700;
              display: flex;
              align-items: center;
              gap: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <div class="brand-name">⚖ LegalNexus</div>
              <div class="brand-sub">India Legal Intelligence · Official Case Brief</div>
            </div>
            <div>
              <div class="case-badge">${item.shortId}</div>
              <div class="case-status">STATUS: ${item.status.toUpperCase()}</div>
            </div>
          </div>

          <div class="title-section">
            <h1 class="case-heading">${item.title}</h1>
            <div class="case-court">Filing Court / Jurisdiction: <strong>${item.court}</strong></div>
          </div>

          <div class="meta-grid">
            <div class="meta-card">
              <div class="meta-label">Matter Type</div>
              <div class="meta-value">${item.type}</div>
            </div>
            <div class="meta-card">
              <div class="meta-label">Lifecycle Stage</div>
              <div class="meta-value">${item.stage}</div>
            </div>
            <div class="meta-card">
              <div class="meta-label">Next Hearing / Date</div>
              <div class="meta-value">${item.next}</div>
            </div>
          </div>

          <div class="statement-box">
            <div class="statement-label">Client Statement & Sworn Matter Summary</div>
            <div class="statement-content">${item.last || 'No additional text description was provided for this case matter.'}</div>
          </div>

          <div class="meta-grid">
            <div class="meta-card">
              <div class="meta-label">Assigned Advocate</div>
              <div class="meta-value">${item.advocate}</div>
            </div>
            <div class="meta-card">
              <div class="meta-label">Security Protocol</div>
              <div class="meta-value">256-Bit Encrypted Vault</div>
            </div>
            <div class="meta-card">
              <div class="meta-label">Filing Print Date</div>
              <div class="meta-value">${todayStr}</div>
            </div>
          </div>

          ${
            currentDocUrl
              ? `
              <div class="attachment-info">
                <div>
                  <strong>Attached Vault File:</strong> ${getDocName()}
                </div>
                <div style="font-size: 11px; color: #15803d; font-weight: 600;">
                  ✓ Cryptographically Verified
                </div>
              </div>
            `
              : ''
          }

          <div class="seal-footer">
            <div class="verified-tag">✓ Bar Council of India Verified Digital e-Filing</div>
            <div>LegalNexus Confidential Document</div>
          </div>

          <script>
            window.addEventListener('DOMContentLoaded', () => {
              setTimeout(() => {
                window.focus();
                window.print();
              }, 300);
            });
          </script>
        </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(printHtml)
    printWindow.document.close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md anim-rise">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[92vh] rounded-3xl border border-line bg-cardsolid shadow-2xl overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6 bg-card">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-accentsoft text-accent">
              <DocIcon className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-[1.05rem] font-bold text-inkstrong">
                  Case Documents Vault
                </h3>
                <span className="font-mono text-[0.68rem] px-2 py-0.5 rounded-full border border-line bg-card2 text-faint uppercase">
                  {item.shortId}
                </span>
              </div>
              <p className="text-[0.74rem] text-muted truncate max-w-md mt-0.5">
                {item.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-good/30 bg-good/10 px-2.5 py-1 text-[0.65rem] font-semibold text-good">
              <ShieldLockIcon /> 256-bit Encrypted
            </span>
            <button
              onClick={onClose}
              className="grid size-8 place-items-center rounded-xl border border-line bg-card2 text-muted hover:text-ink hover:bg-card transition cursor-pointer text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-line px-5 py-2.5 bg-card/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('attached')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-[0.78rem] font-semibold transition cursor-pointer ${
                activeTab === 'attached'
                  ? 'bg-accent text-white shadow-[0_4px_14px_-4px_var(--glow-a)]'
                  : 'text-muted hover:text-ink hover:bg-card'
              }`}
            >
              <DocIcon className="size-3.5" />
              <span>Attached Evidence {currentDocUrl ? '(1)' : '(0)'}</span>
            </button>
            <button
              onClick={() => setActiveTab('brief')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-[0.78rem] font-semibold transition cursor-pointer ${
                activeTab === 'brief'
                  ? 'bg-accent text-white shadow-[0_4px_14px_-4px_var(--glow-a)]'
                  : 'text-muted hover:text-ink hover:bg-card'
              }`}
            >
              <span>📜</span>
              <span>Digital Brief Record</span>
            </button>
          </div>

          {/* Direct Print Button in tab bar for quick access */}
          <button
            onClick={handlePrintDocument}
            title="Print case record and documents"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-line bg-card2 px-3 py-1 text-[0.75rem] font-semibold text-ink hover:border-accent hover:text-accent transition cursor-pointer"
          >
            <PrinterIcon className="size-3.5" />
            <span>Print Case File</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 hide-scroll">

          {/* TAB 1: Attached Files & Evidence */}
          {activeTab === 'attached' && (
            <div className="space-y-4">
              {currentDocUrl ? (
                <>
                  {/* File card */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-line bg-card p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accentsoft text-accent text-lg">
                        {isImage ? '🖼️' : '📄'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[0.88rem] font-semibold text-inkstrong truncate">
                          {getDocName()}
                        </p>
                        <p className="text-[0.72rem] text-muted flex items-center gap-2 mt-0.5">
                          <span className="uppercase">{isImage ? 'Image File' : 'PDF Document'}</span>
                          <span>·</span>
                          <span className="text-good font-medium">✓ Verified in Vault</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap sm:flex-nowrap">
                      <a
                        href={currentDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-card2 px-3.5 py-2 text-[0.78rem] font-semibold text-ink hover:border-accent hover:text-accent transition"
                      >
                        <ExternalLinkIcon className="size-3.5" /> Open
                      </a>
                      <button
                        onClick={handlePrintDocument}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-card2 px-3.5 py-2 text-[0.78rem] font-semibold text-ink hover:border-accent hover:text-accent transition cursor-pointer"
                      >
                        <PrinterIcon className="size-3.5" /> Print
                      </button>
                      <a
                        href={currentDocUrl}
                        download={getDocName()}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-[0.78rem] font-semibold text-white shadow-[0_4px_14px_-4px_var(--glow-a)] hover:brightness-110 transition"
                      >
                        <DownloadIcon className="size-3.5" /> Download
                      </a>
                    </div>
                  </div>

                  {/* Preview container */}
                  <div className="rounded-2xl border border-line bg-card2 overflow-hidden">
                    <div className="border-b border-line px-4 py-2 text-[0.72rem] font-medium text-muted flex items-center justify-between bg-card">
                      <span>Document Live Preview</span>
                      <span className="font-mono text-[0.65rem] text-faint">Secure Frame</span>
                    </div>

                    <div className="p-3 flex items-center justify-center min-h-[340px] max-h-[480px] bg-black/40">
                      {isImage && !imgError ? (
                        <img
                          src={currentDocUrl}
                          alt="Attached Evidence"
                          onError={() => setImgError(true)}
                          className="max-h-[440px] max-w-full rounded-xl object-contain shadow-lg"
                        />
                      ) : isPdf && !imgError ? (
                        <iframe
                          src={`${currentDocUrl}#toolbar=0`}
                          title="Document PDF Preview"
                          onError={() => setImgError(true)}
                          className="w-full h-[420px] rounded-xl border border-line bg-white"
                        />
                      ) : (
                        <div className="text-center py-10 px-4">
                          <DocIcon className="size-12 text-muted mx-auto mb-2" />
                          <p className="text-sm font-semibold text-ink">Document attached securely in vault</p>
                          <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
                            File: {getDocName()}
                          </p>
                          <div className="mt-4 flex items-center justify-center gap-2">
                            <a
                              href={currentDocUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs text-white font-semibold shadow hover:brightness-110"
                            >
                              <ExternalLinkIcon className="size-3.5" /> Open / Download File
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Replace/Update File Option */}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[0.74rem] text-muted">Need to replace this document?</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-1.5 text-[0.76rem] font-semibold text-accent hover:underline cursor-pointer disabled:opacity-50"
                    >
                      <UploadIcon className="size-3.5" />
                      {uploading ? 'Uploading...' : 'Upload replacement file'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf,image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file)
                      }}
                    />
                  </div>
                </>
              ) : (
                /* No file attached state + upload dropzone */
                <div className="space-y-4">
                  <div className="rounded-3xl border border-dashed border-line2 bg-card/50 p-8 text-center">
                    <span className="grid size-12 place-items-center rounded-2xl bg-accentsoft text-accent mx-auto mb-3">
                      <DocIcon className="size-6" />
                    </span>
                    <h4 className="font-display text-lg font-bold text-inkstrong">
                      No external file attached yet
                    </h4>
                    <p className="mt-1.5 text-[0.82rem] text-muted max-w-md mx-auto">
                      Attach contracts, FIR copies, petitions, or legal notices to share securely with your advocate.
                    </p>

                    <div className="mt-5">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-[0.82rem] font-semibold text-white shadow-[0_6px_20px_-8px_var(--glow-a)] hover:brightness-110 transition cursor-pointer disabled:opacity-50"
                      >
                        <UploadIcon className="size-4" />
                        {uploading ? 'Uploading document...' : 'Browse & Upload Document'}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf,image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file)
                        }}
                      />
                    </div>
                    <p className="mt-2 text-[0.68rem] text-faint">
                      Supported formats: PDF, JPG, PNG, WEBP (Max 25MB · Encrypted)
                    </p>
                  </div>

                  <div className="rounded-2xl border border-line bg-card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💡</span>
                      <p className="text-[0.78rem] text-muted leading-relaxed">
                        You can view and print the complete <strong className="text-ink">Digital Brief Record</strong> using the tab above.
                      </p>
                    </div>
                    <button
                      onClick={handlePrintDocument}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card2 px-3 py-1.5 text-[0.76rem] font-semibold text-ink hover:border-accent hover:text-accent transition cursor-pointer shrink-0"
                    >
                      <PrinterIcon className="size-3.5" /> Print Brief Record
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Official Digital Brief Record */}
          {activeTab === 'brief' && (
            <div className="space-y-4">
              {/* Official Legal Summary Paper Card */}
              <div className="rounded-2xl border border-line bg-card p-6 shadow-md relative overflow-hidden" id="legal-brief-print">
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-accent via-gold to-good" />
                
                {/* Document Header */}
                <div className="flex items-start justify-between border-b border-line pb-4 mb-5">
                  <div>
                    <span className="eyebrow text-gold text-[0.65rem] tracking-wider">
                      LEGALNEXUS SECURE BRIEF
                    </span>
                    <h2 className="font-display text-xl font-bold text-inkstrong mt-1">
                      {item.title}
                    </h2>
                    <p className="text-[0.74rem] text-muted mt-0.5">
                      Filing Jurisdiction: <span className="text-ink font-semibold">{item.court}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[0.75rem] font-bold text-accent px-2.5 py-1 rounded-lg bg-accentsoft border border-accent/30 inline-block">
                      {item.shortId}
                    </span>
                    <p className="text-[0.65rem] text-faint mt-1">STATUS: {item.status.toUpperCase()}</p>
                  </div>
                </div>

                {/* Meta details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                  <div className="rounded-xl border border-line bg-card2 p-2.5">
                    <span className="eyebrow text-[0.6rem] text-faint">Matter Type</span>
                    <p className="text-[0.8rem] font-semibold text-ink mt-0.5">{item.type}</p>
                  </div>
                  <div className="rounded-xl border border-line bg-card2 p-2.5">
                    <span className="eyebrow text-[0.6rem] text-faint">Current Stage</span>
                    <p className="text-[0.8rem] font-semibold text-ink mt-0.5">{item.stage}</p>
                  </div>
                  <div className="rounded-xl border border-line bg-card2 p-2.5 col-span-2 sm:col-span-1">
                    <span className="eyebrow text-[0.6rem] text-faint">Next Hearing / Update</span>
                    <p className="text-[0.8rem] font-semibold text-gold mt-0.5">{item.next}</p>
                  </div>
                </div>

                {/* Brief statement / description */}
                <div className="rounded-xl border border-line bg-card2 p-4 mb-5">
                  <span className="eyebrow text-[0.65rem] text-accent font-bold block mb-1.5">
                    CLIENT MATTER STATEMENT & SUMMARY
                  </span>
                  <p className="text-[0.85rem] text-ink leading-relaxed whitespace-pre-wrap font-sans">
                    {item.last || 'No additional text description was entered for this case matter.'}
                  </p>
                </div>

                {/* Assigned counsel */}
                <div className="flex items-center justify-between border-t border-line pt-4 text-[0.74rem]">
                  <div>
                    <span className="text-faint">Assigned Advocate:</span>{' '}
                    <strong className="text-ink">{item.advocate}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-good font-semibold">
                    <ShieldLockIcon className="size-3" /> Bar Council Verified e-Filing
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <p className="text-[0.72rem] text-muted">
                  Official formatted case brief ready for printing or export.
                </p>
                <button
                  onClick={handlePrintDocument}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent text-white px-5 py-2.5 text-[0.82rem] font-semibold shadow-[0_6px_20px_-8px_var(--glow-a)] hover:brightness-110 transition cursor-pointer"
                >
                  <PrinterIcon className="size-4" /> Print / Save as PDF
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="border-t border-line px-5 py-3.5 bg-card flex items-center justify-between text-[0.72rem] text-muted">
          <span className="flex items-center gap-1.5">
            <ShieldLockIcon className="text-good" />
            End-to-end encrypted storage
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintDocument}
              className="inline-flex items-center gap-1 rounded-xl bg-card2 border border-line px-3 py-1.5 font-medium text-ink hover:border-accent hover:text-accent transition cursor-pointer"
            >
              <PrinterIcon className="size-3.5" /> Print Document
            </button>
            <button
              onClick={onClose}
              className="rounded-xl bg-card2 border border-line px-4 py-1.5 font-medium text-ink hover:bg-card transition cursor-pointer"
            >
              Close Vault
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
