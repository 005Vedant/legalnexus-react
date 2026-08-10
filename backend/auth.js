const supabase = require('./supabase');

function getBearerToken(req) {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  const fallbackToken = req.headers['x-access-token'];
  if (typeof fallbackToken === 'string') {
    return fallbackToken.trim();
  }

  return authHeader.trim();
}

// Middleware to verify a Supabase JWT from Authorization: Bearer <token>
module.exports = async function auth(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    if (supabase.auth && typeof supabase.auth.getUser === 'function') {
      const { data, error } = await supabase.auth.getUser(token);
      if (error) return res.status(401).json({ error: error.message || error });
      req.user = data?.user || data || null;
      return next();
    }

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
