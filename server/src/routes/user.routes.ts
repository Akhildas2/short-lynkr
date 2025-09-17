import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { changePassword, deleteAccount, editProfile, getProfile } from "../controllers/user.controller";


const router = Router();

router.get('/me', authenticate, getProfile);
router.put('/edit', authenticate, editProfile);
router.put('/change-password', authenticate, changePassword);
router.delete('/delete', authenticate, deleteAccount);


export default router;