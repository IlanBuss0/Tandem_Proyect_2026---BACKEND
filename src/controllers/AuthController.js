import { Router } from 'express';
import AuthService from '../services/AuthService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { envConfig } from '../configs/env.config.js';

const router = Router();

const REFRESH_COOKIE_NAME = 'tandem_refresh_token';
const isProduction = envConfig.nodeEnv === 'production';

function refreshCookieOptions(refreshExpiresAt) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/api/auth',
    expires: new Date(refreshExpiresAt),
  };
}

function sendSession(res, status, session) {
  const { refreshToken, refreshExpiresAt, ...data } = session;
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions(refreshExpiresAt));
  res.status(status).json({ ok: true, data });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/api/auth',
  });
}

router.post('/register', async (req, res, next) => {
  try {
    sendSession(res, 201, await AuthService.register(req.body));
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    sendSession(res, 200, await AuthService.login(req.body));
  } catch (e) {
    next(e);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    sendSession(res, 200, await AuthService.refresh(req.cookies?.[REFRESH_COOKIE_NAME]));
  } catch (e) {
    clearRefreshCookie(res);
    next(e);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const data = await AuthService.logout(req.cookies?.[REFRESH_COOKIE_NAME]);
    clearRefreshCookie(res);
    res.status(200).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/me', authMiddleware, async (req, res, next) => { try { res.status(200).json({ ok: true, data: await AuthService.me(req) }); } catch (e) { next(e); } });

export default router;
