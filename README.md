# AI Job Radar

AI Job Radar is a premium SaaS landing page and MVP demo flow for a Career Intelligence platform powered by AI. It helps candidates understand market fit, compare opportunities, identify skill gaps, and generate a focused career report without feeling like an auto-apply tool.

## Product

- Premium dark SaaS landing page inspired by Vercel, Linear, Stripe, and OpenAI.
- Interactive `/demo` flow with resume upload, target role, location, and seniority.
- Premium loading state that simulates AI analysis.
- Mock `/report` dashboard with match score, job intelligence snapshot, ranked opportunities, key skills, salary estimate, work model, location, gaps, and downloadable text artifacts.
- Frontend-only MVP with clean client-side mock data.

## Stack

- Next.js App Router
- Tailwind CSS
- Framer Motion
- shadcn/ui-style primitives
- lucide-react
- TypeScript

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Build

```bash
npm run lint
npm run build
npm run start
```

## Project Structure

```text
app/
  page.tsx              Landing page
  demo/page.tsx         Demo intake flow
  generating/page.tsx   No-JS fallback loading bridge
  report/page.tsx       Career Intelligence report
backend/
  app/main.py           FastAPI app
  app/routes/           API routes, including POST /parse-resume
  app/services/         PDF/DOCX resume extraction and profile parsing
components/
  landing/              Hero, snapshot, and dashboard sections
  demo/                 Demo form and loading overlay
  report/               Report dashboard UI
  ui/                   Reusable shadcn-style primitives
lib/
  job-radar-client.ts   Mock client boundary for future API calls
  job-radar-types.ts    Shared report/request types
  profile-parser.ts     Local best-effort CV/profile extraction
  job-search.ts         Role-driven mock job search
  job-scorer.ts         Match scoring against profile and preferences
  resume-optimizer.ts   Role-specific resume guidance
  report-generator.ts   Report orchestration
  mock-report.ts        Compatibility wrapper around report generation
```

## Deploying

Recommended MVP deployment:

- Frontend: Vercel
- Backend API: Render, Railway, Fly.io, or any Docker host

The frontend and backend are separate services. The frontend calls the backend through `NEXT_PUBLIC_API_URL`.

### Backend on Render

The repo includes `render.yaml` and `backend/Dockerfile`.

1. Push this repository to GitHub.
2. In Render, choose **New > Blueprint** and select the repository.
3. Render will create `ai-job-radar-api` from `backend/Dockerfile`.
4. Add environment variables:

```env
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=llama-3.3-70b-versatile
ALLOWED_ORIGINS=https://your-ai-job-radar.vercel.app
```

5. Deploy and copy the backend URL, for example:

```text
https://ai-job-radar-api.onrender.com
```

Health check:

```text
https://ai-job-radar-api.onrender.com/health
```

### Frontend on Vercel

1. Import the repository in Vercel.
2. Keep the framework preset as `Next.js`.
3. Use build command: `npm run build`.
4. Add environment variable:

```env
NEXT_PUBLIC_API_URL=https://ai-job-radar-api.onrender.com
```

5. Deploy.

After Vercel gives you the frontend URL, update the backend `ALLOWED_ORIGINS` with that exact URL and redeploy/restart the backend.

### Local Production Smoke Test

```bash
npm run build
npm run start
```

Backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Connecting a FastAPI Backend Later

The resume parser backend is already scaffolded under `backend/`.

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The frontend calls `POST /parse-resume` with `multipart/form-data` and reads `NEXT_PUBLIC_API_URL`, defaulting to `http://127.0.0.1:8000`.

The rest of the app is intentionally structured around a narrow client boundary:

- `lib/job-radar-types.ts` defines the request and report shapes.
- `lib/job-radar-client.ts` currently generates mock reports after a 3-second delay.
- `components/demo/demo-form.tsx` calls `generateDemoReport(...)`.
- `components/report/report-view.tsx` renders a `JobRadarReport` object.

To connect full report generation later, replace the mock delay in `generateDemoReport` with a `fetch` call:

```ts
export async function generateDemoReport(request: DemoReportRequest) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analyze-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to generate report");
  }

  return (await response.json()) as JobRadarReport;
}
```

Recommended future backend endpoints:

- `POST /analyze-profile` for resume/profile analysis.
- `POST /search-jobs` for normalized public job search.
- `POST /optimize-resume` for resume recommendations.
- `GET /reports/{id}` for persisted reports.

Keep authentication, payments, and live job ingestion out of the MVP until the core report workflow is validated.
