import 'dotenv/config';
import http from 'http';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import { handleEcwidApi } from './server/ecwid.js';
import { handleHelpfulCrowdApi } from './server/helpfulcrowd.js';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  
  // Create Vite server in middleware mode with HMR attached to the HTTP server
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: {
        server
      }
    },
    appType: 'spa'
  });

  // Use vite's connect instance as middleware
  app.use(cors());
  app.use(express.json());

  // Diagnostic logger for all /api requests
  app.use('/api', (req, res, next) => {
    console.log(`[API DEBUG] METHOD: ${req.method}`);
    console.log(`[API DEBUG] URL: ${req.url}`);
    console.log(`[API DEBUG] ORIGINAL URL: ${req.originalUrl}`);
    console.log(`[API DEBUG] PATH: ${req.path}`);
    next();
  });

  // Ecwid API Proxy
  app.use('/api/ecwid', async (req, res) => {
    try {
      const handled = await handleEcwidApi(req, res);
      if (!handled && !res.headersSent) {
        console.log(`[API DEBUG] STATUS: 404`);
        console.log(`[API DEBUG] CONTENT-TYPE: application/json`);
        res.status(404).json({ error: 'Ecwid route not found', path: req.originalUrl });
      }
    } catch (err) {
      console.error('API proxy error:', err);
      if (!res.headersSent) {
        console.log(`[API DEBUG] STATUS: 500`);
        console.log(`[API DEBUG] CONTENT-TYPE: application/json`);
        res.status(500).json({ error: 'Internal API error' });
      }
    }
  });

  // HelpfulCrowd API Proxy
  app.use('/api/helpfulcrowd', async (req, res) => {
    try {
      const handled = await handleHelpfulCrowdApi(req, res);
      if (!handled && !res.headersSent) {
        res.status(404).json({ error: 'HelpfulCrowd route not found', path: req.originalUrl });
      }
    } catch (err) {
      console.error('HelpfulCrowd proxy error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal API error' });
      }
    }
  });

  // Basic rate limiting mechanism (in-memory for simplicity in Phase 1)
  const requestLogs = new Map();
  const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
  const MAX_REQUESTS_PER_WINDOW = 3;
  
  const rateLimiter = (req: any, res: any, next: any) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (!requestLogs.has(ip)) {
      requestLogs.set(ip, []);
    }
    
    const timestamps = requestLogs.get(ip);
    const recentRequests = timestamps.filter((time: number) => now - time < RATE_LIMIT_WINDOW_MS);
    
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

  // Guard any unhandled /api routes so they NEVER fall through to vite.middlewares (which returns HTML)
  app.use('/api', (req, res) => {
    console.log(`[API DEBUG] STATUS: 404`);
    console.log(`[API DEBUG] CONTENT-TYPE: application/json`);
    res.status(404).json({ error: 'API route not found', path: req.originalUrl });
  });

  app.use(vite.middlewares);

  server.listen(3000, '0.0.0.0', () => {
    console.log('EarthLife Co. Backend running on port 3000');
  });
}

startServer();
