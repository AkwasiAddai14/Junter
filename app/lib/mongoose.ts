import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Freelancer from './models/freelancer.model';
import Shift from './models/shift.model';
import Factuur from './models/factuur.model';
import ShiftArray from './models/shiftArray.model';
import Flexpool from './models/flexpool.model';
import Bedrijf from './models/bedrijf.model';


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
        await Bedrijf.init();
        await Shift.init();
        await ShiftArray.init();
        await Freelancer.init();
        await Flexpool.init();
        await Factuur.init();
    } catch (error) {
        console.log("Error connecting to MONGODB:", error);
    }
};
