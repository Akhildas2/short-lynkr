import bcrypt from 'bcryptjs'
/**
 * Hashes a plain text password using bcrypt.
 */
export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10)
}

/**
 * Compares a plain text password with a hashed password.
 */
export const comparePassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
};