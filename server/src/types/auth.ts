import { Request } from "express";

export interface UserPayload {
    _id: string;
    username: string;
    email: string;
    role: string;
}

export interface AuthRequest extends Request {
    user?: UserPayload;
}