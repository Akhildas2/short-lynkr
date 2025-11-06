import User from "../models/user.model";
import { hashPassword } from "./password";

/**
 * Create a new user instance
 */
export const createUser = async (
    username: string,
    email: string,
    password?: string,
    requireEmailVerification: boolean = false,
    moderateNewUsers: boolean = false
) => {
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const user = new User({
        username,
        email,
        password: hashedPassword,
        isEmailVerified: !requireEmailVerification,
        isActive: !moderateNewUsers,
    });
    return user;
};