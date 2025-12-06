import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGO_URI not defined in environment variables");
        }

        await mongoose.connect(uri);
        // Optional: Add connection events
        mongoose.connection.on('connected', () => console.log('MongoDB connection established'));
        mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));
        mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));

    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
}

export default connectDB;