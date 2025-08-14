const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const employeeRoutes = require('./routes/employees');
const salesRoutes = require('./routes/sales');
const timesheetRoutes = require('./routes/timesheets');
const inventoryRoutes = require('./routes/inventory');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors()); // Allows requests from your frontend
app.use(express.json()); // For parsing application/json

// Basic test route
app.get('/', (req, res) => {
  res.send('Laundry App Backend API is running!');
});

// Use routes
app.use('/api/employees', employeeRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/inventory', inventoryRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 