import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support parsing larger datasets
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Mount API endpoints
app.use('/api', apiRouter);

// Root/Health route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Excel Analytics Platform Backend is running.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'An internal server error occurred.'
  });
});

// Initialize database connection & listen
async function startServer() {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 API Server Running at: http://localhost:${PORT}`);
    console.log(`==================================================`);
  });
}

// Export the Express app for Vercel serverless functions
export default app;

if (!process.env.VERCEL) {
  startServer();
} else {
  // Trigger database handshake on Vercel function load
  connectDB().catch(err => console.error('[DATABASE] Handshake failed on Vercel:', err));
}

