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

// Middleware
// Enable CORS with both middleware and custom headers
app.use(cors({
  origin: '*',  // Allow all origins for now
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

// Add custom headers as backup
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  next();
});

app.use(express.json({ limit: '50mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parse URL-encoded bodies

// API routes - remove /api prefix since we're an API-only server
app.use('/employees', employeeRoutes);
app.use('/sales', salesRoutes);
app.use('/timesheets', timesheetRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/sync', syncRoutes);

// Debug logging
console.log('Server starting...');
console.log('Current directory:', __dirname);
console.log('Public path:', path.join(__dirname, '../public'));
console.log('Admin path:', path.join(__dirname, '../public/admin'));

// Check if admin files exist
import fs from 'fs';
const adminPath = path.join(__dirname, '../public/admin');
const adminFiles = fs.readdirSync(adminPath);
console.log('Admin files:', adminFiles);

// Explicit routes for admin files
app.get('/admin/login.html', (req, res) => {
  console.log('Serving login.html');
  const filePath = path.join(__dirname, '../public/admin/login.html');
  console.log('File path:', filePath);
  // Check if file exists
  if (fs.existsSync(filePath)) {
    console.log('File exists, sending...');
    res.sendFile(filePath);
  } else {
    console.log('File not found!');
    res.status(404).send('Login page not found');
  }
});

app.get('/admin/index.html', (req, res) => {
  console.log('Serving index.html');
  const filePath = path.join(__dirname, '../public/admin/index.html');
  console.log('File path:', filePath);
  // Check if file exists
  if (fs.existsSync(filePath)) {
    console.log('File exists, sending...');
    res.sendFile(filePath);
  } else {
    console.log('File not found!');
    res.status(404).send('Dashboard not found');
  }
});

app.get('/admin/app.js', (req, res) => {
  console.log('Serving app.js');
  const filePath = path.join(__dirname, '../public/admin/app.js');
  console.log('File path:', filePath);
  // Check if file exists
  if (fs.existsSync(filePath)) {
    console.log('File exists, sending...');
    res.sendFile(filePath);
  } else {
    console.log('File not found!');
    res.status(404).send('App.js not found');
  }
});

app.get('/admin/styles.css', (req, res) => {
  console.log('Serving styles.css');
  const filePath = path.join(__dirname, '../public/admin/styles.css');
  console.log('File path:', filePath);
  // Check if file exists
  if (fs.existsSync(filePath)) {
    console.log('File exists, sending...');
    res.sendFile(filePath);
  } else {
    console.log('File not found!');
    res.status(404).send('Styles not found');
  }
});

// Redirect root and /admin to login
app.get(['/', '/admin'], (req, res) => {
  console.log('Redirecting to login page');
  res.redirect('/admin/login.html');
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

// Start the server if not being imported (for Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express app for Vercel
export default app; 