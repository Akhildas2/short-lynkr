import { Router } from "express";
import { forgotPassword, googleAuth, login, otpRemainingTime, register, resendOtp, resetPassword, verifyEmail } from "../controllers/auth.controller";

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google-auth', googleAuth);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOtp);
router.get('/otp-remaining-time', otpRemainingTime);

export default router;