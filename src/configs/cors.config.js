import { envConfig } from './env.config.js';

const developmentOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
];

const configuredOrigins = envConfig.corsOrigins;
const allowAllOrigins = envConfig.nodeEnv !== 'production' && configuredOrigins.includes('*');
const allowedOrigins = configuredOrigins.length > 0
  ? configuredOrigins
  : envConfig.nodeEnv === 'production'
    ? []
    : developmentOrigins;

export function isCorsOriginAllowed(origin) {
  if (!origin) return true;
  if (allowAllOrigins) return true;
  return allowedOrigins.includes(origin);
}

export const corsOptions = {
  origin(origin, callback) {
    if (isCorsOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
};

export const socketCorsOptions = {
  origin(origin, callback) {
    callback(null, isCorsOriginAllowed(origin));
  },
  methods: ['GET', 'POST'],
  credentials: true,
};
