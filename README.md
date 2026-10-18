# Tickify Client

React client for **Tickify**, an event ticket booking system. It talks to the real
[Tickify API](https://github.com/racheli7736/Tickify) (ASP.NET Core, PostgreSQL) - there is no mock backend and no server logic
in the client.

- **Stack:** React 19 + TypeScript, Vite, React Router, Axios, Material UI (MUI) with a shared RTL theme, React Hook Form + Yup.
- **Language / layout:** Hebrew, right-to-left (RTL), responsive (mobile / tablet / desktop).
- **Design:** white background, navy `#142B49` for structure, gold `#C9A34E` for accents.

## Screens

| Screen | Route | Who | What it does |
|---|---|---|---|
| Login | `/login` | visitors | E-mail + password, JWT saved, Hebrew errors; demo-account buttons in development |
| Register | `/register` | visitors | Validation that mirrors the API, password strength hint, 409 (e-mail taken) handling, logs in automatically |
| Events | `/events` | logged in | **Server-side paging** (3/6/9/12 per page), search, category filter, sorting; filters live in the URL |
| Event details | `/events/:id` | logged in | Event info, **seat map**, selection (max 6), booking summary, confirm and success dialogs |
| My orders | `/orders` | logged in | Paged list of the user's orders, **cancel** an active order of a future event |
| Admin: events | `/admin/events` | Admin | Paged table with search/sort, create, edit, delete (409 when tickets were sold) |
| Admin: create / edit event | `/admin/events/new`, `/admin/events/:id/edit` | Admin | Form with validation; the seat structure (rows x seats) is set only on creation |
| Admin: categories | `/admin/categories` | Admin | Create, rename, delete (409 when the category is used by events) |
| Admin: all orders | `/admin/orders` | Admin | Every order with the purchaser's name and id (never an e-mail) |

### The limited resource: seats and HTTP 409

The seat map shows `Available` / `Sold` seats from `GET /api/events/{id}/seats`. When the user confirms, the client sends **one**
`POST /api/orders`. If another user bought one of the seats in the meantime the server answers **409 Conflict** and rejects the whole order
(all or nothing). The client then: shows the server's Hebrew message in a prominent alert, names the seats that were taken, highlights them
on the map, **reloads the map**, removes the taken seats from the selection and keeps the still-free ones selected, so the user can
confirm again immediately. Nothing about availability is decided in the client - the server is the only authority.

## Requirements

- **Node.js 20.19+** (22 recommended) and npm.
- The **Tickify API running on `https://localhost:7003`** (see the API repository: `dotnet run --project Tickify.API --launch-profile https`).
- The ASP.NET Core **HTTPS development certificate trusted** on your machine, once: `dotnet dev-certs https --trust`
  (otherwise the browser blocks requests to the API).

## Install and run

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. The dev server uses exactly port **5173** (and fails instead of choosing another one), because the API
allows CORS only from `http://localhost:5173` and `http://127.0.0.1:5173`.

Demo accounts created by the API seed (also available as buttons on the login page in development):

| Role | E-mail | Password |
|---|---|---|
| Admin | `admin@tickets.local` | `Admin123!` |
| User | `user@tickets.local` | `User123!` |

## Configuration

| Variable | Default (development) | Meaning |
|---|---|---|
| `VITE_API_URL` | `https://localhost:7003` | Base URL of the Tickify API |

It is read from `.env.development` (committed, contains no secret). To override it locally create `.env.local` (git-ignored; see `.env.example`).
**Never put secrets in a `VITE_*` variable:** everything with that prefix is visible in the browser.

## Verification

Every screen was checked in a real browser (headless Chrome) against the running API: login/registration, events paging/search/filter/sort,
seat selection, purchase, **HTTP 409 conflict** (a second user buys the seat first), order cancellation, the admin screens (events, categories,
orders), role-based access (`/forbidden`), error and loading states, and mobile/tablet/desktop layouts. Type check, lint and production build
are clean (`npx tsc -b`, `npm run lint`, `npm run build`), and `npm audit` reports no vulnerabilities.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server on port 5173 |
| `npm run build` | Type-check and production build into `dist/` |
| `npm run preview` | Serve the production build on port 5173 |
| `npm run lint` | Lint the code |

## Project structure

```
src/
  api/        Axios instance (base URL from env, JWT interceptor, 401 handling), error mapping, one file per API area
  auth/       Auth context/provider, useAuth hook, route guards (RequireAuth, RequireAdmin), session storage
  components/ Reusable UI pieces (Logo, TicketArt, ...)
  layouts/    AuthLayout (login/register) and MainLayout (navigation bar, footer)
  pages/      One component per screen
  routes/     Route table
  theme/      Shared MUI theme + RTL provider
  types/      TypeScript types that mirror the API DTOs
```

## Authentication and security notes

- The JWT returned by the API is stored in `localStorage` (so a refresh keeps you logged in) together with its expiry, the display name and
  the role. The e-mail address and the password are **never** stored.
- The token is attached to every request (`Authorization: Bearer ...`) by an Axios interceptor. A `401` from a protected call ends the
  session and returns to the login page; the session also ends automatically when the token expires.
- Route guards (`RequireAuth`, `RequireAdmin`) only decide what the UI shows. **The server enforces every permission** - a regular user
  who forces an admin URL still gets `403` from the API.
- `localStorage` is readable by any script running on the page, so the app avoids rendering untrusted HTML.

## Error handling

All API errors are converted by `src/api/errors.ts` into Hebrew, user-friendly messages (400 validation, 401, 403, 404, 409, server and
network errors). The seat-conflict `409` message is written by the server in Hebrew and is shown as is.
