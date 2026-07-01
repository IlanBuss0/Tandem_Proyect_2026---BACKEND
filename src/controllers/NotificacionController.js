import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import NotificacionService from '../services/NotificacionService.js';

const router = Router();
const currentService = new NotificacionService();

router.get('/mine', async (req, res, next) => {
  try {
    const notifications = await currentService.getMineAsync(req.user.id);
    res.status(StatusCodes.OK).json(notifications);
  } catch (error) {
    next(error);
  }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    const rowsAffected = await currentService.markAllAsReadForUserAsync(req.user.id);
    res.status(StatusCodes.OK).json({ rowsAffected });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const notificationId = Number(req.params.id);
    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'El id de la notificacion es invalido.' });
    }

    const rowsAffected = await currentService.markAsReadForUserAsync(notificationId, req.user.id);
    if (rowsAffected === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Notificacion no encontrada.' });
    }
    return res.status(StatusCodes.OK).json({ rowsAffected });
  } catch (error) {
    return next(error);
  }
});

export default router;
