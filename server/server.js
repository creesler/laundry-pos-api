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

// API routes with /api prefix
app.use('/api/employees', employeeRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sync', syncRoutes);

// Debug logging
console.log('Server environment:', {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  PWD: process.env.PWD,
  cwd: process.cwd(),
  __dirname,
  publicPath: path.join(__dirname, '../public'),
  adminPath: path.join(__dirname, '../public/admin')
});

// List directory contents
try {
  console.log('Files in current directory:', fs.readdirSync(__dirname));
  console.log('Files in public directory:', fs.readdirSync(path.join(__dirname, '../public')));
  console.log('Files in admin directory:', fs.readdirSync(path.join(__dirname, '../public/admin')));
} catch (error) {
  console.error('Error listing files:', error);
}

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve admin dashboard files
app.use('/admin', express.static(path.join(__dirname, '../public/admin')));

// Redirect root to admin dashboard
app.get('/', (req, res) => {
  res.redirect('/admin');
});

// Serve admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/index.html'));
});

// Log all requests with detailed path info
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    url: req.url,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl,
    headers: req.headers,
    query: req.query,
    body: req.body
  });
  next();
});

// 404 handler
app.use((req, res, next) => {
  console.log('404 Not Found:', {
    method: req.method,
    path: req.path,
    url: req.url,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl,
    headers: req.headers
  });
  res.status(404).send('Not Found');
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