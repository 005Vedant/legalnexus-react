const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const auth = require('../auth');

function getUserRole(user) {
  return user?.user_metadata?.role || user?.role || 'client';
}

// Get all lawyers
router.get('/', auth, async (req, res) => {
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

// Create or update a lawyer profile (1 email/user_id = 1 lawyer profile)
router.post('/', auth, async (req, res) => {
  try {
    const role = getUserRole(req.user);
    if (role !== 'admin' && role !== 'lawyer') {
      return res.status(403).json({ error: 'Only admins or lawyers can create lawyer profiles' });
    }

    const payload = { ...req.body };
    if (role === 'lawyer') {
      payload.user_id = req.user.id;
      if (req.user.email) payload.email = req.user.email;
    }

    // 1. Check if a profile already exists for this user_id or email
    let existingProfile = null;
    if (payload.user_id) {
      const { data } = await supabase
        .from('lawyers')
        .select('*')
        .eq('user_id', payload.user_id)
        .maybeSingle();
      existingProfile = data;
    }

    if (!existingProfile && payload.email) {
      const { data } = await supabase
        .from('lawyers')
        .select('*')
        .eq('email', payload.email)
        .maybeSingle();
      existingProfile = data;
    }

    // 2. If existing profile found, update it (single profile per email/user_id)
    if (existingProfile) {
      const { data, error } = await supabase
        .from('lawyers')
        .update({ ...payload, user_id: req.user.id })
        .eq('id', existingProfile.id)
        .select();
      if (error) return res.status(500).json({ error });
      return res.status(200).json(data[0]);
    }

    // 3. Otherwise insert a new record
    const { data, error } = await supabase
      .from('lawyers')
      .insert(payload)
      .select();
    if (error) return res.status(500).json({ error });
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update lawyer
router.put('/:id', auth, async (req, res) => {
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

// Delete lawyer (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const role = getUserRole(req.user);
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete lawyers' });
    }
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