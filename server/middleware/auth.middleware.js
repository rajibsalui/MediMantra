import jwt from 'jsonwebtoken';
import Patient from '../models/patient.model.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from cookie or authorization header
    let token;
    
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id from decoded token
    const currentUser = await Patient.findById(decoded.id).select('-password');
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is active
    if (!currentUser.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }
    
    // Add user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false, 
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};