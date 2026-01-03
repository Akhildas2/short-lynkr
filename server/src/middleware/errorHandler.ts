import { Request, Response, NextFunction } from 'express';
/**
 * ============================
 * GLOBAL ERROR HANDLER
 * ============================
 */
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Log detailed error stack for internal debugging
    console.error(err.stack);

    // Default to 500 Internal Server Error if not specified
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Send structured error response to client
    res.status(statusCode).json({
        message,
        status: statusCode,
    });
};