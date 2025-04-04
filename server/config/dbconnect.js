import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const connectDB = async () => {
  try {
    console.log(chalk.blue('📊 Connecting to MongoDB...'));
    
    const mongoURI = process.env.MONGODB_URL;
    
    if (!mongoURI) {
      throw new Error('MongoDB connection string missing in environment variables');
    }
    
    const options = {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };
    
    const conn = await mongoose.connect(mongoURI, options);
    
    const isDev = process.env.NODE_ENV === 'development';
    
    console.log(chalk.green('✅ MongoDB Connected:'), 
      isDev ? chalk.cyan(`${conn.connection.host}`) : chalk.cyan('Successfully connected to database')
    );
    
    return conn;
  } catch (error) {
    console.log(chalk.bgRed.white(' DATABASE ERROR '));
    console.error(chalk.red(`❌ MongoDB Connection Failed: ${error.message}`));
    
    if (process.env.NODE_ENV === 'production') {
      console.log(chalk.yellow('⚠️  Shutting down server due to database connection failure'));
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
