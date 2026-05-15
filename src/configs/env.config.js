import dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
};
