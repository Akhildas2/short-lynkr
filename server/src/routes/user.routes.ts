import { Router } from "express";
import { getProfile, login, register } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth";


const router = Router();

router.post('/register',register);
router.post('/login',login)
router.get('/me',authenticate,getProfile)


export default router;