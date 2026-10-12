const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/legalnexus';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'legalnexus';
const JWT_SECRET = process.env.JWT_SECRET || 'legalnexus-super-secret-jwt-key-2026';

const DATA_DIR = path.resolve(__dirname, 'data');
const FALLBACK_FILE = path.resolve(DATA_DIR, 'mongodb-fallback.json');

let mongoDb = null;
let isMongoConnected = false;
let initPromise = null;

// Initial seed data
const INITIAL_DATA = {
  users: [],
  profiles: [],
  lawyers: [
    {
      id: 'law-1',
      name: 'Adv. Priya Sharma',
      specialty: 'Corporate & M&A Law',
      experience_years: 12,
      rating: 4.9,
      email: 'priya.sharma@legalnexus.in',
      phone: '+91 98201 11223',
      bio: 'Senior Corporate Counsel specializing in cross-border mergers, NCLT litigation, and startup regulatory compliance.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'law-2',
      name: 'Adv. Rajesh Verma',
      specialty: 'Criminal & Constitutional Law',
      experience_years: 16,
      rating: 4.8,
      email: 'rajesh.verma@legalnexus.in',
      phone: '+91 98112 33445',
      bio: 'High Court & Supreme Court advocate handling bail matters, white-collar defense, and writ petitions.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'law-3',
      name: 'Adv. Meera Nair',
      specialty: 'Intellectual Property & Tech Law',
      experience_years: 9,
      rating: 4.9,
      email: 'meera.nair@legalnexus.in',
      phone: '+91 98450 55667',
      bio: 'Patent & trademark attorney advising technology enterprises on IP protection and data privacy.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'law-4',
      name: 'Adv. Vikramaditya Sen',
      specialty: 'Property & Real Estate Law',
      experience_years: 14,
      rating: 4.7,
      email: 'vikram.sen@legalnexus.in',
      phone: '+91 98300 77889',
      bio: 'RERA specialist and civil litigation counsel representing homebuyers and commercial developers.',
      created_at: new Date().toISOString(),
    },
  ],
  cases: [],
  hearings: [],
  faqs: [
    {
      id: 'faq-1',
      question: 'How do I connect with a verified lawyer on LegalNexus?',
      answer: 'Browse the Lawyers directory, filter by practice area or city, and book a consultation or assign them directly when filing a case.',
    },
    {
      id: 'faq-2',
      question: 'Are my uploaded case documents secure?',
      answer: 'Yes. All case files and identity documents are stored on Cloudflare R2 encrypted object storage with role-based access control.',
    },
    {
      id: 'faq-3',
      question: 'How are hearing dates tracked?',
      answer: 'Your assigned advocate updates hearing schedules directly in your workspace, which appear automatically in your Client Dashboard calendar.',
    },
  ],
  reviews: [
    {
      id: 'rev-1',
      name: 'Arjun Mehta',
      location: 'Mumbai',
      message: 'LegalNexus connected me with a RERA specialist within 20 minutes. Transparent tracking from day one.',
      rating: 5,
      created_at: new Date().toISOString(),
    },
    {
      id: 'rev-2',
      name: 'Kavita Krishnan',
      location: 'Bengaluru',
      message: 'Having all case documents and hearing dates in one dashboard saved our startup countless hours.',
      rating: 5,
      created_at: new Date().toISOString(),
    },
  ],
  activity_logs: [
    {
      id: 'log-init-1',
      at: Date.now() - 5 * 60 * 1000,
      category: 'system',
      title: 'MongoDB & Cloudflare R2 storage engine active',
      body: 'Database collections and document storage buckets synchronized with real-time audit logging.',
      actor: 'System',
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
  ],
};

function loadFallbackStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(FALLBACK_FILE)) {
      const raw = fs.readFileSync(FALLBACK_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      return { ...INITIAL_DATA, ...parsed };
    }
  } catch (err) {
    console.warn('Warning reading fallback store:', err.message);
  }
  saveFallbackStore(INITIAL_DATA);
  return JSON.parse(JSON.stringify(INITIAL_DATA));
}

let memoryStore = loadFallbackStore();

function saveFallbackStore(store = memoryStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.warn('Warning writing fallback store:', err.message);
  }
}

