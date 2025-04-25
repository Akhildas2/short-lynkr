import express from 'express';
import { UrlController } from '../controllers/url.controller';
import { validateUrl } from '../middlewares/validateUrl';
import { errorHandler } from '../middlewares/errorHandler';

const router = express.Router();

router.post('/shorten', validateUrl, UrlController.shortenUrl);
router.get('/:shortId', UrlController.redirectUrl);

router.use(errorHandler);

export default router;