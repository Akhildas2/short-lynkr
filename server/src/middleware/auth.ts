import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { AuthRequest, UserPayload } from "../types/auth";
import User from "../models/user.model";


export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Access denied. No token provided." });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
        if (!decoded || !decoded.id) {
            res.status(401).json({ message: 'Invalid token payload.' });
            return;
        }

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

        req.user = decoded;
        next()

    } catch (error) {
        next(error)
    }
}