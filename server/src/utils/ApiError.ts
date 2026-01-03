export class ApiError extends Error {
    statusCode: number;/** HTTP status code

    
    /**
     * Creates an instance of ApiError.
     */
    constructor(message: string, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;

        // Captures stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}
