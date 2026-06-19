const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const auth = require('../auth');

// Public: list items
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('items').select('*');
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create item (requires auth)
router.post('/', auth, async (req, res) => {
  try {
    const payload = req.body || {};
    if (req.user && req.user.id) payload.user_id = req.user.id;
    const { data, error } = await supabase.from('items').insert(payload).select().single();
    if (error) return res.status(500).json({ error });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update item (requires auth)
router.put('/:id', auth, async (req, res) => {
  const id = req.params.id;
  try {
    const { data, error } = await supabase.from('items').update(req.body).eq('id', id).select().single();
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete item (requires auth)
router.delete('/:id', auth, async (req, res) => {
  const id = req.params.id;
  try {
    const { data, error } = await supabase.from('items').delete().eq('id', id).select();
    if (error) return res.status(500).json({ error });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
