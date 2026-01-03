import mongoose from 'mongoose';

/**
 * Connects to MongoDB using Mongoose
 * Includes connection events, error handling, and optional reconnection logic
 */
const connectDB = async () => {
    try {
        // Retrieve MongoDB URI from environment variables
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGO_URI not defined in environment variables");
        }

        // Connect to MongoDB
        await mongoose.connect(uri);

        // Connection established
        mongoose.connection.on('connected', () => {
            console.log('[MongoDB] Connection established successfully');
        });

        // Connection error handling
        mongoose.connection.on('error', (err) => {
            console.error('[MongoDB] Connection error:', err);
        });

        // Connection disconnected
        mongoose.connection.on('disconnected', () => {
            console.warn('[MongoDB] Connection disconnected. Attempting to reconnect...');
        });


    } catch (error) {
        console.error('[MongoDB] Connection failed:', error);
        process.exit(1);// Exit the process if DB connection fails
    }
}

export default connectDB;