# Kinsage - Private AI-Powered Family Intelligence Vault

Kinsage is a private AI-powered family intelligence vault that transforms family memories, stories, voice recordings, photos, traditions, experiences, and life lessons into a searchable, structured, and interactive knowledge system.

## Core Features

- **Private Family Vault**: Secure storage for text stories, images, voice interviews, and document uploads secured by PostgreSQL Row Level Security (RLS) policies.
- **AI Processing Pipeline**: Built-in Whisper audio transcription, GPT entity extraction (people, locations, dates, life lessons), and automatic timeline milestone plotting.
- **RAG Family Companion**: An interactive AI archivist that answers questions using your family's unique memory database, providing precise cited source cards.
- **Vector Search (pgvector)**: Fast semantic searches allowing you to query abstract concepts like "Arthur's business advice" instead of exact keywords.
- **Interactive Family Tree**: A visual custom SVG tree canvas featuring generational layouts, pan/zoom canvas controls, and member story profile slide-outs.
- **Dynamic Chronological Timeline**: Searchable milestones displaying family history, weddings, births, and accomplishments mapped automatically from archives.
- **Sandbox Developer Utilities**: A quick "Reset & Seed Demo Data" dashboard button that clears your active vault tables and instantly preloads a realistic 3-generation Sterling family tree with stories and embeddings.

---

## Technology Stack

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion (animations)
- **Database**: Supabase (PostgreSQL, pgvector, Auth, Storage)
- **AI Models**: OpenAI API (Whisper-1, GPT-4o-mini, text-embedding-3-small)
- **State Management**: TanStack React Query

---

## Environment Variables

Copy `.env.example` to `.env.local` and configure your credentials:

```bash
cp .env.example .env.local
```

### Required Keys:

```ini
# Supabase Project API Settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI API Key for transcriptions, insights, and vector embeddings
OPENAI_API_KEY=sk-proj-yourOpenAiApiKeyHere...

# App URL for Auth Confirmation Redirection
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Database Migrations & Storage Setup

Supabase handles tables, storage buckets, RLS, and embeddings search functions. Follow these steps to configure your database:

### 1. Enable pgvector & Tables
Go to your **Supabase Dashboard -> SQL Editor** and run the contents of the schema migration script:
`supabase/migrations/01_schema.sql`

This script will:
- Enable the `vector` extension.
- Create tables: `users`, `families`, `family_members`, `memories`, `relationships`, `timeline_events`, `conversations`, and `messages`.
- Enable **Row Level Security (RLS)** on all tables.
- Establish standard select/insert/update/delete security policies.
- Configure public storage buckets: `avatars`, `photos`, `audio`, and `documents` with access rules.
- Set up the vector similarity search function `match_memories`.

### 2. (Optional) Run SQL Seeds
To pre-seed a default sandbox user and family in the database manually, execute the contents of:
`supabase/migrations/02_seeds.sql`

*Note: You can also easily populate your vault with demo data directly inside the application during Onboarding or in the Settings dashboard tab.*

---

## Local Development Guide

To run the application locally:

### 1. Install Dependencies
Run npm install using the portable Node.js runtime path or standard node:

```bash
npm install
```

### 2. Configure Environment variables
Set up your `.env.local` file with active OpenAI and Supabase credentials.

### 3. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Create an Account
1. Go to the Sign Up screen.
2. Sign up with an email and password.
3. You will be redirected to Onboarding.
4. Name your Family Vault, tick **"Preload Sterling Family Demo Data"**, and submit.
5. You are ready to explore the dashboard overview, vault archives, visual tree, and RAG chat companion instantly.

---

## Production Deployment Guides

### Vercel Deployment

Kinsage is fully optimized for Vercel App Router deployment:

1. Push your code to a GitHub repository.
2. Go to [Vercel Dashboard](https://vercel.com) and click **Add New -> Project**.
3. Select your Kinsage repository.
4. Configure the **Environment Variables** matching your `.env.local` settings.
5. Click **Deploy**. Vercel will automatically build the Next.js routes and deploy.

*Important: Make sure to update the `NEXT_PUBLIC_APP_URL` variable in Vercel to match your production domain (e.g. `https://your-app.vercel.app`) so magic links and auth callbacks redirect correctly.*

### Netlify Deployment

To deploy to Netlify:

1. Install the `@netlify/plugin-nextjs` if deploying manually, or let Netlify auto-detect the Next.js app.
2. Create a new site from Git in Netlify.
3. Set the build command to `npm run build` and publish directory to `.next`.
4. Add your **Environment Variables** in the Netlify site configuration panel.
5. Trigger a deployment. Netlify will build the serverless actions and host the client pages.
