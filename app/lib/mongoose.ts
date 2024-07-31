import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

let isConnected = false;

export const connectToDB = async () => {
    mongoose.set('strictQuery', true);

    if (!process.env.MONGODB_URL) {
        console.log("MONGODB_URL not found");
        return;
    }
    if (isConnected) {
        console.log("Already connected to MONGODB");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URL);
        isConnected = true;
        console.log("Connected to MONGODB");
    } catch (error) {
        console.log("Error connecting to MONGODB:", error);
    }
};
