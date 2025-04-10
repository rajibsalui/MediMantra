// Simple health check endpoint for Vercel
export default function handler(req, res) {
  res.status(200).json({ status: 'healthy', message: 'API is running' });
}
