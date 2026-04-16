# Padel Planner

Padel Planner is a full-stack admin tool for organising padel sessions, tracking player credit balances, and preparing manual WhatsApp and calendar notifications.

## Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- `shadcn/ui`-style component setup
- Supabase Auth + Postgres

## Features

- Email/password signup and login with Supabase Auth
- Auto-created `profiles` rows for new signups
- Single admin user determined by `ADMIN_EMAIL`
- Admin dashboard with player, session, and credit overview
- Admin players page for editing player details and topping up credit
- Admin courts page for managing venues and hourly rates
- Admin session booking flow with automatic cost split and credit deduction
- Session confirmation screen with:
  - WhatsApp deep links via `wa.me`
  - downloadable `.ics` calendar invite
- Player dashboard with current credit, upcoming sessions, and history
- Supabase RLS policies for admin/player access separation

## Environment variables

Create a `.env.local` file and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=
```

`ADMIN_EMAIL` should match the email address of the one account that should become the admin. When that user signs in, the app syncs their `profiles.role` to `admin`.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your Supabase project.

3. Run the SQL migration in [`supabase/migrations/001_init_padel_planner.sql`](supabase/migrations/001_init_padel_planner.sql).

You can apply it either with the Supabase CLI or by pasting it into the Supabase SQL editor.

4. Fill in `.env.local`.

5. Start the app:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000).

## Authentication flow

- Players sign themselves up from `/signup`
- A database trigger creates the matching `profiles` row using signup metadata
- Players are redirected to `/dashboard`
- The user whose email matches `ADMIN_EMAIL` is redirected to `/admin`

## Database notes

The migration creates:

- `profiles`
- `courts`
- `sessions`
- `session_players`
- `credit_transactions`

It also adds:

- RLS policies for admin and player access
- `handle_new_user()` trigger for auto profile creation
- `admin_add_credit()` RPC for atomic top-ups
- `admin_book_session()` RPC for transactional session booking and credit deductions

## Verification

The project has been checked with:

```bash
npm run typecheck
npm run lint
```

## Important implementation note

Because you chose the self-signup model, the admin players page manages existing signed-up players. It does not create brand-new auth users directly.
