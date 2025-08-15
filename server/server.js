import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv
dotenv.config({ path: path.join(__dirname, '.env') });

// Import routes
import employeeRoutes from './routes/employees.js';
import salesRoutes from './routes/sales.js';
import timesheetRoutes from './routes/timesheets.js';
import inventoryRoutes from './routes/inventory.js';
import syncRoutes from './routes/sync.js';

const app = express();

// Connect to Database
connectDB();

// Enable CORS
app.use(cors({
  origin: 'https://laundry-pos-frontend.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parse URL-encoded bodies

// API routes
app.use('/api/employees', employeeRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sync', syncRoutes);

// Root route for health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running' });
});

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    headers: req.headers,
    query: req.query,
    body: req.body
  });
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    query: req.query,
    body: req.body,
    error: err.message,
    stack: err.stack
  });
  
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Export the Express app for Vercel
export default app; 