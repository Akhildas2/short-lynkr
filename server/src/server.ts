import express from 'express';
import dotenv from 'dotenv';
import  connectDB  from './config/dbConnection';

dotenv.config();
connectDB();
const app = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})