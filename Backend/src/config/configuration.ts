export default () => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  host: process.env.HOST ?? '0.0.0.0',
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
  mergePdf: {
    workerUrl: process.env.MERGE_PDF_WORKER_URL ?? 'http://127.0.0.1:8104',
    maxFileBytes: parseInt(process.env.MERGE_PDF_MAX_FILE_BYTES ?? String(25 * 1024 * 1024), 10),
    maxTotalBytes: parseInt(process.env.MERGE_PDF_MAX_TOTAL_BYTES ?? String(100 * 1024 * 1024), 10),
    maxFiles: parseInt(process.env.MERGE_PDF_MAX_FILES ?? '20', 10),
  },
  splitPdf: {
    workerUrl: process.env.SPLIT_PDF_WORKER_URL ?? 'http://127.0.0.1:8105',
    maxBytes: parseInt(process.env.SPLIT_PDF_MAX_BYTES ?? String(25 * 1024 * 1024), 10),
  },
  compressPdf: {
    workerUrl: process.env.COMPRESS_PDF_WORKER_URL ?? 'http://127.0.0.1:8106',
    maxBytes: parseInt(process.env.COMPRESS_PDF_MAX_BYTES ?? String(25 * 1024 * 1024), 10),
  },
  aiAssistant: {
    workerUrl: process.env.AI_ASSISTANT_WORKER_URL ?? 'http://127.0.0.1:8107',
  },
  imageToText: {
    workerUrl: process.env.IMAGE_TO_TEXT_WORKER_URL ?? 'http://127.0.0.1:8108',
    maxBytes: parseInt(process.env.IMAGE_TO_TEXT_MAX_BYTES ?? String(15 * 1024 * 1024), 10),
  },
  speechToText: {
    workerUrl: process.env.SPEECH_TO_TEXT_WORKER_URL ?? 'http://127.0.0.1:8109',
    maxBytes: parseInt(process.env.SPEECH_TO_TEXT_MAX_BYTES ?? String(25 * 1024 * 1024), 10),
  },
  imageConverter: {
    workerUrl: process.env.IMAGE_CONVERTER_WORKER_URL ?? 'http://127.0.0.1:8110',
  },
  googleSiteKit: {
    clientId: process.env.GOOGLE_SITE_KIT_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_SITE_KIT_CLIENT_SECRET ?? '',
    redirectUri:
      process.env.GOOGLE_SITE_KIT_REDIRECT_URI ??
      'http://localhost:3001/site-kit/oauth/callback',
    pagespeedApiKey: process.env.GOOGLE_PAGESPEED_API_KEY ?? '',
    defaultSiteUrl: process.env.PUBLIC_SITE_URL ?? 'http://localhost:3000',
  },
});
