import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { changePassword, deleteAccount, editProfile, getProfile } from "../controllers/user.controller";
import { maintenanceMiddleware } from "../middleware/maintenance";


const router = Router();
router.use(authenticate);
router.use(maintenanceMiddleware);

router.get('/me', getProfile);
router.put('/edit', editProfile);
router.put('/change-password', changePassword);
router.delete('/delete', deleteAccount);


export default router;