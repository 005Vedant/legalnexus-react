# LegalNexus

Monorepo scaffold: frontend (React + Vite + TypeScript) and backend (Express + Supabase).

Quick start:

1. Create a Supabase project and set env vars in your shell or .env files:

- `SUPABASE_URL` and `SUPABASE_KEY` for backend
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` for frontend

2. Install dependencies:

```
npm install
cd frontend && npm install
```

3. Run services:

```
npm run start:backend
cd frontend && npm run dev
```

Files of interest:

- [backend/index.js](backend/index.js)
- [backend/routes/lawyers.js](backend/routes/lawyers.js)
- [frontend/src/App.tsx](frontend/src/App.tsx)
