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

router.get('/:id/image', (req, res) => {
  try {
    const imageUrl = currentService.getImageUrl(req.params.id, req.query.resolution);
    res.redirect(StatusCodes.TEMPORARY_REDIRECT, imageUrl);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
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
