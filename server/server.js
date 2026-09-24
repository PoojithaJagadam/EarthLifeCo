import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import express from 'express';
import cors from 'cors';
import { handleEcwidApi } from './ecwid.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ecwid API Proxy
app.use('/api/ecwid', async (req, res, next) => {
  const handled = await handleEcwidApi(req, res);
  if (!handled) next();
});

// Basic rate limiting mechanism (in-memory for simplicity in Phase 1)
const requestLogs = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  if (!requestLogs.has(ip)) {
    requestLogs.set(ip, []);
  }
  
  const timestamps = requestLogs.get(ip);
  const recentRequests = timestamps.filter(time => now - time < RATE_LIMIT_WINDOW_MS);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ error: 'Too many requests, please try again later.' });
  }
  
  recentRequests.push(now);
  requestLogs.set(ip, recentRequests);
  next();
};

app.post('/api/cancellation-request', rateLimiter, async (req, res) => {
  const { orderId, customerEmail, customerName, reason } = req.body;

  if (!orderId || !customerEmail || !customerName || !reason) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // In a real implementation, you would configure a real SMTP transport.
    // For now, we simulate success for the frontend.
    console.log('Cancellation Request Received:');
    console.log(`Order ID: ${orderId}`);
    console.log(`Customer: ${customerName} (${customerEmail})`);
    console.log(`Reason: ${reason}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.status(200).json({ 
      success: true, 
      message: 'Cancellation request submitted successfully. Our support team will review this in Ecwid and contact you.' 
    });
  } catch (error) {
    console.error('Error processing cancellation request:', error);
    res.status(500).json({ error: 'Failed to process request.' });
  }
});

app.listen(PORT, () => {
  console.log(`EarthLife Co. Backend running on port ${PORT}`);
});
