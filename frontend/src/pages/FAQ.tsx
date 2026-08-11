import React, { useEffect, useState } from 'react'
import { authFetch } from '../lib/authFetch'

type FAQ = { id: number; question: string; answer: string }

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  .faq-root * { box-sizing: border-box; }
  .faq-root {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #0F1C2E;
    background: #F7F8FA;
    min-height: 100vh;
    padding: 48px 16px;
  }

  .faq-inner { max-width: 720px; margin: 0 auto; }

  /* ── Header ── */
  .faq-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #C9A84C;
    margin-bottom: 10px;
  }
  .faq-heading {
    font-size: 32px;
    font-weight: 700;
    color: #0F1C2E;
    font-family: Georgia, serif;
    margin: 0 0 8px;
  }
  .faq-subheading {
    font-size: 15px;
    color: #6B7A8D;
    margin: 0 0 40px;
    line-height: 1.6;
  }

  /* ── Loading ── */
  .faq-loading {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 40px 0;
  }
  .faq-spinner {
    width: 20px;
    height: 20px;
    border: 3px solid #DDE3EC;
    border-top-color: #C9A84C;
    border-radius: 50%;
    animation: faq-spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes faq-spin { to { transform: rotate(360deg); } }
  .faq-loading-text { font-size: 14px; color: #6B7A8D; }

  /* ── Empty ── */
  .faq-empty {
    text-align: center;
    padding: 60px 24px;
    background: #FFFFFF;
    border: 1px solid #E4E9F0;
    border-radius: 16px;
  }
  .faq-empty-icon { font-size: 36px; margin-bottom: 12px; }
  .faq-empty-text { font-size: 14px; color: #6B7A8D; }

  /* ── Accordion list ── */
  .faq-list { display: flex; flex-direction: column; gap: 10px; }

  /* ── Accordion item ── */
  .faq-item {
    background: #FFFFFF;
    border: 1px solid #E4E9F0;
    border-left: 4px solid #C9A84C;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(15,28,46,0.05);
    transition: box-shadow 0.15s;
  }
  .faq-item:hover { box-shadow: 0 4px 16px rgba(15,28,46,0.09); }
  .faq-item.open { border-left-color: #C9A84C; }

  /* ── Trigger button ── */
  .faq-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 20px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    color: #0F1C2E;
  }
  .faq-trigger:focus-visible {
    outline: 2px solid #C9A84C;
    outline-offset: -2px;
    border-radius: 12px;
  }
  .faq-question {
    font-size: 15px;
    font-weight: 600;
    color: #0F1C2E;
    line-height: 1.45;
    flex: 1;
  }
  .faq-item.open .faq-question { color: #1E3A5F; }

  /* ── Chevron ── */
  .faq-chevron {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #F7F8FA;
    border: 1px solid #DDE3EC;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.25s ease, background 0.15s, border-color 0.15s;
  }
  .faq-item.open .faq-chevron {
    transform: rotate(180deg);
    background: #C9A84C;
    border-color: #C9A84C;
  }
  .faq-chevron svg { display: block; }
  .faq-item.open .faq-chevron svg path { stroke: #0F1C2E; }

  /* ── Answer panel ── */
  .faq-body {
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.25s ease;
    max-height: 0;
    opacity: 0;
  }
  .faq-item.open .faq-body {
    max-height: 600px;
    opacity: 1;
  }
  .faq-answer {
    padding: 0 20px 20px;
    font-size: 14px;
    color: #6B7A8D;
    line-height: 1.7;
    border-top: 1px solid #F0F2F5;
    padding-top: 14px;
    margin: 0 20px;
  }

  /* ── Footer note ── */
  .faq-footer {
    margin-top: 36px;
    padding: 20px 24px;
    background: #FFFFFF;
    border: 1px solid #E4E9F0;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .faq-footer-text {
    font-size: 14px;
    color: #6B7A8D;
  }
  .faq-footer-text strong { color: #0F1C2E; font-weight: 600; }
  .faq-contact-link {
    padding: 9px 20px;
    background: #0F1C2E;
    color: #C9A84C;
    font-size: 13px;
    font-weight: 700;
    border-radius: 9px;
    text-decoration: none;
    white-space: nowrap;
    transition: background 0.15s;
    font-family: inherit;
  }
  .faq-contact-link:hover { background: #1E3A5F; }
`

function AccordionItem({ faq, index }: { faq: FAQ; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <button
        className="faq-trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="faq-question">
          <span style={{ color: '#C9A84C', fontWeight: 700, marginRight: 10, fontSize: 13 }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          {faq.question}
        </span>
        <span className="faq-chevron" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4L6 8L10 4" stroke="#6B7A8D" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      <div className="faq-body" aria-hidden={!open}>
        <p className="faq-answer">{faq.answer}</p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch('/api/faqs')
      .then(r => r.json())
      .then(data => { setFaqs(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => { setFaqs([]); setLoading(false) })
  }, [])

  return (
    <div className="faq-root">
      <style>{styles}</style>
      <div className="faq-inner">

        <div className="faq-eyebrow">LegalNexus — Help Centre</div>
        <h1 className="faq-heading">Frequently Asked Questions</h1>
        <p className="faq-subheading">
          Everything you need to know about using the platform — submitting cases,
          working with lawyers, and managing your account.
        </p>

        {loading ? (
          <div className="faq-loading">
            <div className="faq-spinner" />
            <span className="faq-loading-text">Loading questions…</span>
          </div>
        ) : faqs.length === 0 ? (
          <div className="faq-empty">
            <div className="faq-empty-icon">💬</div>
            <p className="faq-empty-text">No FAQs available yet. Check back soon.</p>
          </div>
        ) : (
          <div className="faq-list">
            {faqs.map((f, i) => (
              <AccordionItem key={f.id} faq={f} index={i} />
            ))}
          </div>
        )}

        <div className="faq-footer">
          <p className="faq-footer-text">
            Still have questions? <strong>Our support team is here to help.</strong>
          </p>
          <a href="mailto:vedantsathe3107@gmail.com" className="faq-contact-link">
            Contact Support
          </a>
        </div>

      </div>
    </div>
  )
}