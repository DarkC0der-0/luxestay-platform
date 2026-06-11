# 🏡 LuxeStay Property Rental Platform

A highly robust, secure, and full-featured property rental platform that allows users to browse, list, rent, and manage properties with ease. Built with a **Co-located Feature-Driven Monolith** architecture, focusing heavily on data integrity, strict typing, concurrency safety, containerization, and modern JavaScript technologies.

### 🌐 Live Demo
Visit the live deployment here: **[LuxeStay Platform on Railway](https://luxestay-platform-production.up.railway.app)**

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

## ⚙️ Environment Configuration

To run this application, you must create a `.env` file in the root directory. You can use the provided `.env.example` as a template:

```bash
cp .env.example .env
```

### Configuration Options
Edit the created `.env` file to customize your setup:

```env
# Database Connection (See Database Configuration below)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/assess

# Security
JWT_SECRET=your_secure_256bit_jwt_secret_key_here

# Server Configuration
PORT=5005
NODE_ENV=production

# Frontend Client Origin (used for CORS and Socket.IO validation)
FRONTEND_URL=http://localhost:3000

# Optional: Supabase Configs (if using Supabase Auth/Storage in future scalability)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🗄 Database Configuration Options

This project requires **PostgreSQL** due to its reliance on advanced concurrency constraints (`EXCLUDE USING gist`) to safely prevent double-bookings. **SQLite is not supported.**

You have two main database configuration routes depending on your setup:

### Route A: Local/Docker Offline Database (No Supabase)
If you don't have a Supabase account or want to run entirely offline, use the built-in Dockerized Postgres database.

*   **When running with Docker (`docker-compose up`):**
    Set the database URL in `.env` to point to the `db` service container:
    ```env
    DATABASE_URL=postgresql://postgres:postgres@db:5432/assess
    ```
*   **When running manually on the Host Machine:**
    Ensure a local PostgreSQL instance is running on your system, create a database named `assess`, and set:
    ```env
    DATABASE_URL=postgresql://postgres:[your_local_password]@localhost:5432/assess
    ```

---

### Route B: Supabase (Managed Remote Database)
If you want to use Supabase as your database host, follow these rules to prevent connection errors inside Docker.

> [!IMPORTANT]
> **Docker & IPv6 Limitation**
> Supabase direct connections (`db.[project].supabase.co`) are IPv6-only by default. Because Docker Desktop bridge networks on macOS/Windows do not route IPv6 packets to the internet by default, trying to connect directly from a Docker container will fail with a `connect ENETUNREACH` error.

To configure Supabase successfully:
1.  **Use the IPv4 Connection Pooler:**
    In your Supabase Dashboard, go to **Settings -> Database -> Connection Pooling**. Copy the Connection Pooler URL (using port `5432` for Session mode or `6543` for Transaction mode). It looks like this:
    ```
    aws-0-[region].pooler.supabase.com
    ```
2.  **URL-Encode Password Special Characters:**
    If your database password contains special characters (like `@`, `%`, `:`, or `/`), they **must** be URL-encoded in the connection string to prevent parsing errors.
    *   `@` becomes `%40`
    *   `%` becomes `%25`
    *   *Example:* If your password is `my#pass%word`, it should be written in your `DATABASE_URL` as:
        ```env
        DATABASE_URL=postgresql://postgres.[project-ref]:my%23pass%25word@aws-0-[region].pooler.supabase.com:5432/postgres
        ```

---

## 🐳 Docker Deployment & Orchestration (Recommended)

Ensure you have **Docker Desktop** running.

### 1. Build and Start the Services
This spins up Nginx (serving the React client on port 3000), the Node API Server (on port 5005), and PostgreSQL.
```bash
docker-compose up --build -d
```

### 2. Initialize and Seed the Database
Initialize the database tables and seed them with premium mock property and user listings:
```bash
# Initialize schema (Only needed if running Route A without auto-init)
docker-compose exec server npm run db:init

# Seed initial premium properties, hosts, bookings, and messages
docker-compose exec server node scripts/seedData.js
```

### 3. Verification
Access the platform in your browser at: **`http://localhost:3000`**

### 4. Stop the Environment
To stop and clean up containers:
```bash
docker-compose down
```

---

## ⚙️ Manual Local Development Setup

If you prefer to run the client and server directly on your host machine without Docker:

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize and Seed Local Database
Ensure your local Postgres instance is running and configuration in `.env` points to `localhost`:
```bash
npm run db:init
node scripts/seedData.js
```

### 3. Run Development Servers
Start both the API server and the Vite React development server concurrently:
```bash
npm run dev:all
```
*   **API server** will run on: `http://localhost:5005`
*   **React frontend** will run on: `http://localhost:5173`

---

## ☁️ Cloud Deployment (Railway Single-Instance)

This project is pre-configured to deploy on **Railway** as a single-instance Docker application, where the Express backend builds and serves the React frontend static assets from a single container.

### 1. Configuration (`railway.json`)
The repository includes a `railway.json` file to instruct Railway to automatically build using the unified backend Dockerfile:
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile.server"
  }
}
```

### 2. Environment Variables needed in Railway:
In your Railway dashboard service variables, set the following:
*   `DATABASE_URL`: Your Supabase IPv4 connection pooler URL (with special characters URL-encoded).
*   `JWT_SECRET`: A secure 256-bit JWT secret.
*   `PORT`: Automatically bound by Railway.
*   `NODE_ENV`: `production`

---

## 🧪 Testing & Validation

To validate the entire suite (JWT handshake tests, routing permissions, booking exclusions, database pool logic):
```bash
npm test
```

---

## 📝 Recent Fixes & Adjustments Log
Here are the adjustments made in the environment to ensure cross-platform compatibility:
*   **Tailwind CSS Build Fix:** Configured `Dockerfile.client` with `node:20-slim` instead of `alpine` to ensure native binding compatibility for `@tailwindcss/oxide` inside the Docker builder container.
*   **Dockerfile Server Build Step:** Updated `Dockerfile.server` to use `node:20-slim` and force-install development dependencies during the build stage (`NODE_ENV=development npm install`) so that Vite can compile frontend static assets successfully when deploying the single-instance app to Railway.
*   **CORS Configuration:** Modified the Express CORS policy to dynamically accept requests from any `*.railway.app` origin to avoid CORS blocks on deployed environments.
*   **Helmet CSP Disabling:** Configured Helmet's Content Security Policy to `false` (`helmet({ contentSecurityPolicy: false })`) to permit loading external Unsplash listing images and establishing WebSocket connections.
*   **IPv4 DNS Resolution Force:** Modified local network pool options and forced `dns.setDefaultResultOrder('ipv4first')` in the Express server to prevent connection issues inside virtualized Docker container bridges.
