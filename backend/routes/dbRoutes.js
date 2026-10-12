const express = require('express');
const router = express.Router();
const db = require('../db');

const ALLOWED_COLLECTIONS = new Set([
  'profiles',
  'lawyers',
  'cases',
  'hearings',
  'faqs',
  'reviews',
]);

// POST /api/db/:collection
router.post('/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    if (!ALLOWED_COLLECTIONS.has(collection)) {
      return res.status(400).json({ data: null, error: { message: `Invalid collection: ${collection}` } });
    }

    const {
      operation = 'select',
      filters = [],
      sortField = null,
      sortAsc = true,
      payload = null,
      expectSingle = false,
      expectMaybeSingle = false,
    } = req.body || {};

    const qb = db.from(collection);
    qb.operation = operation;
    qb.filters = Array.isArray(filters) ? filters : [];
    qb.sortField = sortField;
    qb.sortAsc = sortAsc !== false;
    qb.payload = payload;
    qb.expectSingle = Boolean(expectSingle);
    qb.expectMaybeSingle = Boolean(expectMaybeSingle);

    const result = await qb.execute();
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ data: null, error: { message: err.message } });
  }
});

module.exports = router;
