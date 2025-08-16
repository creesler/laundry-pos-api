// Google Sheets Configuration
export const GOOGLE_SHEETS_CONFIG = {
  CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  API_KEY: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY || '',
  SHEET_ID: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '',
  RANGE: 'Sheet1!A2:H',
  SCOPES: ['https://www.googleapis.com/auth/spreadsheets'],
  EMPLOYEE_RANGE: 'Employee!A2:F'
};

// API Configuration
export const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://laundry-pos-api.vercel.app';

// Other configurations
export const APP_NAME = 'Laundry POS';
export const VERSION = '1.0.0';

// Other configurations can be added here
export const APP_CONFIG = {
  EMAIL_RECIPIENT: 'creesler@gmail.com'
}; 