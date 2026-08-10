const express = require('express')
const router = express.Router()
const supabase = require('../supabase')

// Public GET: retrieve all reviews
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Public POST with input validation and rate/spam sanitization
router.post('/', async (req, res) => {
  try {
    const { name, location, message, rating } = req.body || {}
    
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' })
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Review message is required' })
    }

    const sanitizedRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5))
    const payload = {
      name: name.trim().slice(0, 100),
      location: (location || '').trim().slice(0, 100),
      message: message.trim().slice(0, 1000),
      rating: sanitizedRating,
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert(payload)
      .select()
    if (error) return res.status(500).json({ error })
    res.status(201).json(data[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router