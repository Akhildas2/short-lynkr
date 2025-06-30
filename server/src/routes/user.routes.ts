import { Router } from "express";
import { login, register } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { changePassword, deleteAccount, editProfile, getProfile } from "../controllers/user.controller";


const router = Router();

router.get('/me', authenticate, getProfile);
router.get('/edit', authenticate, editProfile);
router.get('/change-password', authenticate, changePassword);
router.get('/delete', authenticate, deleteAccount);


export default router;