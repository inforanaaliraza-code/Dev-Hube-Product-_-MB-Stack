export default () => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  http: {
    bodyLimit: process.env.HTTP_BODY_LIMIT ?? '2mb',
  },
  cors: {
    origin:
      process.env.CORS_ORIGIN ?? 'http://localhost:3000,http://localhost:3001',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'dev-hube-jwt-secret-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    seedAdminEmail: process.env.ADMIN_EMAIL ?? 'admin@devhube.com',
    seedAdminPassword: process.env.ADMIN_PASSWORD ?? 'changeme',
  },
  admin: {
    apiKey: process.env.ADMIN_API_KEY ?? 'dev-hube-admin-key',
  },
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'ali123',
    name: process.env.DB_NAME ?? 'dev_hube',
  },
  tempMail: {
    providerBaseUrl: process.env.TEMP_MAIL_PROVIDER_URL ?? 'https://api.mail.tm',
    workerUrl: process.env.TEMP_MAIL_WORKER_URL ?? 'http://127.0.0.1:8100',
    ttlMinutes: parseInt(process.env.TEMP_MAIL_TTL_MINUTES ?? '60', 10),
  },
  qrGenerator: {
    workerUrl: process.env.QR_GENERATOR_WORKER_URL ?? 'http://127.0.0.1:8101',
    publicApiUrl:
      process.env.QR_GENERATOR_PUBLIC_API_URL ??
      process.env.PUBLIC_API_URL ??
      'http://localhost:4000/api/v1',
  },
  imageCompressor: {
    workerUrl: process.env.IMAGE_COMPRESSOR_WORKER_URL ?? 'http://127.0.0.1:8102',
    maxBytes: parseInt(process.env.IMAGE_COMPRESSOR_MAX_BYTES ?? String(15 * 1024 * 1024), 10),
  },
  pdfToWord: {
    workerUrl: process.env.PDF_TO_WORD_WORKER_URL ?? 'http://127.0.0.1:8103',
    maxBytes: parseInt(process.env.PDF_TO_WORD_MAX_BYTES ?? String(25 * 1024 * 1024), 10),
  },
});
