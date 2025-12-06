import express from 'express';
import { createUrl, deleteUrl, getUrlById, getUserUrls, redirectToOriginal, toggleBlockUrl, updateUrl } from '../controllers/url.controller';
import { validateUrl } from '../middleware/validateUrl';
import { authenticate } from '../middleware/auth';
import { getQrCode } from '../controllers/qrCode.controller';
import { blockMaliciousUrlMiddleware } from '../middleware/blockMaliciousUrl';
import { maintenanceMiddleware } from '../middleware/maintenance';

const router = express.Router();
router.use(authenticate);
router.use(maintenanceMiddleware);

router.post('/create', blockMaliciousUrlMiddleware, validateUrl, createUrl);
router.get('/my-urls', getUserUrls);
router.get('/:id', getUrlById);
router.patch('/update/:id', updateUrl);
router.delete('/:id', deleteUrl);
router.patch('/:id/block', authenticate, toggleBlockUrl);
router.get('/qr/:id', authenticate, maintenanceMiddleware, getQrCode);

// Public redirect route
export const redirectRouter = express.Router();
redirectRouter.get('/r/:shortId', redirectToOriginal);

export default router;