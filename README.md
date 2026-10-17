# Tickify Client

React client for **Tickify**, an event ticket booking system. It talks to the real
[Tickify API](https://github.com/racheli7736/Tickify) (ASP.NET Core, PostgreSQL) - there is no mock backend and no server logic
in the client.

- **Stack:** React 19 + TypeScript, Vite, React Router, Axios, Material UI (MUI) with a shared RTL theme, React Hook Form + Yup.
- **Language / layout:** Hebrew, right-to-left (RTL), responsive (mobile / tablet / desktop).
- **Design:** white background, navy `#142B49` for structure, gold `#C9A34E` for accents.

## Screens

| Screen | Route | Who | Status |
|---|---|---|---|
| Login | `/login` | visitors | done |
| Register | `/register` | visitors | planned |
| Events (server-side paging, filter, sort) | `/events` | logged in | planned |
| Event details + seat map + purchase (409 handling) | `/events/:id` | logged in | planned |
| My orders (+ cancel) | `/orders` | logged in | planned |
| Admin: events (list / create / edit / delete) | `/admin/events` | Admin | planned |
| Admin: categories | `/admin/categories` | Admin | planned |
| Admin: all orders | `/admin/orders` | Admin | planned |

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
