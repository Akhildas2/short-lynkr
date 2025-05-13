import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { AuthRequest, UserPayload } from "../types/auth";


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

        req.user = decoded;
        next()

    } catch (error) {
        next(error)
    }
}