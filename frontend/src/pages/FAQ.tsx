import React, { useEffect, useState } from 'react'
import { authFetch } from '../lib/authFetch'
import ClientNav from '../components/ClientNav'

type FAQ = { id: number; question: string; answer: string }

const FALLBACK_FAQS: FAQ[] = [
  {
    id: 1,
    question: 'How do I submit a new case to LegalNexus?',
    answer:
      'Log into your client portal and navigate to "Submit a case". Fill in your matter type, court location, and brief summary. You can also securely attach supporting documents like FIR copies or contracts in the encrypted vault.',
  },
  {
    id: 2,
    question: 'How are lawyers matched with my legal brief?',
    answer:
      'Our legal matching system analyzes your case domain, court jurisdiction, and urgency to recommend bar-verified advocates with proven trial or appellate experience in your practice area.',
  },
  {
    id: 3,
    question: 'Is my case information secure and confidential?',
    answer:
      'Yes. All case details, client identities, and uploaded documents are encrypted with AES-256 standards. Your files are never made public and are shared solely with the counsel you authorize.',
  },
  {
    id: 4,
    question: 'How do fixed-fee consultations work?',
    answer:
      'Every verified lawyer displays their transparent initial consultation fee upfront. You can book an appointment directly through the directory without any hidden platform charges.',
  },
  {
    id: 5,
    question: 'Can I track upcoming hearing dates and cause lists?',
    answer:
      'Yes! Your client dashboard provides live progress bars, upcoming hearing dates, stage notifications, and direct message channels with your assigned advocate.',
  },
]

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [openIds, setOpenIds] = useState<Set<number>>(new Set([1]))

  useEffect(() => {
    authFetch('/api/faqs')
      .then(res => (res.ok ? res.json() : []))
      .then((data: FAQ[]) => {
        setFaqs(Array.isArray(data) && data.length > 0 ? data : FALLBACK_FAQS)
      })
      .catch(() => setFaqs(FALLBACK_FAQS))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (id: number) => {
    setOpenIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <ClientNav />
      <div className="py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="eyebrow inline-flex items-center gap-2 text-gold">
            <span className="h-px w-6 bg-gold/60" /> Frequently Asked Questions
          </span>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,4.5vw,3rem)] font-bold text-inkstrong">
            Help & Guidance
          </h1>
          <p className="mt-2 text-[0.95rem] text-muted max-w-xl mx-auto">
            Everything you need to know about LegalNexus, verified advocates, hearing tracking, and our encrypted workspace.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="size-8 rounded-full border-2 border-line border-t-accent animate-spin" />
            <p className="text-sm text-muted">Loading answers…</p>
          </div>
        )}

        {/* FAQ Accordion List */}
        {!loading && (
          <div className="space-y-3.5">
            {faqs.map(faq => {
              const isOpen = openIds.has(faq.id)
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-[var(--shadow)] ${
                    isOpen
                      ? 'border-accent/40 bg-cardsolid'
                      : 'border-line bg-card hover:border-line2 hover:bg-card2'
                  }`}
                >
                  <button
                    onClick={() => toggle(faq.id)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer transition-colors"
                  >
                    <span className="text-[0.95rem] font-semibold text-inkstrong leading-snug">
                      {faq.question}
                    </span>
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-lg border border-line bg-card text-xs font-bold transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-accent border-accent/40 bg-accentsoft' : 'text-faint'
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-[0.88rem] leading-relaxed text-muted border-t border-line/50 anim-rise">
                      {faq.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Support Callout Box */}
        <div className="mt-12 rounded-3xl border border-line bg-cardsolid p-6 sm:p-8 text-center shadow-[var(--shadow)]">
          <span className="text-3xl mb-2 block">💬</span>
          <h3 className="font-display text-xl font-bold text-inkstrong">Still have questions?</h3>
          <p className="mt-1.5 text-sm text-muted max-w-md mx-auto">
            Our legal intelligence and technical support team is available Monday to Saturday, 9 AM – 6 PM IST.
          </p>
          <a
            href="mailto:support@legalnexus.in?subject=Help%20Request"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent text-accentink px-5 py-2.5 text-xs font-bold shadow-[0_4px_16px_-4px_var(--glow-a)] hover:brightness-110 transition cursor-pointer"
          >
            Contact Support Team →
          </a>
        </div>
        </div>
      </div>
    </div>
  )
}
