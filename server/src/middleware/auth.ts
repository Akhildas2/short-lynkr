import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { AuthRequest, UserPayload } from "../types/auth";
import User from "../models/user.model";

/**
 * ============================
 * AUTHENTICATION MIDDLEWARE
 * ============================
 */

/**
 * Authenticate incoming requests
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        // Validate Authorization header
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Access denied. No token provided." });
            return;
        }

        // Extract JWT token
        const token = authHeader.split(' ')[1];

        // Verify token signature and payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
        if (!decoded || !decoded.id) {
            res.status(401).json({ message: 'Invalid token payload.' });
            return;
        }

        // Check if user exists and retrieve block status
        const user = await User.findById(decoded.id).select('isBlocked');

        if (!user) {
            res.status(401).json({ message: 'User not found.' });
            return;
        }

        // BLOCK CHECK
        if (user.isBlocked) {
            res.status(403).json({
                message: 'Your account has been blocked by admin.'
            });
            return;
        }

        // Attach authenticated user payload to request
        req.user = decoded;
        next()
    } catch (error) {
        next(error)
    }
}