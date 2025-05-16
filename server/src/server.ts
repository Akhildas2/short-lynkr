import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/mongodb";
import urlRoutes, { redirectRouter } from './routes/url.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from "./middleware/errorHandler";


const app = express();

// Middleware for handling CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Route handling
app.use('/api/url', urlRoutes);
app.use('/api/users', userRoutes);
app.use('/', redirectRouter);

// Error handling middleware should be the last middleware
app.use(errorHandler);

const PORT: number = parseInt(process.env.PORT || "3000", 10);

// Connect to the database and start the server
connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});