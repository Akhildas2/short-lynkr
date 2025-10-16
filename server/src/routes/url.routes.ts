import express from 'express';
import { createUrl, deleteUrl, getUrlById, getUserUrls, redirectToOriginal, updateUrl } from '../controllers/url.controller';
import { validateUrl } from '../middleware/validateUrl';
import { authenticate } from '../middleware/auth';
import { getQrCode } from '../controllers/qrCode.controller';

const router = express.Router();

router.post('/create', authenticate, validateUrl, createUrl);
router.get('/my-urls', authenticate, getUserUrls);
router.get('/:id', authenticate, getUrlById);
router.patch('/update/:id', authenticate, updateUrl);
router.delete('/:id', authenticate, deleteUrl);

router.get('/qr/:id', authenticate, getQrCode);

// Public redirect route
export const redirectRouter = express.Router();
redirectRouter.get('/r/:shortId', redirectToOriginal);

export default router;