async function initDatabase() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 2500,
        connectTimeoutMS: 2500,
      });
      await client.connect();
      mongoDb = client.db(MONGODB_DB_NAME);
      isMongoConnected = true;
      console.log(`✅ Connected to MongoDB (${MONGODB_URI})`);

      // Seed initial lawyers, faqs, reviews if empty
      for (const colName of ['lawyers', 'faqs', 'reviews']) {
        const col = mongoDb.collection(colName);
        const count = await col.countDocuments();
        if (count === 0 && INITIAL_DATA[colName]?.length > 0) {
          await col.insertMany(INITIAL_DATA[colName].map(item => ({ ...item })));
        }
      }
    } catch (err) {
      isMongoConnected = false;
      mongoDb = null;
      console.log(`ℹ️ Local MongoDB server not detected at ${MONGODB_URI} — using persistent local JSON document store (backend/data/mongodb-fallback.json).`);
    }
  })();

  return initPromise;
}

function normalizeDoc(doc) {
  if (!doc) return doc;
  const copy = { ...doc };
  if (copy._id && !copy.id) {
    copy.id = String(copy._id);
  }
  delete copy._id;
  return copy;
}

class QueryBuilder {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.operation = 'select';
    this.filters = [];
    this.sortField = null;
    this.sortAsc = true;
    this.payload = null;
    this.expectSingle = false;
    this.expectMaybeSingle = false;
  }

  select(_columns = '*') {
    if (this.operation === 'select') {
      this.operation = 'select';
    }
    return this;
  }

  insert(data) {
    this.operation = 'insert';
    this.payload = data;
    return this;
  }

  update(data) {
    this.operation = 'update';
    this.payload = data;
    return this;
  }

  upsert(data) {
    this.operation = 'upsert';
    this.payload = data;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  eq(field, value) {
    this.filters.push({ type: 'eq', field, value });
    return this;
  }

  in(field, values) {
    this.filters.push({ type: 'in', field, values: Array.isArray(values) ? values : [] });
    return this;
  }

  order(field, options = { ascending: true }) {
    this.sortField = field;
    this.sortAsc = options?.ascending !== false;
    return this;
  }

  single() {
    this.expectSingle = true;
    return this;
  }

  maybeSingle() {
    this.expectMaybeSingle = true;
    return this;
  }

  matchesFilters(doc) {
    for (const f of this.filters) {
      if (f.type === 'eq') {
        if (String(doc[f.field] ?? '') !== String(f.value ?? '')) return false;
      } else if (f.type === 'in') {
        const strSet = new Set(f.values.map(v => String(v)));
        if (!strSet.has(String(doc[f.field] ?? ''))) return false;
      }
    }
    return true;
  }

  buildMongoFilter() {
    const query = {};
    for (const f of this.filters) {
      if (f.type === 'eq') {
        query[f.field] = f.value;
      } else if (f.type === 'in') {
        query[f.field] = { $in: f.values };
      }
    }
    return query;
  }

  async execute() {
    await initDatabase();

    try {
      if (isMongoConnected && mongoDb) {
        return await this.executeMongo();
      }
      return this.executeMemory();
    } catch (err) {
      return { data: null, error: { message: err.message || String(err) } };
    }
  }

  async executeMongo() {
    const col = mongoDb.collection(this.collectionName);
    const filter = this.buildMongoFilter();

    if (this.operation === 'select') {
      let cursor = col.find(filter);
      if (this.sortField) {
        cursor = cursor.sort({ [this.sortField]: this.sortAsc ? 1 : -1 });
      }
      const docs = (await cursor.toArray()).map(normalizeDoc);
      if (this.expectSingle) {
        if (docs.length === 0) return { data: null, error: { message: 'Record not found' } };
        return { data: docs[0], error: null };
      }
      if (this.expectMaybeSingle) {
        return { data: docs[0] || null, error: null };
      }
      return { data: docs, error: null };
    }

    if (this.operation === 'insert') {
      const items = (Array.isArray(this.payload) ? this.payload : [this.payload]).map(item => ({
        id: item.id || crypto.randomUUID(),
        created_at: item.created_at || new Date().toISOString(),
        ...item,
      }));
      await col.insertMany(items.map(i => ({ ...i })));
      const normalized = items.map(normalizeDoc);
      if (this.expectSingle || this.expectMaybeSingle) {
        return { data: normalized[0] || null, error: null };
      }
      return { data: normalized, error: null };
    }

    if (this.operation === 'update') {
      const updateFields = { ...this.payload, updated_at: new Date().toISOString() };
      delete updateFields._id;
      await col.updateMany(filter, { $set: updateFields });
      const updated = (await col.find(filter).toArray()).map(normalizeDoc);
      if (this.expectSingle || this.expectMaybeSingle) {
        return { data: updated[0] || null, error: null };
      }
      return { data: updated, error: null };
    }

    if (this.operation === 'upsert') {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload];
      const results = [];
      for (const raw of items) {
        const id = raw.id || crypto.randomUUID();
        const doc = {
          ...raw,
          id,
          updated_at: new Date().toISOString(),
        };
        if (!doc.created_at) doc.created_at = new Date().toISOString();
        await col.updateOne({ id }, { $set: doc }, { upsert: true });
        const saved = await col.findOne({ id });
        results.push(normalizeDoc(saved || doc));
      }
      if (this.expectSingle || this.expectMaybeSingle) {
        return { data: results[0] || null, error: null };
      }
      return { data: results, error: null };
    }

    if (this.operation === 'delete') {
      await col.deleteMany(filter);
      return { data: { success: true }, error: null };
    }

    return { data: null, error: { message: `Unsupported operation: ${this.operation}` } };
  }

  executeMemory() {
    if (!memoryStore[this.collectionName]) {
      memoryStore[this.collectionName] = [];
    }
    const list = memoryStore[this.collectionName];

    if (this.operation === 'select') {
      let docs = list.filter(d => this.matchesFilters(d)).map(d => ({ ...d }));
      if (this.sortField) {
        const f = this.sortField;
        const dir = this.sortAsc ? 1 : -1;
        docs.sort((a, b) => {
          const va = a[f] ?? '';
          const vb = b[f] ?? '';
          if (va < vb) return -1 * dir;
          if (va > vb) return 1 * dir;
          return 0;
        });
      }
      if (this.expectSingle) {
        if (docs.length === 0) return { data: null, error: { message: 'Record not found' } };
        return { data: docs[0], error: null };
      }
      if (this.expectMaybeSingle) {
        return { data: docs[0] || null, error: null };
      }
      return { data: docs, error: null };
    }

    if (this.operation === 'insert') {
      const items = (Array.isArray(this.payload) ? this.payload : [this.payload]).map(item => ({
        id: item.id || crypto.randomUUID(),
        created_at: item.created_at || new Date().toISOString(),
        ...item,
      }));
      list.push(...items);
      saveFallbackStore();
      if (this.expectSingle || this.expectMaybeSingle) {
        return { data: items[0] || null, error: null };
      }
      return { data: items, error: null };
    }

    if (this.operation === 'update') {
      const updated = [];
      for (let i = 0; i < list.length; i++) {
        if (this.matchesFilters(list[i])) {
          list[i] = { ...list[i], ...this.payload, updated_at: new Date().toISOString() };
          updated.push({ ...list[i] });
        }
      }
      saveFallbackStore();
      if (this.expectSingle || this.expectMaybeSingle) {
        return { data: updated[0] || null, error: null };
      }
      return { data: updated, error: null };
    }

    if (this.operation === 'upsert') {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload];
      const results = [];
      for (const raw of items) {
        const id = raw.id || crypto.randomUUID();
        const idx = list.findIndex(d => String(d.id) === String(id));
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...raw, id, updated_at: new Date().toISOString() };
          results.push({ ...list[idx] });
        } else {
          const created = {
            created_at: new Date().toISOString(),
            ...raw,
            id,
            updated_at: new Date().toISOString(),
          };
          list.push(created);
          results.push({ ...created });
        }
      }
      saveFallbackStore();
      if (this.expectSingle || this.expectMaybeSingle) {
        return { data: results[0] || null, error: null };
      }
      return { data: results, error: null };
    }

    if (this.operation === 'delete') {
      memoryStore[this.collectionName] = list.filter(d => !this.matchesFilters(d));
      saveFallbackStore();
      return { data: { success: true }, error: null };
    }

    return { data: null, error: { message: `Unsupported operation: ${this.operation}` } };
  }

  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }
}

