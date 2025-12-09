# HackMyWay — Project Summary

Project: HackMyWay — Hackathon discovery & management platform

Purpose: A student-focused web platform to discover, create, and manage hackathons. Includes organizer tools, user profiles, leaderboards, notifications, and AI-assisted features (Genkit/Google GenAI). This one-page summary is formatted for direct inclusion in a mini project report or for quick PDF export.

**Key Features**
- Browse and filter hackathons by date, tags and location
- Organizer dashboard for creating and managing events
- User profiles, saved events, and notifications
- Leaderboard and participation tracking
- AI utilities (validation/generation flows via Genkit + Google GenAI)
- Firebase-based authentication and Firestore-backed data

**Technical Stack**
- Framework: Next.js (App Router) — server + client components
- Language: TypeScript
- Styling: Tailwind CSS
- UI libraries: Radix UI, Lucide, Framer Motion
- Backend: Firebase (Auth, Firestore, Hosting)
- AI: Genkit with `@genkit-ai/google-genai` plugin

**Quick Setup & Build (developer)**
1. Install dependencies:
```bash
cd hackmywaycodebase
npm install
```
2. Add local environment variables in `.env.local` (see below). In development the project includes `src/firebase/config.ts` with example values; for production use Firebase Hosting or environment variables.
3. Run dev server:
```bash
npm run dev
```
4. Build for production:
```bash
npm run build
npm run start
```

**Required / Recommended Environment Variables**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `GENKIT_API_KEY` (server-side, optional)
- `GOOGLE_GENAI_API_KEY` (optional)

Security note: Do not commit secret keys. Use `.env.local` for local development and CI/CD secret stores for production deployment.

**Architecture (short)**
- Next.js App Router serves a server-rendered shell and hydrates client components for interactive UI.
- Firebase handles authentication and persistent data (Firestore).
- Genkit (with Google GenAI) provides AI flows and schema validation helpers.

**Known Issue / Debugging Tip**
- Hydration mismatch errors (message: "Hydration failed because the server rendered HTML didn't match the client") may appear during development. Common causes:
  - Browser extensions injecting attributes (test in incognito to rule out)
  - Non-deterministic server-side code (e.g., `Date.now()`, `Math.random()`)
  - Client-only code executed on the server
- Quick mitigation: run in incognito to identify extension issues; move dynamic logic into client components or use `suppressHydrationWarning` selectively as a temporary workaround.

**Deployment**
- The repository contains `firebase.json` and `apphosting.yaml`, indicating Firebase Hosting is the intended target. Typical flow:
```bash
firebase login
firebase deploy --only hosting
```

**Suggested Report Sections (copy/paste-ready)**
1. Introduction & Objective
2. System Architecture (diagram + explanation)
3. Technology Stack and Rationale
4. Implementation Highlights (authentication, event flow, AI integration)
5. Setup & Usage
6. Testing & Known Issues (include hydration note)
7. Conclusion & Future Work

If you want, I can also:
- Convert this markdown to a PDF for you, or provide a one-page PDF-ready layout (A4) with minor formatting tweaks.
- Produce a small Mermaid diagram of the architecture to paste into the report.

---

File: `hackmywaycodebase/REPORT_SUMMARY.md`
