const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const auth = require('../auth');

function getUserRole(user) {
  return user?.user_metadata?.role || user?.role || 'client';
}

// Scoped GET hearings endpoint
router.get('/', auth, async (req, res) => {
  try {
    const role = getUserRole(req.user);

    // Admin sees all hearings
    if (role === 'admin') {
      const { data, error } = await supabase
        .from('hearings')
        .select('*')
        .order('hearing_date', { ascending: true });
      if (error) return res.status(500).json({ error });
      return res.json(data);
    }

    // Client sees hearings for their cases
    if (role === 'client') {
      const { data: userCases } = await supabase
        .from('cases')
        .select('id')
        .eq('client_id', req.user.id);
      
      const caseIds = (userCases || []).map(c => c.id);
      if (caseIds.length === 0) return res.json([]);

      const { data, error } = await supabase
        .from('hearings')
        .select('*')
        .in('case_id', caseIds)
        .order('hearing_date', { ascending: true });
      
      if (error) return res.status(500).json({ error });
      return res.json(data);
    }

    // Lawyer sees hearings for cases assigned to them
    if (role === 'lawyer') {
      const { data: lawyerProfile } = await supabase
        .from('lawyers')
        .select('id')
        .eq('user_id', req.user.id)
        .maybeSingle();

      if (!lawyerProfile) {
        // Fallback: return hearings where case client or lawyer ID matches
        const { data, error } = await supabase
          .from('hearings')
          .select('*')
          .order('hearing_date', { ascending: true });
        if (error) return res.status(500).json({ error });
        return res.json(data);
      }

      const { data: assignedCases } = await supabase
        .from('cases')
        .select('id')
        .eq('assigned_lawyer_id', lawyerProfile.id);

      const caseIds = (assignedCases || []).map(c => c.id);
      if (caseIds.length === 0) return res.json([]);

      const { data, error } = await supabase
        .from('hearings')
        .select('*')
        .in('case_id', caseIds)
        .order('hearing_date', { ascending: true });

      if (error) return res.status(500).json({ error });
      return res.json(data);
    }

    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST hearing (Lawyer or Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const role = getUserRole(req.user);
    if (role !== 'admin' && role !== 'lawyer') {
      return res.status(403).json({ error: 'Only admins and lawyers can create hearing records' });
    }

    const { data, error } = await supabase
      .from('hearings')
      .insert(req.body)
      .select();
    if (error) return res.status(500).json({ error });
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;