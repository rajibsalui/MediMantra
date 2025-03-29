import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    // Load environment variables
    // dotenv.config();
    // Check if MONGO_URL is defined
    // if (!process.env.MONGO_URL) {
    //   throw new Error('MONGO_URL is not defined in environment variables');
    // }
    // Log MONGO_URL for debugging purposes
    // Note: Be cautious about logging sensitive information in production
    // console.log("MONGO_URL:", process.env.MONGO_URL);
    // Log MONGO_URL for debugging purposes
    // Note: Be cautious about logging sensitive information in production
    // console.log("MONGO_URL:", process.env.MONGO_URL);
    // Log MONGO_URL for debugging purposes
    const MONGO_URL = "mongodb+srv://sreejits501:1234RaJa@cluster4.3yl8hdd.mongodb.net/?retryWrites=true&w=majority&appName=Medibot";
    console.log("MONGO_URL:", MONGO_URL); 
    console.log("MONGO_URL:", process.env.MONGO_URL);

    const conn = await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
