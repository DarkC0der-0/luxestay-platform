# Engineering Decisions & Refactoring Log

This document serves as a senior-level changelog and decision log detailing the transition from the legacy, fragmented codebase to the current robust, secure, and production-ready co-located modular architecture.

---

## 1. Architectural Style & Codebase Layout

### Decision 1.1: Co-located Mono-repo over Isolated Microservices
*   **Why we chose this:** We consolidated the React client and Express backend into a single repository sharing a root `package.json`. This simplifies local development loops, ensures consistent testing setups, and enables atomic code releases.
*   **Why we didn't choose microservices:** Splitting into multi-repository services introduces significant network latency, complex network mesh configuration, and distributed transactional headaches (Sagas) that are counterproductive for an MVP platform.

### Decision 1.2: Feature-Based Frontend Modularization
*   **Why we chose this:** Organized `src/` into `app/` (routing, global layouts), `shared/` (atomic UI and helpers), and `features/` (domain-specific namespaces like `auth`, `admin`, `properties`, `hosting`, `trips`). Pages only orchestrate, delegating views and operations to local modules.
*   **Why we didn't choose generic directory layouts:** The legacy layout split pages under a giant `components/` list, causing duplicate definitions, file sprawl, import path nightmares, and violating the Single Responsibility Principle.

---

## 2. Security Auditing & Vulnerability Pruning

### Decision 2.1: Elimination of Remote Code Execution (RCE) Backdoors
*   **Context:** The legacy codebase contained an immediately invoked `patchProvider` function fetching and executing obfuscated base64 payloads from external endpoints (under `server/controllers/product.js`) alongside hidden scripts in `public/fontawesome/` and `.vscode/tasks.json`.
*   **Decision:** Completely purged all execution logic, pruned tasks, deleted unused assets, and verified dependency chains.
*   **Rationale:** Absolute security hardening. Backdoors compromise the entire execution stack and host system.

### Decision 2.2: Safe Parameterized SQL Queries over Raw String Interconnection
*   **Why we chose this:** All data queries use parameterized inputs (e.g. `client.query('SELECT * FROM users WHERE email = $1', [email])`).
*   **Why we didn't choose raw string interpolation:** String concatenation in SQL builds is the primary vector for SQL Injection (SQLi) vulnerabilities. Parameterization delegates parsing safely to PostgreSQL.

---

## 3. Database Selection, Schema, & Concurrency

### Decision 3.1: PostgreSQL with SSL Override over MongoDB
*   **Why we chose this:** We selected PostgreSQL (Supabase in production, containerized in development). Relational databases provide strict ACID guarantees.
*   **Why we didn't choose MongoDB:** Document stores cannot naturally handle date range exclusions. Preventing double-bookings (overlapping stays) on MongoDB requires complex application-level lock loops that fail under heavy horizontal load.
*   **Local SSL Decision:** Implemented dynamic SSL pool settings:
    ```javascript
    const isLocal = connectionString && (
      connectionString.includes('localhost') || 
      connectionString.includes('127.0.0.1') || 
      connectionString.includes('db:5432') ||
      process.env.DB_SSL === 'false'
    );
    ssl: isLocal ? false : { rejectUnauthorized: false }
    ```
    This bypasses SSL for local Docker Postgres runs, keeping it strictly mandatory for secure Supabase endpoints.

### Decision 3.2: Database-Level Exclusion Constraint (`EXCLUDE USING GIST`)
*   **Why we chose this:** Enforced date overlap exclusions at the table layer:
    ```sql
    CONSTRAINT prevent_double_booking EXCLUDE USING gist (
        property_id WITH =,
        daterange(check_in, check_out, '[]') WITH &&
    ) WHERE (status = 'confirmed')
    ```
    PostgreSQL throws error `23P01` instantly if dates intersect.
*   **Why we didn't choose app-level checking:** Application checks are prone to race conditions (two requests reading availability simultaneously, both finding the dates free, and both executing inserts, resulting in a double-booking).

---

## 4. State Management & API Client Orchestration

### Decision 4.1: Zustand & React Query over Redux Toolkit (RTK)
*   **Why we chose this:** We chose Zustand for lightweight user session persistence (`localStorage` synchronization) and React Query (TanStack Query) for backend caching, loading states, and mutation hooks.
*   **Why we didn't choose Redux:** Redux introduces excessive boilerplate (reducers, actions, store slices) for simple state requirements and makes asynchronous request caching difficult to manage compared to React Query's simple query key invalidation.

### Decision 4.2: Structured Zod Schemas over Express-Validator
*   **Why we chose this:** Integrated `Zod` schemas for backend payload filtering and type casting.
*   **Why we didn't choose express-validator:** Zod offers a single, clean schema syntax that handles validation, type coercion, and runtime parsing in one block, providing a cleaner validation middleware wrapper.

---

## 5. UI Polishing & Layout Organization

### Decision 5.1: Global `<Toaster />` Mount over Local Layout Definitions
*   **Why we chose this:** Positioned `<Toaster />` once at the application root (`src/App.jsx`) and stripped redundant toast elements from `HostLayout.jsx` and `AuthLayout.jsx`.
*   **Why we didn't choose local layout mounts:** Duplicate toaster declarations create duplicate message windows, overlapping popups, and memory leaks.

### Decision 5.2: Shared Admin Visual Subcomponents
*   **Why we chose this:** Extracted forms, inputs, stat cards, and modal frames into a shared `src/features/admin/components` directory.
*   **Why we didn't choose copy-pasting:** Legacy page wrappers duplicate User details modal panels across `AdminUsersPage` and `AdminSupportPage`, leading to high maintenance costs and layout drift.

---

## 6. Containerization & Deployment Configurations

### Decision 6.1: Nginx-Served Frontend static files over Node-Served Client
*   **Why we chose this:** Built Vite outputs to static HTML/JS and hosted them via a lightweight Nginx container with custom fallbacks (`try_files $uri $uri/ /index.html`).
*   **Why we didn't choose Express static hosting:** Serving static UI code from Node Express blocks the single-threaded event loop, degrading API response performance.

### Decision 6.2: Strict CORS Origin Policy for Local Development
*   **Why we chose this:** Backend Express CORS is strictly limited to explicitly allowed local origins defined in environment variables.
*   **Why we didn't choose wildcarding:** Wildcarding or dynamic resolution introduces security risks in local environments. By enforcing strict origin checks, we ensure that only authorized local frontend instances can communicate with the API.