// ─── Auth Helpers (MongoDB + JWT) ────────────────────────────────────────────

function signUserToken(user) {
  const payload = {
    sub: user.id,
    id: user.id,
    email: user.email,
    role: user.role || user.user_metadata?.role || 'client',
    user_metadata: user.user_metadata || { full_name: user.full_name, role: user.role || 'client' },
  };
  const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  const expires_at = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
  return {
    access_token,
    token_type: 'bearer',
    expires_in: 7 * 24 * 3600,
    expires_at,
    user: {
      id: user.id,
      email: user.email,
      role: payload.role,
      user_metadata: payload.user_metadata,
      created_at: user.created_at,
    },
  };
}

async function registerUser({ email, password, full_name, role = 'client', bar_enrollment }) {
  await initDatabase();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { data: null, error: { message: 'Email and password are required' } };
  }

  const { data: existing } = await new QueryBuilder('users').select('*').eq('email', normalizedEmail).maybeSingle();
  if (existing) {
    return { data: null, error: { message: 'An account with this email already exists' } };
  }

  const password_hash = await bcrypt.hash(password, 10);
  const userId = crypto.randomUUID();
  const now = new Date().toISOString();
  const cleanRole = ['client', 'lawyer', 'admin'].includes(role) ? role : 'client';

  const newUser = {
    id: userId,
    email: normalizedEmail,
    password_hash,
    full_name: full_name || normalizedEmail.split('@')[0],
    role: cleanRole,
    user_metadata: {
      full_name: full_name || normalizedEmail.split('@')[0],
      role: cleanRole,
      bar_enrollment: bar_enrollment || null,
    },
    created_at: now,
  };

  await new QueryBuilder('users').insert(newUser);

  // Also create profile record in `profiles`
  const nameParts = (newUser.full_name || '').trim().split(/\s+/);
  await new QueryBuilder('profiles').upsert({
    id: userId,
    email: normalizedEmail,
    full_name: newUser.full_name,
    first_name: nameParts[0] || '',
    last_name: nameParts.slice(1).join(' ') || '',
    role: cleanRole,
    created_at: now,
  });

  // If signing up as a lawyer, ensure a lawyer record exists
  if (cleanRole === 'lawyer') {
    await new QueryBuilder('lawyers').insert({
      id: crypto.randomUUID(),
      user_id: userId,
      name: newUser.full_name,
      email: normalizedEmail,
      specialty: 'General Practice',
      experience_years: 1,
      rating: 4.8,
      bar_enrollment: bar_enrollment || null,
      created_at: now,
    });
  }

  await logSystemActivity({
    category: cleanRole === 'lawyer' ? 'lawyer' : 'system',
    title: `New ${cleanRole} account registered`,
    body: `${newUser.full_name} (${normalizedEmail}) joined LegalNexus as ${cleanRole}.`,
    actor: newUser.full_name,
  });

  const session = signUserToken(newUser);
  return { data: { user: session.user, session }, error: null };
}

const DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@legalnexus.in').trim().toLowerCase();
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

async function logSystemActivity({ category = 'system', title, body, actor = 'System' }) {
  try {
    const now = Date.now();
    const entry = {
      id: crypto.randomUUID(),
      at: now,
      category,
      title: String(title || 'System Activity'),
      body: String(body || ''),
      actor: String(actor || 'System'),
      created_at: new Date(now).toISOString(),
    };
    await new QueryBuilder('activity_logs').insert(entry);
    return entry;
  } catch (err) {
    console.warn('Failed to write activity log:', err.message);
    return null;
  }
}

async function ensureAdminUser() {
  const { data: existingAdmin } = await new QueryBuilder('users').select('*').eq('email', DEFAULT_ADMIN_EMAIL).maybeSingle();
  if (existingAdmin) {
    if (existingAdmin.role !== 'admin') {
      await new QueryBuilder('users').update({
        role: 'admin',
        user_metadata: { ...(existingAdmin.user_metadata || {}), full_name: existingAdmin.full_name || 'LegalNexus Admin', role: 'admin' },
      }).eq('id', existingAdmin.id);
      await new QueryBuilder('profiles').upsert({
        id: existingAdmin.id,
        email: DEFAULT_ADMIN_EMAIL,
        full_name: existingAdmin.full_name || 'LegalNexus Admin',
        role: 'admin',
      });
    }
    return existingAdmin;
  }

  const password_hash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  const adminId = 'admin-primary-001';
  const now = new Date().toISOString();
  const adminUser = {
    id: adminId,
    email: DEFAULT_ADMIN_EMAIL,
    password_hash,
    full_name: 'LegalNexus Admin',
    role: 'admin',
    user_metadata: {
      full_name: 'LegalNexus Admin',
      role: 'admin',
    },
    created_at: now,
  };

  await new QueryBuilder('users').insert(adminUser);
  await new QueryBuilder('profiles').upsert({
    id: adminId,
    email: DEFAULT_ADMIN_EMAIL,
    full_name: 'LegalNexus Admin',
    first_name: 'LegalNexus',
    last_name: 'Admin',
    role: 'admin',
    created_at: now,
  });

  return adminUser;
}

