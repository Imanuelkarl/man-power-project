# Man Power Project

A full-stack industrial intelligence platform designed for manufacturing visibility, power-data management, and regional cluster analytics. The product blends operational reporting, role-based access, and geographic insight into a single experience for manufacturers, administrators, and business stakeholders.

## Why this app exists

This project helps organizations track manufacturing performance across multiple factories, understand energy demand, and analyze industrial activity at a cluster or regional level. Instead of using disconnected spreadsheets or manual reporting, the app centralizes:

- manufacturer profiles and company registration data
- sector-based operational intelligence
- power usage and production performance metrics
- cluster-level geographic analysis across states and LGAs
- role-aware dashboards for different user types

The system is built as a monorepo with a React frontend and a TypeScript Express backend, connected through a Prisma-powered data layer.

---

## High-level architecture

```text
Client (React + Vite)
  ├─ routes and protected pages
  ├─ auth/session state
  ├─ dashboards, forms, exports, maps
  └─ API client wrapper with JWT handling

          │ HTTPS / REST API
          ▼
Server (Express + TypeScript)
  ├─ route layer
  ├─ controllers
  ├─ middleware (auth + role checks)
  ├─ Prisma client access
  └─ business logic and email utilities

          │ Prisma ORM
          ▼
PostgreSQL / Prisma schema
  ├─ Users
  ├─ Manufacturers
  ├─ PowerData
  ├─ Clusters
  └─ related metadata
```

---

## Core features

### 1. Manufacturer workflow

The app supports manufacturer onboarding and operational records, including:

- company profile creation and updates
- role-based access for admin and manufacturer users
- questionnaire-driven submission forms
- power consumption and production metrics tracking

### 2. Power-data reporting

Manufacturers can submit performance data relevant to industrial operations, such as:

- capacity utilization
- production value
- raw material and transport costs
- local sourcing percentages
- worker count and employment metrics
- energy costs and generation sources
- investment and equipment spending
- comments and policy-related notes

This data is stored in a normalized structure using the `PowerData` model.

### 3. Cluster and geo intelligence

The system includes geographic clustering features for planning and regional analysis, including:

- cluster definitions
- state, LGA, and ward-based region grouping
- focal point and radius metadata
- geographic JSON structures used for mapping and location analysis
- dashboard views built around cluster relationships

### 4. Role-based access control

The backend uses middleware for authentication and authorization.

- `verifyToken` validates incoming JWTs
- `adminOnly` restricts admin-sensitive operations
- `manufacturerOnly` limits operational data writes to manufacturers

This keeps the system secure while allowing different user personas to work in the same platform.

### 5. Administration and management

The admin side supports:

- user management
- manufacturer records
- submissions review
- dashboard insights
- cluster and operational visibility

---

## Tech stack

### Frontend

- React 19 + TypeScript
- Vite for development and bundling
- React Router for navigation
- Tailwind CSS and component styling utilities
- Radix UI primitives for accessible interface controls
- Recharts, Chart.js, and PDF/Excel export libraries
- Leaflet / React Leaflet for map and geo features
- Axios for API communication
- Zustand / Redux Toolkit for state orchestration

### Backend

- Node.js + Express 5
- TypeScript
- Prisma ORM
- PostgreSQL-ready schema layer
- JWT-basedAuthentication
- bcrypt for password hashing
- Nodemailer for email workflows
- CORS and environment-driven configuration

### Project tooling

- Concurrently to run client and server together
- Prisma migration and generate commands in the server build
- TypeScript build pipeline for both sides

---

## Repository structure

```text
man-power-project/
├─ README.md
├─ package.json
├─ client/
│  ├─ package.json
│  ├─ src/
│  │  ├─ App.tsx
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ pages/
│  │  ├─ services/
│  │  ├─ lib/
│  │  └─ types/
│  ├─ public/
│  └─ vite.config.ts
├─ server/
│  ├─ package.json
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ migrations/
│  ├─ src/
│  │  ├─ server.ts
│  │  ├─ controllers/
│  │  ├─ routes/
│  │  ├─ middlewares/
│  │  ├─ services/
│  │  ├─ models/
│  │  ├─ utils/
│  │  └─ generated/
│  └─ tsconfig.json
└─ node_modules/ (after install)
```

---

## Main data model

The backend schema is centered around a few key entities:

- `User`: user identity, password hash, role, and ownership linkage
- `Manufacturer`: manufacturer profile and operating metadata
- `PowerData`: key industrial and energy metrics for a manufacturer
- `Cluster`: groupings of regions, states, LGAs, and wards tied to an owner

A simplified summary is:

```text
User 1---* Cluster
Manufacturer 1---* PowerData
User 1---? Manufacturer
```

The design supports both operational reporting and strategic planning by joining user roles, manufacturer records, and cluster-level analytics.

---

## Request flow

A common user journey in this project looks like this:

1. A user signs in through the React client.
2. The frontend stores a JWT token locally.
3. Every API request attaches the token in an Axios interceptor.
4. The Express server verifies the token and applies role checks.
5. The controller performs CRUD or reporting logic.
6. Prisma reads or writes the relevant PostgreSQL records.
7. The UI renders the response as dashboards, charts, forms, or map views.

This architecture keeps the frontend focused on user experience while the backend owns validation, security, and persistence.

---

## Environment setup

### Root project

```bash
npm install
```

### Client

```bash
cd client
npm install
npm run dev
```

### Server

```bash
cd server
npm install
```

For the server, add a `.env` file with values similar to:

```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/manpower"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
EMAIL_HOST="smtp.example.com"
EMAIL_PORT=587
EMAIL_USER="your-email"
EMAIL_PASS="your-password"
```

Then run:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

---

## Running the app together

From the root directory:

```bash
npm run dev
```

This starts the backend and frontend concurrently via the root `package.json` scripts.

---

## Notes on development philosophy

This project is more than a CRUD app. It is a domain-driven application built around industrial decision-making, where data quality, ownership, geo-context, and operational reporting matter. That is why you will find:

- secure role access around sensitive operations
- structured forms for manufacturing reporting
- map-based regional modeling
- dashboard-first UX for business visibility
- strong modularity between frontend pages and backend resources

---

## Future direction

The app already has a strong foundation for expansion into areas such as:

- real-time data refresh and notifications
- advanced analytics and forecasting
- export pipelines for government and industry reports
- richer map filters and cluster intelligence
- integration with external energy or production data sources

---

## Summary

Man Power Project is a data-rich, role-aware industrial platform that turns manufacturing and geographic insights into a usable operational dashboard. It combines the speed of a modern React frontend with the reliability of an Express + Prisma backend, giving teams a structured way to manage manufacturers, power data, and cluster intelligence from one environment.
