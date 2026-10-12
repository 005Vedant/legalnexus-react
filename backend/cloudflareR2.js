const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET || 'legalnexus-storage';
const R2_PUBLIC_URL = (process.env.CLOUDFLARE_R2_PUBLIC_URL || '').replace(/\/+$/, '');

const UPLOADS_DIR = path.resolve(__dirname, 'uploads');

const isR2Configured = Boolean(
  R2_ACCOUNT_ID &&
  R2_ACCESS_KEY_ID &&
  R2_SECRET_ACCESS_KEY &&
  !R2_ACCOUNT_ID.includes('your_')
);

let s3Client = null;
if (isR2Configured) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
  console.log(`☁️ Cloudflare R2 Storage initialized (Bucket: ${R2_BUCKET_NAME})`);
} else {
  console.log('☁️ Cloudflare R2 credentials not set in .env — using local disk fallback (/uploads) for file uploads.');
}

/**
 * Upload a file buffer to Cloudflare R2 (or local /uploads fallback if R2 is not configured yet)
 */
async function uploadFile({ bucket = 'general', key, buffer, contentType = 'application/octet-stream' }) {
  const sanitizedBucket = String(bucket).replace(/[^a-zA-Z0-9_-]/g, '');
  const sanitizedKey = String(key).replace(/^\/+/, '').replace(/\.\./g, '');
  const objectKey = `${sanitizedBucket}/${sanitizedKey}`;

  if (isR2Configured && s3Client) {
    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: objectKey,
          Body: buffer,
          ContentType: contentType,
        })
      );

      const publicUrl = R2_PUBLIC_URL
        ? `${R2_PUBLIC_URL}/${objectKey}`
        : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${objectKey}`;

      return {
        provider: 'cloudflare-r2',
        bucket: sanitizedBucket,
        path: sanitizedKey,
        publicUrl,
      };
    } catch (err) {
      console.warn('Cloudflare R2 upload failed, falling back to local disk:', err.message);
    }
  }

  // Local disk fallback
  const targetPath = path.resolve(UPLOADS_DIR, sanitizedBucket, sanitizedKey);
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(targetPath, buffer);

  const publicUrl = `/uploads/${sanitizedBucket}/${sanitizedKey}`;
  return {
    provider: 'cloudflare-r2-local-fallback',
    bucket: sanitizedBucket,
    path: sanitizedKey,
    publicUrl,
  };
}

function getPublicUrl(bucket = 'general', key = '') {
  const sanitizedBucket = String(bucket).replace(/[^a-zA-Z0-9_-]/g, '');
  const sanitizedKey = String(key).replace(/^\/+/, '').replace(/\.\./g, '');
  const objectKey = `${sanitizedBucket}/${sanitizedKey}`;

  if (isR2Configured && R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${objectKey}`;
  }
  return `/uploads/${objectKey}`;
}

module.exports = {
  uploadFile,
  getPublicUrl,
  UPLOADS_DIR,
  isR2Configured,
};
