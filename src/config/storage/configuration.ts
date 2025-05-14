import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  provider: process.env.STORAGE_PROVIDER || 'local', // local, s3, gcs
  baseUrl: process.env.STORAGE_BASE_URL || 'http://localhost:3000/uploads',

  // Configuración Local
  local: {
    path: process.env.STORAGE_LOCAL_PATH || 'uploads',
    serveStatic: process.env.STORAGE_LOCAL_SERVE_STATIC !== 'false',
  },

  // Configuración S3
  s3: {
    bucket: process.env.STORAGE_S3_BUCKET || 'my-bucket',
    region: process.env.STORAGE_S3_REGION || 'us-east-1',
    accessKey: process.env.STORAGE_S3_ACCESS_KEY || '',
    secretKey: process.env.STORAGE_S3_SECRET_KEY || '',
    endpoint: process.env.STORAGE_S3_ENDPOINT || '',
    forcePathStyle: process.env.STORAGE_S3_FORCE_PATH_STYLE === 'true',
  },

  // Configuración Google Cloud Storage
  gcs: {
    bucket: process.env.STORAGE_GCS_BUCKET || 'my-bucket',
    projectId: process.env.STORAGE_GCS_PROJECT_ID || '',
    keyFilename: process.env.STORAGE_GCS_KEY_FILENAME || '',
  },

  // Limitaciones generales
  maxFileSize: parseInt(process.env.STORAGE_MAX_FILE_SIZE || '5242880', 10), // 5MB
  allowedMimeTypes: (
    process.env.STORAGE_ALLOWED_MIME_TYPES ||
    'image/jpeg,image/png,application/pdf'
  ).split(','),
  allowedExtensions: (
    process.env.STORAGE_ALLOWED_EXTENSIONS || '.jpg,.jpeg,.png,.pdf'
  ).split(','),
}));