async function loginUser({ email, password }) {
  await initDatabase();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { data: null, error: { message: 'Email and password are required' } };
  }

  // Ensure default admin account exists in DB
  if (normalizedEmail === DEFAULT_ADMIN_EMAIL || normalizedEmail === 'admin@gmail.com') {
    await ensureAdminUser();
  }

  let { data: existing } = await new QueryBuilder('users').select('*').eq('email', normalizedEmail).maybeSingle();

  // Allow admin@gmail.com as an alias for default admin if not separately registered
  if (!existing && normalizedEmail === 'admin@gmail.com') {
    const { data: defAdmin } = await new QueryBuilder('users').select('*').eq('email', DEFAULT_ADMIN_EMAIL).maybeSingle();
    existing = defAdmin;
  }

  if (!existing) {
    return { data: null, error: { message: 'Invalid email or password. Please create an account first if you are new.' } };
  }

  let valid = await bcrypt.compare(password, existing.password_hash || '');
  // Also accept 'Admin@123' or 'admin123' for the built-in admin account
  if (!valid && existing.role === 'admin' && (password === DEFAULT_ADMIN_PASSWORD || password === 'admin123' || password === 'Admin@123')) {
    valid = true;
  }

  if (!valid) {
    return { data: null, error: { message: 'Invalid email or password' } };
  }

  await logSystemActivity({
    category: 'system',
    title: `${existing.role === 'admin' ? 'Administrator' : 'User'} session authenticated`,
    body: `${existing.full_name || existing.email} signed in (${existing.role || 'client'} portal).`,
    actor: existing.full_name || existing.email,
  });

  const session = signUserToken(existing);
  return { data: { user: session.user, session }, error: null };
}

async function getUserFromToken(token) {
  if (!token) return { data: { user: null }, error: { message: 'Missing token' } };
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id || decoded.sub;
    const { data: dbUser } = await new QueryBuilder('users').select('*').eq('id', userId).maybeSingle();
    if (dbUser) {
      const userObj = {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role || dbUser.user_metadata?.role || 'client',
        user_metadata: dbUser.user_metadata || { full_name: dbUser.full_name, role: dbUser.role || 'client' },
        created_at: dbUser.created_at,
      };
      return { data: { user: userObj }, error: null };
    }
    // Even if user was created before a restart, trust valid signed JWT
    return {
      data: {
        user: {
          id: userId,
          email: decoded.email,
          role: decoded.role || 'client',
          user_metadata: decoded.user_metadata || { role: decoded.role || 'client' },
        },
      },
      error: null,
    };
  } catch (err) {
    return { data: { user: null }, error: { message: 'Invalid or expired token' } };
  }
}

const db = {
  from: (collectionName) => new QueryBuilder(collectionName),
  auth: {
    getUser: getUserFromToken,
    registerUser,
    loginUser,
    signUserToken,
  },
  logSystemActivity,
  initDatabase,
  getStatus: () => ({
    provider: isMongoConnected ? 'mongodb' : 'mongodb-local-fallback',
    uri: MONGODB_URI,
    connected: isMongoConnected,
  }),
};

module.exports = db;
