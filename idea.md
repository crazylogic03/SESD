# TradeCore — High-Performance Order Matching Engine

## Overview

**TradeCore** is a high-performance backend system that simulates a real-world financial exchange order matching engine.

Financial markets process millions of buy and sell orders per second. Matching engines are the core infrastructure behind stock exchanges, crypto exchanges, and trading platforms. They maintain an order book, match buy and sell orders based on strict rules, handle concurrency, ensure consistency, and provide real-time trade execution.

TradeCore implements a production-style order matching engine with price-time priority, real-time order book management, risk validation, trade settlement simulation, and analytics. The frontend is limited to visualization, while the backend contains the primary complexity and system design focus.

---

## Problem Statement

1. **Efficient Order Matching** — Orders must be matched with minimal latency.
2. **Fairness Enforcement** — Trades must follow strict price-time priority.
3. **Concurrency Control** — Simultaneous order placement must not corrupt the order book.
4. **High Throughput Requirements** — The system must handle large volumes of orders.
5. **Risk Management** — Invalid or risky trades must be rejected before execution.
6. **Real-time Updates** — Traders must see updated order books instantly.

---

## Scope

### In Scope
- Limit order book implementation
- Market order execution
- Price-time priority matching algorithm
- Buy and sell order queues (heap-based)
- Trade settlement simulation
- Portfolio tracking
- Risk validation engine
- Order cancellation and modification
- Real-time order book updates via WebSocket
- Matching performance metrics
- RESTful trading APIs
- Role-based user accounts
- Admin monitoring dashboard
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
- Locking or transactional consistency.
- Prevention of race conditions.
- High-throughput request handling.

### 4. Risk Management Engine
- Balance validation before trade.
- Position limit enforcement.
- Duplicate order detection.
- Fraud simulation rules.

### 5. Portfolio & Settlement System
- Simulated wallet management.
- Position tracking per user.
- Trade history logs.
- PnL (Profit & Loss) calculation.

### 6. Real-Time Engine
- WebSocket order book streaming.
- Trade notification events.
- Order status updates.

### 7. Analytics & Monitoring
- Orders per second (OPS).
- Matching latency tracking.
- Trade volume analytics.
- System health metrics.
- Historical trade charts.

---

## Tech Stack

| Layer          | Technology                                      |
|----------------|--------------------------------------------------|
| **Frontend**   | React.js (Order book visualization)             |
| **Backend**    | Node.js + TypeScript (Express)                  |
| **Database**   | PostgreSQL/MySQL/Prisma                         |
| **Cache**      | Redis                                           |
| **Real-time**  | WebSocket (Socket.io)                           |
| **Auth**       | JWT + RBAC                                      |
| **Testing**    | Jest                                            |

---

## Architecture Principles

- **Clean Architecture**: Controllers → Services → Domain → Repositories
- **Domain-Driven Design** approach
- **OOP Principles**:
  - Encapsulation of OrderBook logic
  - Abstraction of MatchingStrategy
  - Polymorphism in order types
  - Inheritance for order classes
- **Design Patterns**:
  - Strategy — Matching strategies
  - State — Order lifecycle states
  - Factory — Order creation
  - Observer — Real-time trade notifications
  - Repository — Data abstraction
  - Singleton — Matching engine core
- **SOLID Principles** adherence
- **Transactional Consistency Handling**

---

## User Roles

| Role      | Description |
|-----------|-------------|
| **Trader** | Places buy and sell orders |
| **Admin**  | Monitors system performance and trade activity |

---
