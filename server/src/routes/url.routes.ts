import express from 'express';
import { createUrl, deleteUrl, getUrlById, getUserUrls, redirectToOriginal } from '../controllers/url.controller';
import { validateUrl } from '../middleware/validateUrl';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/create', authenticate, validateUrl, createUrl);
router.get('/:id', authenticate, getUrlById);
router.get('/my-urls', authenticate, getUserUrls);
router.delete('/:id', authenticate, deleteUrl);

// Public redirect route
export const redirectRouter = express.Router();
redirectRouter.get('/r/:shortId', redirectToOriginal);

export default router;