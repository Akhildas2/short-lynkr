import express from 'express';
import { authenticate } from '../middleware/auth';
import { maintenanceMiddleware } from '../middleware/maintenance';
import { createSocialQr, deleteSocialQr, getAllSocialQr, getSocialQrById, updateSocialQr } from '../controllers/qrCode.controller';

const router = express.Router();
router.use(authenticate);
router.use(maintenanceMiddleware);

router.post("/create", createSocialQr);
router.get("/my-qr", getAllSocialQr);
router.get("/:id", getSocialQrById);
router.put("/update/:id", updateSocialQr);
router.delete("/:id", deleteSocialQr);

export default router;