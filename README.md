# 🏡 LuxeStay Property Rental Platform

A highly robust, secure, and full-featured platform that allows users to browse, list, rent, and manage properties with ease. Built with a **Co-located Feature-Driven Monolith** architecture, focusing heavily on data integrity, strict typing, concurrency safety, containerization, and modern JavaScript technologies.

---

## 🚀 Key Features

*   🏠 **List and Manage Rental Properties:** Supports comprehensive property attributes (bedrooms, bathrooms, capacity) and multi-image galleries.
*   🔍 **Dynamic Search & Filter:** Highly optimized database-level filtering by location search references, price ranges, and property types.
*   👥 **User Authentication & RBAC:** Stateless JWT authentication with strict Role-Based Access Control (Guest, Host, and Admin roles).
*   📅 **Concurrency-Safe Bookings:** Uses PostgreSQL's `EXCLUDE USING gist` to mathematically prevent double-bookings at the database layer (PostgreSQL error `23P01`).
*   📆 **Real-time Availability:** Dedicated API endpoint to fetch booked date ranges and disable overlapping dates on the frontend calendar.
*   💬 **Persistent Real-Time Messaging:** Messaging chat history utilizing a fully JWT-authenticated Socket.IO server.
*   🛠 **Administrative Controls:** Full administrative panel mapping platform volumes, host payouts ledger approvals, support ticketing activity/resolutions, settings overrides, and user suspension controls.
*   🐳 **Containerized Architecture:** Complete Docker Compose setup running PostgreSQL, Node Express server, and Vite client Nginx server out-of-the-box.
*   ☁️ **Dockerized Architecture:** Seamless full-stack orchestration using Docker Compose for the API, Socket.IO, and PostgreSQL.

---

## 🏗 System Architecture & Engineering Documentation

This repository was built to meet **Senior Engineering Standards**. The core philosophy centers on using the Node.js backend as an impenetrable trust boundary and relying on relational database constraints for ACID compliance.

To review our architectural decisions, trade-offs, and design patterns, please consult our engineering documentation:

1.  [System Architecture & ADRs](./documentation/System_Architecture.md)
2.  [Database Design & Integrity Constraints](./documentation/Database_Design.md)
3.  [API REST Contract & Security](./documentation/API_Design.md)
4.  [Product Scope & MVP Definitions](./documentation/Product_Scope.md)
5.  [Engineering Decisions & Applied Fixes Log](./documentation/Engineering_Decisions_Log.md)
6.  [Initial Codebase Audit Notes](./documentation/Codebase_Audit_Notes.md)

---

## 🛠 Tech Stack

**Frontend Client**
*   **Framework:** React.js (Vite compiler)
*   **State Management:** Zustand (for Auth and UI stores), TanStack Query / React Query (for server state cache caching and mutations)
*   **Styling:** TailwindCSS v4 (CSS-first configuration)
*   **Network:** Axios with automated request JWT interceptors

**Backend API**
*   **Framework:** Node.js + Express.js
*   **Validation:** Zod
*   **Security:** Helmet headers, CORS policies, and centralized global error handling middleware
*   **Authentication:** Stateless JWTs (bcrypt password hashing)
*   **Real-time:** Socket.IO (Modularized handshake JWT verification)

**Database Layer**
*   **Engine:** PostgreSQL (`pg` connection pooling)
*   **Integrity Rules:** UUIDs, `ON DELETE CASCADE/RESTRICT`, and `EXCLUDE USING gist` for guaranteed concurrency safety.

---

## 🐳 Docker Local Setup (Recommended)

You can spin up the complete, integrated stack locally inside Docker containers without installing database services locally:

### 1. Start the Containers
Ensure your local **Docker Desktop** is running, then execute:
```bash
docker-compose up --build -d
```
*   This builds and starts three services:
    *   `db` (Postgres 15 on port `5432` - automatically initializes database schemas from `server/db/schema.sql` via entrypoint mounts).
    *   `server` (Express API server on port `5005`).
    *   `client` (Vite static files served via Nginx on port `3000`).

### 2. Seed Database Mock Data
Once the containers are active, run the data seeding script inside the running server container:
```bash
docker-compose exec server node scripts/seedData.js
```
You can now access the working platform locally at `http://localhost:3000`.

---

## ⚙️ Manual Local Setup

### 1. Prerequisites
*   Node.js (v18+)
*   A running PostgreSQL instance (or [Supabase](https://supabase.com/) account).

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://postgres:[password]@localhost:5432/assess
JWT_SECRET=your_secure_256bit_jwt_secret_key_here
PORT=5005
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Installation
Install all backend and frontend dependencies:
```bash
npm install
```

### 4. Database Migration & Seeding
Initialize the PostgreSQL schema and load database configurations:
```bash
npm run db:init
node scripts/seedData.js
```

### 5. Start Development Servers
Start the co-located processes:

**Backend Server (Port 5005):**
```bash
npm run server
```

**Frontend Vite Server (Port 5173):**
```bash
npm run dev
```

---

## 🧪 Testing & Validation

Run the automated integration and unit test suite locally:
```bash
npm test
```
*   **Tests covered:** 45 tests mapping Express routing permissions, user password update handlers, Socket.IO websocket JWT verifiers, Zod formatting edge-cases, and database exclusion concurrency boundaries.

---

## 📄 License
This project is licensed under the MIT License.
