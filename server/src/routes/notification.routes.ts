import express from 'express';
import { authenticate } from '../middleware/auth';
import { maintenanceMiddleware } from '../middleware/maintenance';
import { createNotification, deleteNotification, getNotifications, toggleNotificationsRead , markAsRead } from '../controllers/notification.controller';

const router = express.Router();
router.use(authenticate);
router.use(maintenanceMiddleware);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.post('/', createNotification);
router.delete('/:id', deleteNotification);
router.post('/toggle-read', toggleNotificationsRead );

export default router;