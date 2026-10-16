import { Router } from 'express';
import { authMiddleware, verifiedAccountMiddleware } from '../middlewares/auth.middleware.js';
import ProtectedStorageService from '../services/ProtectedStorageService.js';

const router = Router();
const storage = new ProtectedStorageService();
const authenticate = (req, res) => new Promise((resolve, reject) => authMiddleware(req, res, error => error ? reject(error) : verifiedAccountMiddleware(req, res, error => error ? reject(error) : resolve())));

router.get('/:bucket/*path', async (req, res, next) => {
  try {
    const path = req.params.path.join('/');
    const bucket = req.params.bucket;
    if (!(await storage.isPublishedPictogram(bucket, path))) {
      await authenticate(req, res);
      await storage.assertAccess(req.user.id, bucket, path);
    }
    const response = await storage.download(bucket, path);
    res.set({ 'Cache-Control': 'private, no-store', 'Content-Type': response.headers['content-type'] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    res.send(Buffer.from(response.data));
  } catch (error) { next(error); }
});

export default router;
