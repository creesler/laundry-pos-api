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
// Enable CORS for all routes
app.use(cors({
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parse URL-encoded bodies

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/employees', employeeRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sync', syncRoutes);

// Serve admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/index.html'));
});

// Serve Next.js frontend at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/app/page.tsx'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 