import { verifyToken, extractTokenFromHeader } from '../config/jwt.utils.js';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token provided' 
      });
    }

    const decoded = verifyToken(token);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: error.message 
    });
  }
};