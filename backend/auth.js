const supabase = require('./supabase');

// In-memory token cache (60s TTL) to eliminate redundant Supabase auth network round-trips
const tokenCache = new Map();

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

  // 1. Fast path: check in-memory cache
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    req.user = cached.user;
    return next();
  }

  try {
    let authenticatedUser = null;

    if (supabase.auth && typeof supabase.auth.getUser === 'function') {
      const { data, error } = await supabase.auth.getUser(token);
      if (error) return res.status(401).json({ error: error.message || error });
      authenticatedUser = data?.user || data || null;
    } else if (supabase.auth && supabase.auth.api && typeof supabase.auth.api.getUser === 'function') {
      const { user, error } = await supabase.auth.api.getUser(token);
      if (error) return res.status(401).json({ error: error.message || error });
      authenticatedUser = user;
    } else {
      return res.status(500).json({ error: 'Unsupported supabase client for auth verification' });
    }

    if (!authenticatedUser) {
      return res.status(401).json({ error: 'Invalid user session' });
    }

    // Cache valid user for 60 seconds
    tokenCache.set(token, {
      user: authenticatedUser,
      expiresAt: Date.now() + 60 * 1000,
    });

    // Cleanup old cache entries periodically
    if (tokenCache.size > 200) {
      const now = Date.now();
      for (const [k, v] of tokenCache.entries()) {
        if (v.expiresAt < now) tokenCache.delete(k);
      }
    }

    req.user = authenticatedUser;
    return next();
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
};
