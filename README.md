# Laundry POS API

Backend API server for the Laundry POS system. This server handles inventory management, sales tracking, employee time tracking, and data synchronization.

## Features

- Inventory Management
- Sales Tracking
- Employee Time Management
- Data Synchronization
- Offline Support

## Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT Authentication

## Setup

1. Clone the repository:

```bash
git clone https://github.com/creesler/laundry-pos-api.git
cd laundry-pos-api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the server:

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication

- POST /api/auth/login
- POST /api/auth/register

### Inventory

- GET /api/inventory
- POST /api/inventory
- PUT /api/inventory/:id
- DELETE /api/inventory/:id

### Sales

- GET /api/sales
- POST /api/sales
- GET /api/sales/reports

### Employees

- GET /api/employees
- POST /api/employees
- PUT /api/employees/:id
- DELETE /api/employees/:id

### Time Tracking

- POST /api/time/clock-in
- POST /api/time/clock-out
- GET /api/time/reports

## License

MIT
