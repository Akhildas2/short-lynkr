import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { AuthRequest, UserPayload } from "../types/auth";


export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Access denied. No token provided.' });
            return
        }
        
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