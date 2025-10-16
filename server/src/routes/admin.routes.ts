import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as AdminController from '../controllers/admin.controller';
import * as SettingsController from "../controllers/settings.controller";
const router = Router();

// ===== User Management =====
router.get('/users', authenticate, AdminController.listUser);
router.post('/users', authenticate, AdminController.addUser);
router.put('/users/:id', authenticate, AdminController.updateUser);
router.patch('/users/:id/block', authenticate, AdminController.blockUser);
router.delete('/users/:id', authenticate, AdminController.deleteUser);

// ===== URL Management =====
router.get('/urls', authenticate, AdminController.listUrls);
router.patch('/urls/:id/block', authenticate, AdminController.blockUrl);
router.delete('/urls/:id', authenticate, AdminController.deleteUrl);

// ===== Analytics =====
router.get('/analytics', authenticate, AdminController.getAdminAnalytics);

// ===== Dashboard Analytics =====
router.get('/dashboard', authenticate, AdminController.getAdminDashboard);

// ===== Settings routes =====
router.get('/settings', SettingsController.getSettings);
router.patch('/settings', SettingsController.updateSettings);
router.post('/settings/reset', SettingsController.resetSettings);

export default router;