/**
 * Generates a 6-digit numeric OTP
 * @returns {string} A 6-digit OTP string
 */
export const generateOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};