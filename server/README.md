# Server README

The backend is the engine of the Man Power Project. It exposes a secure REST API, validates users and roles, and manages the core data layer through Prisma and PostgreSQL.

## What the server does

This server powers the functional heart of the platform:

- authentication and password reset workflows
- manufacturer profile management
- power-data record creation and retrieval
- cluster-related operations
- role-aware access controls
- email-based communication utilities

It sits in front of the data model and ensures that every request flows through the right middleware before reaching the database.

---

## Architecture

```text
server/
├─ src/
│  ├─ server.ts          # Express app bootstrap
│  ├─ controllers/       # business logic entry points
│  ├─ routes/            # REST route registration
│  ├─ middlewares/       # auth and role enforcement
│  ├─ services/          # more advanced domain logic
│  ├─ models/            # shared type/model patterns
│  ├─ utils/             # email, helpers, formatting
│  └─ generated/         # Prisma client output
├─ prisma/
│  ├─ schema.prisma      # database model definition
│  └─ migrations/        # schema evolution history
└─ tsconfig.json
```

---

## Entry point

The app bootstraps in `src/server.ts`:

- loads environment variables from `.env`
- creates an Express app
- attaches CORS and JSON parsing middleware
- mounts route groups under `/api/*`
- starts the server on the configured port

The root route returns a welcome message:

```ts
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Man Power Project API" });
});
```

---

## API surface

### Auth routes

Mounted under `/api/auth`:

- `POST /login`
- `POST /signup` (admin-only)
- `POST /update-password`
- `POST /reset-password`
- `GET /verify-token`
- `POST /logout`
- `GET /test`

These routes manage identity, JWT validation, and recovery flows.

### Manufacturer routes

Mounted under `/api/manufacturers`:

- `POST /` create manufacturer
- `GET /` list all manufacturers
- `GET /:manId` find by manufacturer ID
- `GET /id/:id` find by numeric ID
- `GET /email/:email` find by email
- `PUT /:id` update manufacturer
- `DELETE /:id` delete manufacturer

### Power data routes

Mounted under `/api/power-data`:

- `POST /` create record
- `GET /` list all data
- `GET /:id` find by record ID
- `GET /manufacturer/:manufacturer_id` list data for a manufacturer
- `PUT /:id` update record
- `DELETE /:id` delete record

### Additional routes

The app also includes route modules for users and clusters, typically serving administrative and geo-analysis use cases.

---

## Security model

The backend is designed around token validation and role restrictions.

### Authentication

`verifyToken` checks the incoming bearer token and verifies that the request comes from a valid authenticated user.

### Authorization

Role-based access is enforced by middleware such as:

- `adminOnly`
- `manufacturerOnly`

This means that not every endpoint is exposed to every user. Core data-entry operations are intentionally restricted to the correct actor.

---

## Prisma data model

The database schema is defined in `prisma/schema.prisma`.

### Key models

#### User

Represents application users and includes:

- id
- userId
- email
- name
- password hash
- role
- active status
- manufacturer linkage

#### Manufacturer

Represents the manufacturing entity and stores operational metadata including:

- company name
- contact person
- email and phone
- sector and subsector
- address and branch info
- latitude and longitude coordinates

#### PowerData

This is the most operationally rich model. It stores:

- production and capacity information
- energy costs and outages
- staffing counts
- investment and expense data
- energy source generation data
- comments and status fields

#### Cluster

Stores geo-analysis data such as:

- owner user linkage
- cluster name and description
- geo type
- states, LGAs, wards
- focal point and radius

---

## Database conventions

The schema uses PostgreSQL as the primary datasource and Prisma for type-safe, queryable access. A few conventions stand out:

- `@default(now())` is used for creation timestamps
- `@updatedAt` updates time automatically
- `onDelete: Cascade` helps maintain referential integrity
- `Json` fields are used for cluster region data and flexible geo metadata

---

## Startup and development

### Install dependencies

```bash
cd server
npm install
```

### Run in development mode

```bash
npm run dev
```

This uses `tsx watch src/server.ts`, so changes are reloaded automatically.

### Build for production

```bash
npm run build
```

The build script performs:

```bash
npx prisma migrate deploy
npx prisma generate
tsc
```

### Start the built server

```bash
npm start
```

---

## Environment configuration

The server expects a `.env` file with at least:

```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/manpower"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

Optional email configuration is also present for sending mail through Nodemailer.

---

## Email utilities

The backend includes an `EmailSender` utility to trigger email workflows. This makes it possible to support:

- password reset requests
- user invitations
- operational notifications
- system communication workflows

---

## Why this backend is structured this way

The design follows a clean API-server pattern:

- routes define the external contract
- controllers orchestrate request handling
- middleware enforces security and scope
- Prisma handles persistence and typed DB queries
- utils and services isolate cross-cutting logic

This separation makes the codebase easier to extend as the project adds more business rules, reporting logic, and analytics endpoints.

---

## Summary

The server is a secure, modular API layer that turns raw manufacturing and geographic data into operational intelligence. It uses Express for HTTP orchestration, Prisma for data modeling and persistence, and role-based middleware to keep the platform safe and organized.
