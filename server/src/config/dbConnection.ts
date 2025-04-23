import mongoose from 'mongoose';


const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            throw new Error('Mongo URI is not defined in environment variables.');
        }
        const connect = await mongoose.connect(mongoURI);
        console.log(`MongoDB Connected: ${connect.connection.host}`);

    } catch (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
}


export default connectDB;