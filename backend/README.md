# AI Job Radar Backend

FastAPI backend for resume parsing.

## Run locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The frontend reads `NEXT_PUBLIC_API_URL` and defaults to `http://127.0.0.1:8000`.

## Production

Docker:

```bash
docker build -t ai-job-radar-api .
docker run -p 8000:8000 --env-file .env ai-job-radar-api
```

Required environment variables:

```env
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=llama-3.3-70b-versatile
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

`ALLOWED_ORIGINS` accepts a comma-separated list.

## Endpoint

`POST /parse-resume`

Accepts `multipart/form-data`:

- `file`: `.pdf` or `.docx`

Returns extracted raw text and structured profile data.
