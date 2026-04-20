# TradeCore — High-Performance Order Matching Engine

**Live Demo:** [https://tradecore-client.onrender.com/](https://tradecore-client.onrender.com/)

## Overview

**TradeCore** is a high-performance backend system that simulates a real-world financial exchange order matching engine.

Financial markets process millions of buy and sell orders per second. Matching engines are the core infrastructure behind stock exchanges, crypto exchanges, and trading platforms. They maintain an order book, match buy and sell orders based on strict rules, handle concurrency, ensure consistency, and provide real-time trade execution.

TradeCore implements a production-style order matching engine with price-time priority, real-time order book management, risk validation, trade settlement simulation, and analytics.

---

## Key Features

### 1. Order Book Engine
- Separate buy and sell order books.
- Max-heap for buy orders (highest price first).
- Min-heap for sell orders (lowest price first).
- Strict price-time priority enforcement.
- Real-time depth visualization.

### 2. Matching Algorithm
- Match when highest buy ≥ lowest sell.
- Partial order matching support.
- Automatic trade generation.
- Execution price determination.
- Order lifecycle tracking.

### 3. Concurrency Control
- Atomic order processing.
- Prevention of race conditions.
- High-throughput request handling.

### 4. Risk Management Engine
- Balance validation before trade.
- Position limit enforcement.
- Duplicate order detection.

### 5. Portfolio & Settlement System
- Simulated wallet management.
- Position tracking per user.
- Trade history logs.
- PnL (Profit & Loss) calculation.

### 6. Real-Time Engine
- WebSocket order book streaming.
- Trade notification events.
- Order status updates.

### 7. REST API & Authentication
- RESTful trading APIs.
- JWT-based authentication and Role-Based Access Control (RBAC).

---

## Tech Stack

### Frontend
- **Framework**: React.js
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Networking**: Axios
- **Real-time**: Socket.IO Client

### Backend
- **Environment**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database ORM**: Prisma
- **Real-time**: Socket.IO
- **Validation**: Zod
- **Authentication**: JWT & bcryptjs

---

## Architecture

TradeCore follows Clean Architecture and Domain-Driven Design principles:
- **Clean Architecture**: Controllers → Services → Domain → Repositories
- **Design Patterns Used**: Strategy, State, Factory, Observer, Repository, Singleton.
- **SOLID Principles** adherence.

---

## Project Structure

```text
SESD/
├── client/                  # Frontend React application
│   ├── public/              # Static assets
│   └── src/
│       ├── components/      # Reusable React components
│       ├── context/         # Global state management
│       ├── hooks/           # Custom React hooks
│       ├── pages/           # Application route components
│       └── services/        # API calling and WebSocket integration
└── server/                  # Backend Express application
    ├── prisma/              # Database schema and migrations
    └── src/
        ├── config/          # Environment and configuration variables
        ├── controllers/     # Request handlers and business logic entry points
        ├── domain/          # Core domain models and entities
        ├── engine/          # Order matching engine and core logic
        ├── factories/       # Object creation logic
        ├── middleware/      # Express middleware functions
        ├── observers/       # Event listeners and pub/sub handlers
        ├── repositories/    # Data access layer
        ├── routes/          # Express route definitions
        ├── services/        # Business logic services
        ├── utils/           # Helper functions and utilities
        └── websocket/       # Socket.io event handlers
```

---

## Project Setup Instructions

Follow these instructions to set up and run the TradeCore application locally.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v16.x or higher)
- [npm](https://www.npmjs.com/)
- A Relational Database compatible with Prisma (e.g., PostgreSQL, MySQL).

### 1. Clone the repository
```bash
git clone <repository_url>
cd SESD
```

### 2. Backend Setup
Navigate to the server directory, install dependencies, configure the environment, and start the development server.

```bash
cd server

# Install dependencies
npm install

# Setup environment variables
# Create a .env file based on the required configurations
# Example contents for .env:
# DATABASE_URL="postgresql://user:password@localhost:5432/tradecore?schema=public"
# JWT_SECRET="your_jwt_secret"
# PORT=3000

# Initialize Prisma, generate client and run migrations
npx prisma generate
npx prisma migrate dev

# Start the backend development server
npm run dev
```
The backend server will run typically on `http://localhost:3000` (or as configured in `.env`).

### 3. Frontend Setup
Open a new terminal window, navigate to the client directory, install dependencies, and start the Vite development server.

```bash
cd client

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```
The frontend server will run typically on `http://localhost:5173`.

---

## User Roles

- **Trader**: Places buy and sell orders.
- **Admin**: Monitors system performance and trade activity.
