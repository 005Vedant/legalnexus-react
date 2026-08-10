const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const auth = require('../auth');

function getUserRole(user) {
  return user?.user_metadata?.role || user?.role || 'client';
}

async function getLawyerForUser(userId) {
  const { data, error } = await supabase
    .from('lawyers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  return { data, error };
}

async function authorizeCaseAccess(req, caseRecord) {
  const role = getUserRole(req.user);
  if (!req.user?.id) return { allowed: false, status: 401, message: 'Missing authenticated user' };

  if (role === 'admin') {
    return { allowed: true };
  }

  if (role === 'client') {
    if (caseRecord?.client_id === req.user.id) {
      return { allowed: true };
    }
    return { allowed: false, status: 403, message: 'Forbidden' };
  }

  if (role === 'lawyer') {
    const { data: lawyer, error } = await getLawyerForUser(req.user.id);
    if (error) {
      return { allowed: false, status: 500, message: error.message || error };
    }
    if (lawyer?.id && caseRecord?.assigned_lawyer_id === lawyer.id) {
      return { allowed: true };
    }
    return { allowed: false, status: 403, message: 'Forbidden' };
  }

  return { allowed: false, status: 403, message: 'Forbidden' };
}

// Get all cases
router.get('/', auth, async (req, res) => {
  try {
    const role = getUserRole(req.user);
    let query = supabase.from('cases').select('*');

    if (role === 'client') {
      query = query.eq('client_id', req.user.id);
    } else if (role === 'lawyer') {
      const { data: lawyer, error: lawyerError } = await getLawyerForUser(req.user.id);
      if (lawyerError) return res.status(500).json({ error: lawyerError.message || lawyerError });
      if (!lawyer?.id) return res.json([]);
      query = query.eq('assigned_lawyer_id', lawyer.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create case
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, case_type, hearing_date, case_location, assigned_lawyer_id, document_url, notes } = req.body || {};
    
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Case title is required' });
    }

    const payload = {
      title: title.trim(),
      description: description ? String(description).trim() : null,
      case_type: case_type ? String(case_type).trim() : 'General',
      hearing_date: hearing_date || null,
      case_location: case_location ? String(case_location).trim() : null,
      assigned_lawyer_id: assigned_lawyer_id || null,
      document_url: document_url || null,
      notes: notes ? String(notes).trim() : null,
      status: 'Pending',
    };

    const role = getUserRole(req.user);

    if (role === 'client' || role === 'lawyer') {
      payload.client_id = req.user.id;
    }

    const { data, error } = await supabase
      .from('cases')
      .insert(payload)
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error });
    }

    let inserted = Array.isArray(data) ? data[0] : data;
    if (payload.assigned_lawyer_id && inserted?.id) {
      const { data: updated, error: updErr } = await supabase
        .from('cases')
        .update({ assigned_lawyer_id: payload.assigned_lawyer_id })
        .eq('id', inserted.id)
        .select();
      if (updErr) console.error('Supabase follow-up update error:', updErr);
      inserted = Array.isArray(updated) ? updated[0] : updated;
    }

    res.status(201).json(inserted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update case
router.put('/:id', auth, async (req, res) => {
  try {
    const { data: existingCase, error: fetchError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchError) return res.status(500).json({ error: fetchError.message || fetchError });
    if (!existingCase) return res.status(404).json({ error: 'Case not found' });

    const authResult = await authorizeCaseAccess(req, existingCase);
    if (!authResult.allowed) {
      return res.status(authResult.status || 403).json({ error: authResult.message || 'Forbidden' });
    }

    const updates = { ...req.body };
    const { data, error } = await supabase
      .from('cases')
      .update(updates)
      .eq('id', req.params.id)
      .select();

    if (error) {
      console.error('Supabase update error:', error);
      return res.status(500).json({ error });
    }

    res.json(Array.isArray(data) ? data[0] : data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete case
router.delete('/:id', auth, async (req, res) => {
  try {
    const { data: existingCase, error: fetchError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchError) return res.status(500).json({ error: fetchError.message || fetchError });
    if (!existingCase) return res.status(404).json({ error: 'Case not found' });

    const authResult = await authorizeCaseAccess(req, existingCase);
    if (!authResult.allowed) {
      return res.status(authResult.status || 403).json({ error: authResult.message || 'Forbidden' });
    }

    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', req.params.id);

    if (error) return res.status(500).json({ error });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;