// Google Sheets Configuration
export const GOOGLE_SHEETS_CONFIG = {
  CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  API_KEY: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY || '',
  SHEET_ID: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '',
  RANGE: 'Sheet1!A2:H',
  SCOPES: ['https://www.googleapis.com/auth/spreadsheets'],
  EMPLOYEE_RANGE: 'Employee!A2:F'
};

// Other configurations can be added here
export const APP_CONFIG = {
  EMAIL_RECIPIENT: 'creesler@gmail.com'
}; 