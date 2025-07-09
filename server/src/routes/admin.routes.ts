import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as AdminController from '../controllers/admin.controller';
const router = Router();

// User management
router.get('/users', authenticate, AdminController.lsitUser);
router.post('/users', authenticate, AdminController.addUser);
router.post('/users/:id', authenticate, AdminController.updateUser);
router.post('/users/:id/block', authenticate, AdminController.blockUser);
router.post('/users/:id', authenticate, AdminController.deleteUser);

// URL management
router.get('/urls', AdminController.listUrls);
router.patch('/urls/:id/block', AdminController.blockUrl);
router.delete('/urls/:id', AdminController.deleteUrl);

export default router;