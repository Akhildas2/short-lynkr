import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";

import connectDB from "./config/mongodb";
import urlRoutes from './routes/url.routes';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import socialQrRoutes from './routes/socialQr.routes';
import adminRoutes from './routes/admin.routes';
import contactRoutes from './routes/contact.routes';
import notificationRoutes from './routes/notification.routes';
import healthRoutes from './routes/health.routes';
import redirectRouter from './routes/redirect.routes';

import { errorHandler } from "./middleware/errorHandler";
import { apiAccessMiddleware } from "./middleware/api-access";
import { startMaintenanceStatusBroadcast } from "./services/maintenance.service";
import { setSocketIO } from "./utils/socket.utils";

// ------------------------------------------------
// Express app & HTTP server
// ------------------------------------------------
const app = express();
const httpServer = createServer(app);

// ------------------------------------------------
// Middleware
// ------------------------------------------------
app.use(cors());
app.use(express.json());
app.set("trust proxy", true);
app.use(apiAccessMiddleware);

// ------------------------------------------------
// Socket.IO setup
// ------------------------------------------------
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Make io globally available to services
setSocketIO(io);

// ------------------------------------------------
// Socket.IO events
// ------------------------------------------------
io.on("connection", (socket) => {
    /**
     * Client should emit:
     * socket.emit("join", { userId, role })
     */
    socket.on("join", ({ userId, role }) => {
        if (role === "admin") {
            socket.join("admins");
            console.log(`👑 Admin joined room: admins`);
        }

        if (role === 'user') {
            socket.join(`user:${userId}`);
            console.log(`👤 User joined room: user:${userId}`);
        }
    });

    socket.on("disconnect", () => {
        console.log(`🔴 Socket disconnected: ${socket.id}`);
    });
});

// ------------------------------------------------
// Start maintenance status broadcast (your service)
// ------------------------------------------------
startMaintenanceStatusBroadcast(io);

// ------------------------------------------------
// Routes
// ------------------------------------------------
app.use('/api', healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/url", urlRoutes);
app.use("/api/user", userRoutes);
app.use("/api/social-qr", socialQrRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/", redirectRouter);

// ------------------------------------------------
// Error handler
// ------------------------------------------------
app.use(errorHandler);

// ------------------------------------------------
// Start server
// ------------------------------------------------
const PORT = parseInt(process.env.PORT || "3000", 10);

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running with WebSocket on port ${PORT}`);
    });
});