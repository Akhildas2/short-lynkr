import jwt from 'jsonwebtoken';

/**
 * Generate JWT token
 */
export const generateToken = (user: any) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
    );
};