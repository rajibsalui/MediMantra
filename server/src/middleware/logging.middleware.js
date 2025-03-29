export const requestLogger = (req, res, next) => {
  // Create timestamp
  const timestamp = new Date().toISOString();

  // Log request details
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  
  // For debugging purposes in development environment
  if (process.env.NODE_ENV === 'development') {
    if (req.body && Object.keys(req.body).length > 0) {
      // Sanitize sensitive data before logging
      const sanitizedBody = { ...req.body };
      
      // Remove sensitive fields
      if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
      if (sanitizedBody.creditCard) sanitizedBody.creditCard = '[REDACTED]';
      
      console.log('Request Body:', JSON.stringify(sanitizedBody, null, 2));
    }
  }

  // Continue with the next middleware
  next();
};

export const responseLogger = (req, res, next) => {
  // Store the original end method
  const originalEnd = res.end;
  
  // Override the end method
  res.end = function(chunk, encoding) {
    // Call the original end method
    originalEnd.call(this, chunk, encoding);
    
    // Log response status and time
    const responseTime = Date.now() - req.startTime;
    console.log(`Response: ${res.statusCode} - ${responseTime}ms`);
  };
  
  // Set start time
  req.startTime = Date.now();
  
  // Continue with the next middleware
  next();
};