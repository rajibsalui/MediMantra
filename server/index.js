// Load environment variables
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/dbconnect.js';


// Import routes
import authRoutes from './routes/auth.route.js';
import patientRoutes from './routes/patient.route.js';
import doctorRoutes from './routes/doctor.route.js';


// Initialize Express app
const app = express();
dotenv.config()
// Middleware
app.use(express.json());
app.use(cors());

// Connect to database
connectDB();

// Basic route
app.get('/', (req, res) => {
  res.send('MediMantra API is running');
});
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
