// Create a global namespace for our app
window.LaundryAdmin = window.LaundryAdmin || {};

// API URL constant - automatically detect environment
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://laundry-pos-api.vercel.app/api';

// Debug log to check initialization
console.log('🚀 Initializing LaundryAdmin with API_URL:', API_URL);

// ... (rest of the app.js code) ...
