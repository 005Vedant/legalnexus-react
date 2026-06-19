import React, { useEffect, useState } from 'react'

type FAQ = { id: number; question: string; answer: string }

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([])

  useEffect(() => {
    fetch('/api/faqs')
      .then((r) => r.json())
      .then(setFaqs)
      .catch(() => setFaqs([]))
  }, [])

  return (
    <section>
      <h1 className="text-3xl font-bold">FAQ</h1>
      <div className="mt-4 space-y-4">
        {faqs.map((f) => (
          <details key={f.id} className="bg-legalnexus-card p-4 rounded">
            <summary className="font-medium">{f.question}</summary>
            <p className="mt-2 text-legalnexus-muted">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
