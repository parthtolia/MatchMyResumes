# MatchMyResumes ATS Resume & Cover Letter Optimization Suite

A production-ready SaaS platform that helps job seekers optimize resumes and generate tailored cover letters using AI.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Clerk |
| **Backend** | FastAPI (Python 3.11), Pydantic v2, SQLAlchemy async |
| **Database** | PostgreSQL + pgvector (via Supabase) |
| **AI** | OpenAI GPT-4o + text-embedding-3-small |
| **Payments** | Stripe (subscriptions + webhooks) |
| **Auth** | Clerk |
| **Deploy** | Vercel (frontend) · Azure Web App (backend) |

---

## Project Structure

```
MatchMyResumes/
├── backend/
│   ├── app/
│   │   ├── core/         # config.py, database.py, security.py
│   │   ├── models/       # SQLAlchemy models (7 tables)
│   │   ├── schemas/      # Pydantic v2 schemas
│   │   ├── services/     # resume_parser, jd_parser, embedding, AI, Stripe
│   │   ├── scoring/      # ats_scorer.py (5-component engine)
│   │   ├── routes/       # API route handlers
│   │   └── main.py       # FastAPI app entry
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # Landing page
│   │   ├── dashboard/             # Protected dashboard
│   │   │   ├── page.tsx           # Dashboard home
│   │   │   ├── scan/              # Resume ATS scanner
│   │   │   ├── optimize/          # AI optimizer
│   │   │   ├── cover-letter/      # Cover letter generator
│   │   │   ├── resumes/           # Version manager
│   │   │   ├── tracker/           # Kanban job tracker
│   │   │   └── settings/          # Account settings
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── components/
│   │   ├── ScoreCircle.tsx        # Animated SVG score
│   │   ├── KeywordHeatmap.tsx     # Keyword gap badges
│   │   └── dashboard/Sidebar.tsx  # Nav sidebar
│   ├── lib/
│   │   ├── api.ts                 # Axios + Clerk auth
│   │   └── utils.ts               # Helpers
│   ├── middleware.ts               # Clerk route protection
│   └── vercel.json                # API rewrites to Azure
└── docker-compose.yml             # Local dev with pgvector
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL with pgvector extension (use Supabase free tier)
- OpenAI API key
- Clerk account (free)
- Stripe account (test mode)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Copy and fill in env vars
copy .env.example .env
# Edit .env with your keys

# Run the server
uvicorn app.main:app --reload --port 8000
```

The API will be at `http://localhost:8000`  
Interactive docs at `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Copy and fill in env vars
copy .env.example .env.local
# Edit .env.local with your Clerk + API keys

# Install dependencies
npm install

# Run dev server
npm run dev
```

The app will be at `http://localhost:3000`

### 3. Docker (Full Stack)

```bash
# From project root
copy .env.example .env  # Fill in all keys

docker-compose up --build
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@host/db` |
| `OPENAI_API_KEY` | OpenAI API key |
| `SUPABASE_JWT_SECRET` | From Supabase → Settings → API |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook dashboard |
| `STRIPE_PRICE_PRO` | Price ID for Pro plan |
| `STRIPE_PRICE_PREMIUM` | Price ID for Premium plan |
| `ALLOWED_ORIGINS` | Comma-separated frontend URLs |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |

---

## Database Setup (Supabase)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Enable `pgvector` extension: **Database → Extensions → vector**
3. Copy the connection string from **Settings → Database**
4. Set `DATABASE_URL` in your `.env`
5. Tables are auto-created on first backend startup via `init_db()`

---

## ATS Scoring Engine

| Component | Weight | Description |
|---|---|---|
| Keyword Match | 40% | TF-IDF extraction, top-30 keywords vs resume |
| Semantic Similarity | 25% | Cosine similarity of OpenAI embeddings |
| ATS Formatting | 15% | No tables, standard headers, appropriate length |
| Section Completeness | 10% | Experience, Education, Skills present |
| Quantification | 10% | Numbers, %, $, metrics detected |

---

## Subscription Plans

| Plan | Price | Limits |
|---|---|---|
| Free | $0 | 2 scans/month, basic scoring only |
| Pro | $19/month | Unlimited scans, AI optimization, cover letters |
| Premium | $39/month | Everything + LinkedIn optimization, analytics |

---

## Stripe Webhook Configuration

1. Install Stripe CLI: `stripe listen --forward-to localhost:8000/api/subscriptions/webhook`
2. In production, set webhook endpoint to: `https://your-backend.azurewebsites.net/api/subscriptions/webhook`
3. Subscribe to events: `customer.subscription.*`, `invoice.payment_*`

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npx vercel --prod

# Set environment variables in Vercel Dashboard:
# NEXT_PUBLIC_API_URL=https://your-backend.azurewebsites.net
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
# CLERK_SECRET_KEY=...
```

Update `vercel.json` → change the `destination` URL to your Azure backend.

### Backend → Azure Web App

```bash
cd backend

# Build Docker image
docker build -t matchmyresumes-api .

# Push to Azure Container Registry
az acr build --registry yourregistry --image matchmyresumes-api .

# Deploy to Azure Web App (configure App Settings with all env vars)
az webapp create --resource-group myRG --plan myPlan --name matchmyresumes-api \
  --deployment-container-image-name yourregistry.azurecr.io/matchmyresumes-api
```

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/resumes/upload` | POST | Upload PDF/DOCX resume |
| `/api/resumes/score` | POST | Compute ATS score |
| `/api/resumes/optimize` | POST | AI-optimize resume (Pro+) |
| `/api/jobs/` | POST | Save job description |
| `/api/cover-letters/` | POST | Generate cover letter (Pro+) |
| `/api/applications/` | GET/POST | Application tracker |
| `/api/subscriptions/checkout` | POST | Create Stripe checkout |
| `/api/subscriptions/webhook` | POST | Stripe webhook handler |
| `/api/admin/stats` | GET | Admin dashboard stats |

Full interactive docs at `/docs` (development mode only).

---

## Security

- JWT verification for all protected routes (Supabase or Clerk)
- Stripe webhook signature verification
- File type validation (PDF/DOCX only, 10MB max)
- Input sanitization on all routes
- Rate limiting (60 req/min general, 10 req/min AI)
- CORS restricted to allowed origins
- Non-root Docker user
- Environment variables for all secrets

---

## License

MIT © 2026 MatchMyResumes
