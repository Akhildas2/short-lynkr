import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import connectDB from "./config/mongodb";
import urlRoutes, { redirectRouter } from './routes/url.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from "./middleware/errorHandler";
import { startCleanupJob } from "./cron-jobs/cleanup";

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            io?: Server;
        }
    }
}

const app = express();
const httpServer = createServer(app);

// Middleware for handling CORS and JSON parsing
app.use(cors());
app.use(express.json());

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Attach io to req 
app.use((req, res, next) => {
    req.io = io;
    if (!io) {
        console.error("Socket.io instance not found on request.");
    }

    next();
});

app.set('trust proxy', true)
// Route handling
app.use('/api/url', urlRoutes);
app.use('/api/users', userRoutes);
app.use('/', redirectRouter);

// Error handling middleware
app.use(errorHandler);

// Socket.IO
io.on("connection", (socket) => {
    console.log(`🟢 Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`🔴 Client disconnected: ${socket.id}`);
    });

});

const PORT: number = parseInt(process.env.PORT || "3000", 10);

// Connect to the database and start the server
connectDB().then(() => {
    startCleanupJob();
    httpServer.listen(PORT, () => console.log(`🚀 Server running with WebSocket on port ${PORT}`));
});