import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import PictogramaService from '../services/PictogramaService.js';

const router = Router();
const currentService = new PictogramaService();

router.get('', async (req, res) => {
  try {
    const pictograms = await currentService.searchAsync({
      search: req.query.search || req.query.q,
      category: req.query.category,
      language: req.query.language || req.query.lang,
      limit: req.query.limit,
    });

    res.status(StatusCodes.OK).json(pictograms);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_GATEWAY).json({ message: error.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await currentService.getCategoriesAsync(req.query.language || req.query.lang);
    res.status(StatusCodes.OK).json(categories);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_GATEWAY).json({ message: error.message });
  }
});

router.get('/favorites', async (req, res) => {
  try {
    const favorites = await currentService.getFavoritesAsync(
      req.query.userId || req.query.id_usuario,
      req.query.language || req.query.lang,
    );
    res.status(StatusCodes.OK).json(favorites);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
});

router.get('/:id/image', (req, res) => {
  try {
    const imageUrl = currentService.getImageUrl(req.params.id, req.query.resolution);
    res.redirect(StatusCodes.TEMPORARY_REDIRECT, imageUrl);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
});

router.get('/:id/download', async (req, res) => {
  try {
    const file = await currentService.downloadAsync(req.params.id, req.query.language || req.query.lang);

    if (!file) {
      return res.status(StatusCodes.NOT_FOUND).send(`No se encontro el pictograma con id: ${req.params.id}.`);
    }

    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    res.status(StatusCodes.OK).send(file.data);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_GATEWAY).json({ message: error.message });
  }
});

router.post('/:id/save', async (req, res) => {
  try {
    const pictogram = await currentService.markSavedAsync(
      req.params.id,
      req.body?.language || req.query.language || req.query.lang,
      req.body?.userId || req.body?.id_usuario || req.query.userId || req.query.id_usuario,
    );

    if (!pictogram) {
      return res.status(StatusCodes.NOT_FOUND).send(`No se encontro el pictograma con id: ${req.params.id}.`);
    }

    res.status(StatusCodes.OK).json({ message: 'Pictograma guardado.', pictogram });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_GATEWAY).json({ message: error.message });
  }
});

router.delete('/:id/save', async (req, res) => {
  try {
    const rowsAffected = await currentService.unmarkSavedAsync(
      req.params.id,
      req.body?.language || req.query.language || req.query.lang,
      req.body?.userId || req.body?.id_usuario || req.query.userId || req.query.id_usuario,
    );

    res.status(StatusCodes.OK).json({ message: 'Pictograma quitado de favoritos.', rowsAffected });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
});

router.post('/sync', async (req, res) => {
  try {
    const result = await currentService.syncFromArasaacAsync({
      language: req.body?.language || req.query.language || req.query.lang,
    });

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_GATEWAY).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pictogram = await currentService.getByIdAsync(req.params.id, req.query.language || req.query.lang);

    if (pictogram != null) {
      res.status(StatusCodes.OK).json(pictogram);
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro el pictograma con id: ${req.params.id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_GATEWAY).json({ message: error.message });
  }
});

export default router;
