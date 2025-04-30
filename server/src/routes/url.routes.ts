import { Router } from 'express';
import { createUrl, redirectToOriginal } from '../controllers/url.controller';
import { validateUrl } from '../middleware/validateUrl';

const router = Router();

router.post('/shorten',validateUrl,createUrl);
router.get('/r/:shortId', redirectToOriginal);

export default router;