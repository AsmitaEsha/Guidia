import 'dotenv/config';

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT || 8000),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  jwtAccessSecret: required('JWT_ACCESS_SECRET', process.env.NODE_ENV === 'test' ? 'test-secret' : undefined),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET', process.env.NODE_ENV === 'test' ? 'test-refresh-secret' : undefined),
  jwtAccessTtl: process.env.JWT_ACCESS_TTL || '15m',
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL || '30d',
  aiProvider: process.env.AI_PROVIDER || 'gemini',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};
