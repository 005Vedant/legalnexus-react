const supabase = require('./supabase')

async function seed() {
  console.log('Seeding sample data...')

  const lawyers = [
    { name: 'Jane Doe', specialty: 'Corporate Law' },
    { name: 'John Smith', specialty: 'Intellectual Property' }
  ]

  const faqs = [
    { question: 'How do I contact a lawyer?', answer: 'Use the Lawyers page to view profiles and contact info.' },
    { question: 'What is LegalNexus?', answer: 'A cinematic legal intelligence platform.' }
  ]

  const cases = [
    { title: 'Acme vs. Roadrunner', description: 'Trademark dispute example' }
  ]

  try {
    await supabase.from('lawyers').insert(lawyers)
    await supabase.from('faqs').insert(faqs)
    await supabase.from('cases').insert(cases)
    console.log('Seeding complete')
  } catch (err) {
    console.error('Seed error', err)
  }
}

seed()
