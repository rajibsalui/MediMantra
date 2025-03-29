import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectDB = async () => {
    try {
        // Check if MONGO_URI is set
        if (!process.env.MONGODB_URL) {
            console.error('MONGO_URI environment variable is missing',{
                useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            });
            process.exit(1);
        }

        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log(`MongoDB Connected Successfully`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB 