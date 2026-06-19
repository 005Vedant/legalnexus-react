const supabase = require('./supabase');

// Middleware to verify a Supabase JWT from Authorization: Bearer <token>
module.exports = async function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    // supabase-js v2: supabase.auth.getUser(token)
    if (supabase.auth && typeof supabase.auth.getUser === 'function') {
      const { data, error } = await supabase.auth.getUser(token);
      if (error) return res.status(401).json({ error: error.message || error });
      req.user = data?.user || data;
      return next();
    }

    // supabase-js v1: supabase.auth.api.getUser(token)
    if (supabase.auth && supabase.auth.api && typeof supabase.auth.api.getUser === 'function') {
      const { user, error } = await supabase.auth.api.getUser(token);
      if (error) return res.status(401).json({ error: error.message || error });
      req.user = user;
      return next();
    }

    return res.status(500).json({ error: 'Unsupported supabase client for auth verification' });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
};
