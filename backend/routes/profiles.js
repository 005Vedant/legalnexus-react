const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const auth = require('../auth');

function isAdmin(user) {
  return user?.user_metadata?.role === 'admin' || user?.role === 'admin';
}

// Get profile(s)
router.get('/', auth, async (req, res) => {
  try {
    if (isAdmin(req.user)) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) return res.status(500).json({ error });
      return res.json(data);
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user?.id)
      .maybeSingle();

    if (error) return res.status(500).json({ error });
    return res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    if (!isAdmin(req.user) && req.params.id !== req.user?.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) return res.status(500).json({ error });
    if (!data) return res.status(404).json({ error: 'Profile not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    if (!isAdmin(req.user) && req.params.id !== req.user?.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (error) return res.status(500).json({ error });
    if (!data) return res.status(404).json({ error: 'Profile not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;