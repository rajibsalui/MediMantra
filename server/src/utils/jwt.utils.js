import jwt from 'jsonwebtoken';

/**
 * Generate JWT token with user data
 * @param {string} userId - User ID to encode in token
 * @param {Object} additionalData - Additional data to include in token
 * @returns {string} JWT token
 */
export const generateToken = (userId, additionalData = {}) => {
  try {
    if (!userId) {
      throw new Error('User ID is required to generate token');
    }

    const payload = {
      id: userId,
      ...additionalData,
      iat: Date.now(),
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '24h',
      algorithm: 'HS256', // Specify the algorithm explicitly
    });
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    if (!token) {
      throw new Error('Token is required');
    }

    // Remove 'Bearer ' if present
    const tokenString = token.startsWith('Bearer ') 
      ? token.slice(7) 
      : token;

    return jwt.verify(tokenString, process.env.JWT_SECRET, {
      algorithms: ['HS256'], // Only allow HS256 algorithm
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

/**
 * Extract token from request headers
 * @param {Object} req - Express request object
 * @returns {string|null} Extracted token or null
 */
export const extractTokenFromHeader = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) return null;

    return token;
  } catch (error) {
    console.error('Token extraction error:', error);
    return null;
  }
};

/**
 * Refresh JWT token
 * @param {string} token - Current valid token
 * @returns {string} New JWT token
 */
export const refreshToken = async (token) => {
  try {
    const decoded = verifyToken(token);
    
    // Don't refresh if token is not close to expiration
    const expirationThreshold = 24 * 60 * 60 * 1000; // 24 hours
    if (decoded.exp - Date.now() > expirationThreshold) {
      throw new Error('Token is not eligible for refresh');
    }

    // Generate new token with same user ID
    return generateToken(decoded.id, {
      refreshed: true,
      previousExp: decoded.exp
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    throw new Error('Failed to refresh token');
  }
};

/**
 * Decode token without verification
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};