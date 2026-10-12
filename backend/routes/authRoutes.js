const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name, role, bar_enrollment, options } = req.body || {};
    const meta = options?.data || {};
    const resolvedName = full_name || meta.full_name || '';
    const resolvedRole = role || meta.role || 'client';
    const resolvedBar = bar_enrollment || meta.bar_enrollment || null;

    const { data, error } = await db.auth.registerUser({
      email,
      password,
      full_name: resolvedName,
      role: resolvedRole,
      bar_enrollment: resolvedBar,
    });

    if (error) {
      return res.status(400).json({ data: { user: null, session: null }, error });
    }

    return res.status(201).json({ data, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: { message: err.message } });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const { data, error } = await db.auth.loginUser({ email, password });

    if (error) {
      return res.status(401).json({ data: { user: null, session: null }, error });
    }

    return res.json({ data, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: { message: err.message } });
  }
});

// GET /api/auth/session
router.get('/session', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) {
      return res.json({ data: { session: null, user: null }, error: null });
    }

    const { data, error } = await db.auth.getUser(token);
    if (error || !data?.user) {
      return res.json({ data: { session: null, user: null }, error });
    }

    const session = {
      access_token: token,
      token_type: 'bearer',
      user: data.user,
    };

    return res.json({ data: { session, user: data.user }, error: null });
  } catch (err) {
    return res.json({ data: { session: null, user: null }, error: { message: err.message } });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  return res.json({ error: null });
});

module.exports = router;
