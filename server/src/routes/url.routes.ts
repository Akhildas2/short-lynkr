import { Router } from 'express';
import { createUrl, deleteUrl, getUserUrls, redirectToOriginal } from '../controllers/url.controller';
import { validateUrl } from '../middleware/validateUrl';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/create', authenticate, validateUrl, createUrl);
router.get('/my-urls', authenticate, getUserUrls);
router.get('/r/:shortId', redirectToOriginal);
router.delete('/:id', authenticate, deleteUrl);

export default router;