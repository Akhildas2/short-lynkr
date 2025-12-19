import express from 'express';
import { maintenanceMiddleware } from '../middleware/maintenance';
import { sendMessage, getMessages, readMessage, deleteMessage, changeMessageStatus, } from '../controllers/contact.controller';

const router = express.Router();

router.use(maintenanceMiddleware);

router.get('/', getMessages);
router.post('/', sendMessage);
router.patch('/:id/read', readMessage);
router.patch('/:id/status', changeMessageStatus);
router.delete('/:id', deleteMessage);

export default router;
