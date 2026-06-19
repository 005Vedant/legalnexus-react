const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// Get all lawyers
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lawyers')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a lawyer
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    console.log('Creating lawyer:', payload)
    const { data, error } = await supabase
      .from('lawyers')
      .insert(payload)
      .select();
    if (error) {
      console.log('Supabase error:', JSON.stringify(error))
      return res.status(500).json({ error })
    }
    res.status(201).json(data[0]);
  } catch (err) {
    console.log('Server error:', err.message)
    res.status(500).json({ error: err.message });
  }
});

// Update lawyer
router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lawyers')
      .update(req.body)
      .eq('id', req.params.id)
      .select();
    if (error) return res.status(500).json({ error });
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete lawyer
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('lawyers')
      .delete()
      .eq('id', req.params.id);
    if (error) return res.status(500).json({ error });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;