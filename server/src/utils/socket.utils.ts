import { Server } from "socket.io";

let io: Server | null = null;

export const setSocketIO = (server: Server) => {
    io = server;
};

export const getSocketIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
};