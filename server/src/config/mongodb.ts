import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGO_URI not defined in environment variables");
        }
        await mongoose.connect(uri);
        console.log('MongoDB connected');
    } catch (error) {
        console.log('error',error);
        process.exit(1);
    }
}

export default connectDB;