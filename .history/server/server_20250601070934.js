require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const employeeRoutes = require('./routes/employees');
const syncRoutes = require('./routes/sync');

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
app.use('/api/sync', syncRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 