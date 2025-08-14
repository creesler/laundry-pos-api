// App Configuration
export const APP_CONFIG = {
  EMAIL_RECIPIENT: process.env.NEXT_PUBLIC_EMAIL_RECIPIENT || 'default@example.com',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'
}; 