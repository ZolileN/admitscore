# AdmitScore

South Africa's free APS calculator and university admissions matching engine.

## Features

- Calculate your APS from matric marks
- Match against programmes across UCT, Wits, UP, UJ, Stellenbosch, and UNISA
- Browse university and programme requirements
- Compare up to 3 programmes side by side
- Share results via link or WhatsApp
- Admin dashboard for updating programme APS and descriptions

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local`:

```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
ADMIN_SECRET=choose-a-strong-secret
```

If `TURSO_DATABASE_URL` is omitted locally, the app falls back to `file:./data/admitscore.db`.

### 3. Seed the database

Incremental seed (default — upserts universities and programmes):

```bash
npm run db:seed
```

Full reset seed:

```bash
SEED_MODE=reset npm run db:seed
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:seed` | Incremental database seed |
| `npm run db:push` | Push schema changes to the database |

## Admin

Visit `/admin` and sign in with your `ADMIN_SECRET` to update programme minimum APS scores and descriptions.

## Deployment

1. Set `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, and `ADMIN_SECRET` in your hosting provider
2. Run `npm run db:seed` against production Turso
3. Deploy with `npm run build`

## Project structure

- `src/app/calculate` — APS calculator
- `src/app/results` — match results
- `src/app/requirements` — university/programme requirements
- `src/app/compare` — programme comparison
- `src/app/admin` — admin dashboard
- `src/db/seed.ts` — database seed data
- `src/lib/match-logic.ts` — eligibility matching rules

## Notes

- Wits uses a Life Orientation cap of 4 points in APS calculations
- UNISA minimum APS requirements do not guarantee admission because programmes are space-limited
- Results URLs use subject slugs for stable shareable links
