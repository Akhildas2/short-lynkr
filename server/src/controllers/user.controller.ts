import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import { comparePassword, hashPassword } from '../utils/password';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'Email already registered' });
            return
        }

        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        const token = jwt.sign({ id: user._id, email: email }, process.env.JWT_SECRET!, { expiresIn: '1d' });
        res.status(201).json({ user: { id: user._id, email: user.email }, token });

    } catch (error) {
        next(error);
    }
}


export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email })
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return
        }

        const isMatch = await comparePassword(password, user.password)
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        );
        res.status(200).json({ user: { id: user._id, email: user.email }, token });

    } catch (error) {
        next(error);
    }
}