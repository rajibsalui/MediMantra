/**
 * Middleware for checking if user has required role
 * @param {Array} roles - Array of allowed roles
 * @returns {Function} Middleware function
 */
export const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role ${req.user.role} not authorized to access this resource`
      });
    }
    
    next();
  };
};
