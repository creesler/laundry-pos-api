// App Configuration
export const APP_CONFIG = {
  COMPANY_NAME: 'Laundry POS',
  VERSION: '1.0.0',
  CURRENCY: 'PHP',
  DATE_FORMAT: 'yyyy-MM-dd',
  TIME_FORMAT: 'HH:mm:ss',
  TIMEZONE: 'Asia/Manila',
};

// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Other configurations
export const APP_NAME = 'Laundry POS';
export const VERSION = '1.0.0';

// Other configurations can be added here
export const APP_CONFIG_ADDITIONAL = {
  EMAIL_RECIPIENT: 'creesler@gmail.com'
}; 