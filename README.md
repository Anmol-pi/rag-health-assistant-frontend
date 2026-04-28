# MedAI — Intelligent Medical Diagnostic Assistant

This is a premium, production-grade frontend built for the MedAI Hybrid RAG-XGBoost Diagnostics pipeline.

## Features

- **Beautiful Modern UI:** ChatGPT + PowerBI hybrid feel with glassmorphism and smooth Framer Motion animations.
- **AI Medical Assistant:** Symptom extraction, diagnosis prediction, and interactive follow-up Q&A.
- **Real-time Streaming:** LLM responses are streamed chunk-by-chunk for an immediate, responsive experience.
- **Analytics Dashboard:** Visualizes your historical diagnoses, disease frequency, and RAG-verification rates with Recharts.
- **Bring Your Own Key:** Securely supply your own Gemini API key for personalized quota, saved only in local storage.
- **Dark/Light Mode:** First-class support for both themes with an elegant transition.
- **Full History Tracking:** All sessions are persistently saved locally and exportable.

## Technology Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Recharts
- Zustand (Persisted State Management)
- Axios & Fetch Streams

## Getting Started Locally

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file based on the example:
```bash
cp .env.example .env.local
```

3. Ensure your environment variables are set correctly:
```env
NEXT_PUBLIC_API_URL=https://medai-backend-production-a830.up.railway.app
NEXT_PUBLIC_API_KEY=key1
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Vercel Deployment Guide

Deploying the MedAI frontend to Vercel is extremely straightforward, as it is natively optimized for the platform.

### Step 1: Push to GitHub
Commit your project and push it to a repository on GitHub (or GitLab/Bitbucket).

```bash
git add .
git commit -m "Initial commit for MedAI frontend"
git branch -M main
git remote add origin https://github.com/yourusername/medai-frontend.git
git push -u origin main
```

### Step 2: Import to Vercel
1. Log in to [Vercel](https://vercel.com/)
2. Click **Add New...** > **Project**
3. Import the `medai-frontend` repository.
4. If your project is inside a subfolder (e.g., `frontend`), set the **Root Directory** to `frontend`.

### Step 3: Configure Environment Variables
In the Vercel deployment settings, under **Environment Variables**, add the following:

- `NEXT_PUBLIC_API_URL` = `https://medai-backend-production-a830.up.railway.app`
- `NEXT_PUBLIC_API_KEY` = `key1`

*Note: You do not need to provide an admin key or a server-level Gemini key here. The backend already handles this, and the user can provide their own Gemini key on the client side in the Settings panel.*

### Step 4: Deploy
Click **Deploy**. Vercel will automatically build the Next.js application and provide you with a production URL in minutes.

## Railway Backend Integration

The frontend seamlessly connects to the Railway backend deployment (`https://medai-backend-production-a830.up.railway.app`).

**Security Model:**
- The frontend only passes the generic `X-Api-Key` to verify authorization against the backend. 
- It **never** uses or requires `ADMIN_API_KEY`.
- If the user provides a custom Gemini API Key in the Settings, the frontend transmits it safely via the `X-Gemini-Key` header, exactly as the backend expects for custom model overrides.
- This prevents Invalid API Key collisions while cleanly separating authentication from AI generation limits.
