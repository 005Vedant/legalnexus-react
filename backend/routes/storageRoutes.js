const express = require('express');
const multer = require('multer');
const router = express.Router();
const { uploadFile, getPublicUrl } = require('../cloudflareR2');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

// POST /api/storage/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const bucket = req.body.bucket || 'general';
    const filePath = req.body.path || (req.file ? `${Date.now()}_${req.file.originalname}` : '');

    if (!req.file) {
      return res.status(400).json({ data: null, error: { message: 'No file provided' } });
    }

    const result = await uploadFile({
      bucket,
      key: filePath,
      buffer: req.file.buffer,
      contentType: req.file.mimetype,
    });

    return res.json({
      data: {
        path: result.path,
        publicUrl: result.publicUrl,
        provider: result.provider,
      },
      error: null,
    });
  } catch (err) {
    return res.status(500).json({ data: null, error: { message: err.message } });
  }
});

// GET /api/storage/public-url
router.get('/public-url', (req, res) => {
  const bucket = req.query.bucket || 'general';
  const filePath = req.query.path || '';
  const publicUrl = getPublicUrl(bucket, filePath);
  return res.json({ data: { publicUrl } });
});

module.exports = router;
