const express = require('express')
const router = express.Router()
const supabase = require('../supabase')

// Get all cases
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Create case
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cases')
      .insert(req.body)
      .select()
    if (error) return res.status(500).json({ error })
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Update case
router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cases')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
    if (error) return res.status(500).json({ error })
    res.json(data[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete case
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', req.params.id)
    if (error) return res.status(500).json({ error })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router