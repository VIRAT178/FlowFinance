# Flow Finance

Flow Finance is a full-stack finance portal built with React, Vite, Tailwind CSS, Express, and MongoDB. Users can register with email, sign in again later, edit their profile, and manage personal financial records that are stored in the backend.

## Features

- Email/password registration and sign-in.
- JWT-based session handling.
- Editable personal profile for each user.
- Dashboard summary cards, monthly trend, and category breakdown.
- Personal transaction CRUD with search, filtering, and sorting.
- MongoDB-backed persistence for users and transactions.
- Modern responsive UI with polished cards, charts, and account shell.

## Setup

```bash
npm install
npm run dev
```

This starts the Express API on port `3001` and the Vite frontend on port `5173`.

Create a `.env` file based on `.env.example` before running in production.

Required environment variables:

- `JWT_SECRET`
- `MONGODB_URI`
- `MONGODB_DB_NAME` (optional, defaults to `flow-finance`)

## Production Build

```bash
npm run build
npm start
```

The backend serves the built frontend from `dist/` when that folder exists.

## Demo Account

- Email: `demo@flowfinance.com`
- Password: `demo1234`

## Architecture

- Frontend API/session store: [src/context/FinanceContext.jsx](src/context/FinanceContext.jsx)
- Auth screen: [src/pages/Auth.jsx](src/pages/Auth.jsx)
- Profile editor: [src/pages/Profile.jsx](src/pages/Profile.jsx)
- Transactions workspace: [src/pages/Transactions.jsx](src/pages/Transactions.jsx)
- Backend server: [server/index.js](server/index.js)
- MongoDB setup: [server/db.js](server/db.js)

## Notes

- The frontend talks to the API through a Vite proxy at `/api`.
- All user data is scoped to the authenticated account.
- MongoDB data is persisted outside the app runtime.

## Vercel Deploy

This repository now deploys with Vercel using `vercel.json`.

1. Import the GitHub repository in Vercel.
2. Framework preset can remain `Other` (config is driven by `vercel.json`).
3. Create a MongoDB Atlas cluster and copy your connection string.
4. Add these environment variables in Vercel project settings:
	- `JWT_SECRET`
	- `MONGODB_URI` (Atlas connection string)
	- `MONGODB_DB_NAME` (for example `flow-finance`)
5. Deploy.

The Vercel API route (`api/index.js`) initializes the database connection once per runtime instance and reuses it for subsequent invocations.

