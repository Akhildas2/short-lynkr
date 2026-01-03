import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
/**
 * ============================
 * REQUEST & RESPONSE METRICS
 * ============================
 */

/** ----------------------------
 * Global counters
 * ----------------------------
 */

let totalRequests = 0;
let totalErrors = 0;
let totalResponseTime = 0;
let requestCount = 0;

/**
 * Request Counter Middleware
 * --------------------------------
 */
export function requestCounter(req: Request, res: Response, next: NextFunction) {
    totalRequests++;

    // Track errors after response finishes
    res.on("finish", () => {
        if (res.statusCode >= 400) {
            totalErrors++;
        }
    });

    next();
}


/**
 * Get current error rate (%)
 * --------------------------------
 */
export function getErrorRate() {
    return totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
}


/**
 * Response Time Tracker Middleware
 */
export function responseTimeTracker(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        totalResponseTime += duration;
        requestCount++;
    });
    next();
}


/**
 * Get average response time (ms)
 */
export function getAverageResponseTime() {
    return requestCount > 0 ? totalResponseTime / requestCount : 0;
}


/**
 * Get MongoDB storage usage
 */
export async function getDbStorageUsed() {
    const db = mongoose.connection.db; // native MongoDB Db instance
    if (!db) throw new Error("Database not connected");

    const stats = await db.command({ dbStats: 1 });
    return stats.storageSize; // in bytes
}