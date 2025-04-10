// Serverless function entry point for Vercel
import { createServer } from 'http';
import { parse } from 'url';

// This is a workaround for Vercel serverless functions
// We'll dynamically import the Express app to avoid issues with ESM imports
let app;

// Create a server instance
const server = createServer(async (req, res) => {
  try {
    // Dynamically import the Express app if not already imported
    if (!app) {
      const appModule = await import('../server/index.js');
      app = appModule.default;
    }

    // Pass the request to the Express app
    app.handle(req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

// Export the server as a serverless function
export default server;
