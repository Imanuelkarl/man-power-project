# Client README

The client is the interactive front door of the Man Power Project. It is a React + TypeScript application built for dynamic industrial dashboards, role-aware user flows, and geographic intelligence.

## What the frontend is responsible for

This layer handles:

- user authentication and protected route enforcement
- manufacturer and admin dashboards
- power-data questionnaires and submissions
- cluster and map-based views
- charts, exports, and operational reporting
- UX for company profiles and management workflows

In short, the UI turns backend data into a decision-making experience for users working with manufacturing and regional insights.

---

## Stack and tooling

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Radix UI primitives
- Recharts / Chart.js
- Leaflet + React Leaflet
- Axios
- Form handling through React Hook Form + Zod
- PDF and spreadsheet export support via jsPDF and xlsx

---

## Application structure

```text
client/src/
├─ App.tsx
├─ App.css
├─ index.css
├─ main.tsx
├─ components/
│  ├─ auth/
│  ├─ cluster/
│  ├─ forms/
│  ├─ manufacturer/
│  ├─ ui/
│  ├─ navigate.tsx
│  ├─ page-header.tsx
│  ├─ ProtectedRoute.tsx
│  ├─ StepNavigator.tsx
│  └─ ThemeToggle.tsx
├─ context/
│  ├─ AuthContext.tsx
│  └─ ThemeContext.tsx
├─ data/
│  ├─ data.json
│  └─ state-lga-ward-polling-unit.json
├─ hooks/
│  ├─ use-hydrated.ts
│  └─ use-mobile.ts
├─ lib/
│  ├─ api.ts
│  ├─ cluster-export.ts
│  ├─ cluster-utils.ts
│  ├─ clusters.ts
│  ├─ dummy-data.ts
│  ├─ exports.ts
│  ├─ format.ts
│  ├─ geo-clustering.ts
│  ├─ geo-hull.ts
│  ├─ location_finder.ts
│  ├─ nigeria-geo-data.ts
│  ├─ nigeria-geo-loader.ts
│  ├─ store.ts
│  └─ utils.tsx
├─ pages/
│  ├─ AppLayout.tsx
│  ├─ WelcomePage.tsx
│  ├─ admin/
│  ├─ auth/
│  ├─ clusters/
│  ├─ dashboard/
│  ├─ manufacturers/
│  └─ ...
├─ services/
│  ├─ authService.ts
│  ├─ clustersService.ts
│  ├─ manufacturerService.ts
│  ├─ powerDataService.ts
│  └─ userService.ts
├─ types/
│  ├─ cluster.types.ts
│  ├─ export.types.ts
│  ├─ manufacturer.types.ts
│  ├─ powerData.types.ts
│  ├─ response.types.ts
│  ├─ role.types.ts
│  └─ user.types.ts
└─ assets/
```

---

## Routing model

The app is organized around protected flows and role-aware screens. In `src/App.tsx`, the frontend defines routes such as:

- `/login`
- `/dashboard`
- `/manufacturers`
- `/clusters`
- `/cluster-map`
- `/cluster-hub`
- `/questionnaire`
- `/submissions`
- `/company`
- `/users`

Protected pages wrap content inside `AppLayout` and `ProtectedRoute`, ensuring the user must be authenticated before accessing the system.

---

## Auth and state flow

The frontend uses an `AuthProvider` to manage application auth state and exposes the user context throughout the app.

A shared API layer sits in `src/lib/api.ts`:

- creates a central Axios instance
- reads the JWT from local storage
- attaches the token to each outgoing request
- normalizes API success and error responses

This gives the rest of the client a clean way to talk to the backend without repeating request logic in every page.

---

## Core user flows

### 1. Authentication

Users can sign in, reset passwords, and manage account recovery flows. The frontend handles route transitions and UI feedback for these paths.

### 2. Manufacturer management

The client supports operational pages for manufacturers, company profiles, and submission records.

### 3. Power data reporting

Users complete structured questionnaires and submit production/energy metrics that the backend stores and later surfaces in analytics views.

### 4. Cluster and map exploration

The app includes geo and cluster functionality, using location datasets and map visuals to understand operational regions across Nigeria.

### 5. Dashboard intelligence

The client consolidates multiple dataset types into dashboard screens, combining data tables, charts, and aggregated summaries.

---

## Styling and UX design

The frontend uses a modern component architecture with reusable UI blocks and custom utilities. It supports:

- dark/light theming through `ThemeContext`
- responsive page layouts
- reusable navigation and page headers
- interactive forms, tabs, dialogs, and selectors
- export-ready reporting surfaces

---

## Important client features

### Geo-aware views

The app includes geographic data utilities for:

- cluster region grouping
- polygon and hull calculations
- Nigeria state/LGA/ward analysis
- map-based location discovery

### Export support

The client includes libraries such as:

- `xlsx` for spreadsheet output
- `jspdf` / `jspdf-autotable` for PDF generation

### Charts and dashboards

Multiple charting libraries are used to turn raw numbers into dashboards, making manufacturing performance easier to assess.

---

## Running the client

### Install

```bash
cd client
npm install
```

### Start development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

---

## Notes for contributors

This client is best understood as a workflow-heavy dashboard application rather than a simple landing page. A lot of the value is in the combination of:

- workflow pages
- protected routes
- map-based data exploration
- operational records and reports
- business-specific analytics

The frontend is intentionally designed to connect tightly to the backend domain model, so it feels consistent with the manufacturing and cluster logic behind it.

---

## Summary

The client is the interactive layer of the system: a modern, modular React experience for managing manufacturer data, monitoring operations, and exploring geo-driven business intelligence. It balances business workflows with data-rich visuals and secure route handling.
