import { Router } from 'express';
import { redirectToOriginal } from '../controllers/url.controller';

const router = Router();

router.get('/r/:shortId', redirectToOriginal);

export default router;