import { sendEmail } from "./email.utils";
import { generateOtp } from "./otp.utils";
/**
 * Send OTP for email verification
 */
export const sendVerificationOtp = async (user: any) => {
    const otp = generateOtp();
    console.log("otp",otp);
    
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
    await sendEmail({
        to: user.email,
        subject: "Verify Your Email Address",
        text: `Your verification code is: ${otp}. It will expire in 2 minutes.`,
        html: `<p>Your verification code is: <b>${otp}</b></p><p>It will expire in 2 minutes.</p>`,
    });
    await user.save();
    return otp;
};