import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Middleware
const expressApp = express();
expressApp.use(cors());
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
expressApp.use(express.static(path.join(__dirname, 'public')));

// Routes
import inventoryRoutes from './routes/inventory.js';
import salesRoutes from './routes/sales.js';
import employeesRoutes from './routes/employees.js';
import timesheetsRoutes from './routes/timesheets.js';
import syncRoutes from './routes/sync.js';

expressApp.use('/api/inventory', inventoryRoutes);
expressApp.use('/api/sales', salesRoutes);
expressApp.use('/api/employees', employeesRoutes);
expressApp.use('/api/timesheets', timesheetsRoutes);
expressApp.use('/api/sync', syncRoutes);

// Serve admin interface
expressApp.get('/admin', (req, res) => {
    res.redirect('/admin/login.html');
});

// Health check endpoint
expressApp.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
expressApp.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

app.prepare().then(() => {
  createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    // Handle service worker and manifest specifically
    if (pathname === '/sw.js' || pathname === '/manifest.json') {
      const filePath = path.join(__dirname, pathname);
      console.log('Attempting to serve:', filePath);
      
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        res.setHeader('Content-Type', pathname.endsWith('.js') ? 'application/javascript' : 'application/json');
        res.setHeader('Service-Worker-Allowed', '/');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.write(content);
        res.end();
        return;
      } catch (error) {
        console.error('Error serving file:', error);
        res.statusCode = 404;
        res.end('File not found');
        return;
      }
    }

    // Handle all other requests
    try {
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  }).listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
  });
}); 