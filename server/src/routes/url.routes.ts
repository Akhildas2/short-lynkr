import { Router } from 'express';
import { createUrl, getUserUrls, redirectToOriginal } from '../controllers/url.controller';
import { validateUrl } from '../middleware/validateUrl';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/shorten', authenticate, validateUrl, createUrl);
router.get('/my-urls',authenticate,getUserUrls);
router.get('/r/:shortId', authenticate, redirectToOriginal);

export default router;