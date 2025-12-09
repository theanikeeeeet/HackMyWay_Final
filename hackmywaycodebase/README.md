# HackMyWay — Hackathon discovery & management platform

HackMyWay is a full-stack Next.js application built as a hackathon discovery and management platform for students and organizers. It combines server-side rendering, client components, Firebase backend services, and Genkit (Google GenAI) integrations to provide search, profiles, event creation, and AI-assisted features.

**This README is written to serve as both a developer guide and as content for a mini project report.** Use the sections below (Overview, Architecture, Tech stack, Setup, Build & Run, Environment, Folder structure, Debugging notes, and License) directly in your report.

**Project Summary**
- **Name:** HackMyWay
- **Purpose:** Discover hackathons, manage events, register participants, and provide organizer tools. Includes AI-assisted features (Genkit + Google GenAI) and Firebase for authentication and data.
- **Primary audience:** Students and student-organizers in India (starter project for educational use).

**Key Features**
- Browse and filter hackathons
- Organizer dashboard to create and manage events
- User profiles and saved events
- Leaderboards and notifications
- AI features via Genkit (chat, generation helpers)
- Firebase-backed authentication and Firestore data storage

**Tech Stack & Libraries**
- Framework: Next.js (v15.x)
- Language: TypeScript
- Styling: Tailwind CSS
- UI primitives: Radix UI, Lucide icons, Framer Motion
- Backend / BaaS: Firebase (Auth, Firestore, Hosting)
- AI / LLM integration: Genkit (Google GenAI provider)
- Tooling: npm, tsc, next, next lint

**Quick Facts**
- Development server default port (dev): 9003
- Next dev uses Turbopack by default in `npm run dev` script

**Important NPM Scripts**
- `npm run dev` — Start the development server (port 9003 by default).
- `npm run build` — Build for production (`NODE_ENV=production npx next build`).
- `npm run start` — Start the Next.js production server.
- `npm run genkit:dev` — Start Genkit tooling for local AI development.
- `npm run lint` — Run Next.js / ESLint checks.
- `npm run typecheck` — Run `tsc --noEmit` type checking.

**Prerequisites**
- Node.js (recommend 18.x or later LTS)
- npm (or pnpm/yarn if you prefer — scripts assume `npm`)
- A Google Firebase project and credentials (for Auth / Firestore / Hosting)
- Genkit / Google GenAI credentials if you need AI features

**Setup (Local)**
1. Clone the repo and open the project folder:
```bash
cd /workspaces/HackMyWay_Final/hackmywaycodebase
```
2. Install dependencies:
```bash
npm install
```
3. Add environment variables (create a `.env.local` at the repo root or at `hackmywaycodebase/`) with the required keys (example names below). Do NOT commit secrets to git.

Example `.env.local` (replace values with your project keys):
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Genkit / Google GenAI (if used)
GENKIT_API_KEY=your_genkit_api_key
GOOGLE_GENAI_API_KEY=your_google_genai_key
```

4. Start development server:
```bash
npm run dev
```
Open `http://localhost:9003` (or the URL printed by the dev server).

**Build & Run (Production)**
```bash
npm run build
npm run start
```

**Folder Structure (high level)**
- `src/app/` — Next.js App Router, pages, layouts, and route handlers.
	- `layout.tsx` — Root layout (global HTML, fonts, providers)
	- `page.tsx` — Landing/home page
- `src/components/` — Reusable UI components (header/footer, UI primitives)
- `src/firebase/` — Firebase client/provider code and hooks
- `src/ai/` — Genkit/AI helper scripts and development flows
- `src/lib/` — Constants, utils, types, and seed data

**Deployment**
- This project includes `firebase.json` and `apphosting.yaml` indicating Firebase Hosting is the intended target. Typical flow:
	1. `firebase login`
	2. `firebase deploy --only hosting` (ensure project is configured)

**Debugging & Common Issues**
- Hydration errors: If you see messages like `Hydration failed because the server rendered HTML didn't match the client`:
	- Common causes: non-deterministic values (`Date.now()`, `Math.random()`), locale-specific formatting on server vs client, client-only code executed on server, or browser extensions that modify HTML (e.g., `webcrx` attributes injected by extensions).
	- Quick checks:
		1. Open the app in an incognito/private window (extensions are usually disabled there). If the error disappears, it's almost certainly an extension.
		2. Search the repo for uses of `Date`, `Math.random`, or `typeof window !== 'undefined'` inside server-rendered components and move such logic into client components (`'use client'`) or guard it with a client-only effect.
	- Short-term workaround: add `suppressHydrationWarning` to specific elements (e.g., `<html suppressHydrationWarning>`) to silence React warnings. This hides the mismatch and is not a true fix.

**Security & Secrets**
- Never commit `.env` files or secret keys. Use CI/CD secret stores for deployments.

**Environment variables (detected & recommended)**
- `NODE_ENV` — used by the app and by Firebase initialization checks (from code: `process.env.NODE_ENV`).
- `NEXT_PUBLIC_FIREBASE_API_KEY` — recommended for local builds when not using Firebase Hosting automatic init.
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `GENKIT_API_KEY` (recommended) — server-side key for Genkit integrations, if your Genkit setup requires one.
- `GOOGLE_GENAI_API_KEY` (recommended) — API key for Google GenAI when using the `@genkit-ai/google-genai` plugin.

Notes:
- The repo currently includes a `src/firebase/config.ts` file with a `firebaseConfig` object. In development that object is used directly; in production the code attempts `initializeApp()` without arguments so Firebase Hosting can inject the configuration via hosting environment variables. If you prefer to use `.env.local`, either replace `firebaseConfig` values with `process.env...` references or rely on Firebase Hosting for production credentials.
- Keep server-only keys out of `NEXT_PUBLIC_` variables; only expose what must be available to client code.

**Project Structure (detailed)**

```
hackmywaycodebase/
├── src/
│   ├── app/                          # Next.js App Router pages & layouts
│   │   ├── layout.tsx                # Root layout with fonts, providers, header/footer
│   │   ├── page.tsx                  # Landing/home page
│   │   ├── auth/
│   │   │   └── action/               # Server actions for auth flows
│   │   ├── create-hackathon/         # Organizer event creation page
│   │   ├── hackathons/               # Hackathon listing & detail pages
│   │   ├── leaderboard/              # Leaderboard page
│   │   ├── login/ & signup/          # Auth pages
│   │   ├── profile/                  # User profile pages
│   │   ├── (dashboard)/              # Dashboard layout group
│   │   │   ├── my-events/            # User's created events
│   │   │   ├── my-hackathons/        # User's registered hackathons
│   │   │   ├── notifications/        # Notifications page
│   │   │   ├── saved/                # Saved hackathons
│   │   │   └── profile/              # Profile settings
│   │   └── json-feed/                # JSON API endpoint for hackathon data
│   │
│   ├── components/                   # Reusable React components
│   │   ├── layout/
│   │   │   ├── header.tsx            # Navigation header
│   │   │   ├── footer.tsx            # Footer
│   │   │   └── providers.tsx         # Context providers (Firebase, themes, etc.)
│   │   ├── ui/                       # Radix UI + Tailwind components
│   │   │   ├── button.tsx, card.tsx, modal.tsx, etc.
│   │   ├── auth/
│   │   │   └── role-selector.tsx     # Role selection (student/organizer)
│   │   ├── hackathon-card.tsx        # Hackathon card component
│   │   ├── hackathon-tabs.tsx        # Tab navigation for hackathons
│   │   ├── filters.tsx               # Filter sidebar
│   │   ├── hero.tsx                  # Hero section
│   │   └── FirebaseErrorListener.tsx # Global Firebase error handler
│   │
│   ├── firebase/                     # Firebase integration
│   │   ├── config.ts                 # Firebase configuration
│   │   ├── provider.tsx              # Firebase context provider
│   │   ├── client-provider.tsx       # Client-side Firebase provider
│   │   ├── index.ts                  # Firebase initialization & SDK exports
│   │   ├── error-emitter.ts          # Error event emitter
│   │   ├── errors.ts                 # Error definitions
│   │   └── firestore/
│   │       ├── use-collection.ts     # Firestore collection hook
│   │       └── use-doc.ts            # Firestore document hook
│   │
│   ├── ai/                           # Genkit & AI flows
│   │   ├── genkit.ts                 # Genkit initialization with Google GenAI
│   │   ├── dev.ts                    # Development tools
│   │   └── flows/
│   │       └── hackathon-data-validation.ts  # AI validation flow
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-mobile.tsx            # Mobile detection hook
│   │   ├── use-saved-hackathons.ts   # Saved hackathons hook
│   │   └── use-toast.ts              # Toast notification hook
│   │
│   ├── lib/                          # Utilities & constants
│   │   ├── constants.ts              # App constants (routes, config)
│   │   ├── utils.ts                  # Helper utilities
│   │   ├── types.ts                  # TypeScript type definitions
│   │   ├── data.ts                   # Seed data & fixtures
│   │   ├── hackathon-data.json       # Sample hackathon data
│   │   └── placeholder-images.ts/json # Placeholder image references
│   │
│   └── globals.css                   # Global styles
│
├── package.json                      # NPM dependencies & scripts
├── tsconfig.json                     # TypeScript configuration
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── postcss.config.mjs                # PostCSS configuration
├── firebase.json                     # Firebase configuration (for hosting/functions)
├── apphosting.yaml                   # Google App Hosting configuration
├── firestore.rules                   # Firestore security rules
├── firestore.indexes.json            # Firestore index definitions
├── components.json                   # UI component configuration (Radix/shadcn)
└── next-env.d.ts                     # Next.js type declarations
```

**Key Components & Features Breakdown**

1. **Authentication & User Management**
   - Firebase Auth integration (email, Google OAuth, GitHub OAuth)
   - Role-based access (student vs. organizer)
   - User profile management and data persistence in Firestore
   - Non-blocking login and updates for better UX

2. **Hackathon Discovery & Management**
   - Browse and filter hackathons by date, category, difficulty
   - Save/bookmark favorite hackathons
   - Detailed hackathon pages with event info, registration, and leaderboard links
   - Organizer dashboard for creating and managing events

3. **AI Features (Genkit)**
   - Hackathon data validation flow using Google GenAI (Gemini 2.5 Flash)
   - Schema validation helpers for event creation
   - Extensible flow architecture for future AI features

4. **Real-time Updates & Notifications**
   - Firestore listeners for live data
   - Toast notifications for user actions
   - Error event emitter for centralized Firebase error handling

5. **Responsive UI**
   - Tailwind CSS for styling
   - Radix UI primitives for accessible components
   - Framer Motion for animations
   - Mobile-responsive design via `use-mobile` hook

**API Routes & Server Actions**

- `src/app/auth/action/` — Server actions for login, signup, password reset
- `src/app/json-feed/page.tsx` — JSON API endpoint for hackathon data (useful for integrations)
- Firebase REST API (via `firebase/` module) for real-time Firestore queries

**Firestore Data Schema (typical)**

```
/hackathons/
  {id}: {
    title, description, date, location, category, difficulty,
    organizer_id, registrations, tags, image_url, ...
  }

/users/
  {uid}: {
    name, email, role (student|organizer), profile_data, saved_hackathons, ...
  }

/registrations/
  {id}: {
    user_id, hackathon_id, registration_date, status, ...
  }
```

**Custom Hooks Reference**

- `useAuth()` — Get current Firebase Auth user
- `useUser()` — Get authenticated user's profile data
- `useFirestore()` — Access Firestore instance
- `useCollection()` — Hook for real-time Firestore collection queries
- `useDoc()` — Hook for real-time Firestore document queries
- `useMemoFirebase()` — Memoized Firestore queries
- `useMobile()` — Check if viewport is mobile
- `useSavedHackathons()` — Fetch user's saved hackathons
- `useToast()` — Trigger toast notifications

**Testing & QA Notes**

- **Unit testing**: No unit test files are currently committed. Add Jest + React Testing Library for component tests.
- **E2E testing**: Consider Playwright or Cypress for end-to-end testing (especially auth flows).
- **Firebase Emulator**: For local development without real Firebase, use:
  ```bash
  firebase emulators:start
  ```
- **TypeScript**: Run `npm run typecheck` to catch type errors before building.
- **Linting**: Run `npm run lint` to check for code style issues.

**Troubleshooting & Common Issues**

**Issue: "Cannot find module '@/...'**
- Solution: Path aliases are configured in `tsconfig.json`. Ensure your IDE recognizes them. Restart your TS server in VS Code (`Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server").

**Issue: Firebase initialization fails in development**
- Solution: Ensure `src/firebase/config.ts` has valid credentials or set `.env.local` with Firebase variables. In production, Firebase Hosting injects credentials automatically.

**Issue: Genkit flows not working**
- Solution: Ensure `GOOGLE_GENAI_API_KEY` is set. Run `npm run genkit:dev` to start the Genkit UI for debugging.

**Issue: CSS not applying (Tailwind)**
- Solution: Ensure `tailwind.config.ts` includes all template paths. Rebuild with `npm run build` or restart dev server.

**Issue: Auth redirect loops**
- Solution: Check Firebase redirect URLs in your Firebase Console. Ensure `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` matches.

**Performance Tips**

- Use `useMemoFirebase()` to avoid re-rendering with unchanged Firestore data.
- Lazy-load components with `next/dynamic` for heavy modules.
- Enable Turbopack in dev (already set in `npm run dev`).
- Use `next/image` for optimized images instead of `<img>`.
- Consider incremental static regeneration (ISR) for hackathon listing pages.

**What to include in a mini project report**
Use the sections above directly — they already map to a report structure. For an academic or mini-project report, include:
- Project objective and scope
- Architecture diagram (describe Next.js SSR + client components + Firebase + Genkit)
- Tech stack rationale
- Key implementation highlights (authentication, event management, AI integration example)
- Setup and run instructions (copy the Setup & Build sections)
- Testing and known issues (include the Hydration error note and how you mitigated it)
- Component overview and folder structure (use the detailed structure above)
- Custom hooks and API design notes

**Contributing**
- Fork and send a PR. Run `npm run lint` and `npm run typecheck` before opening PRs.
- Follow the existing code style (TypeScript, Tailwind conventions).
- Ensure new features include proper error handling and TypeScript types.

**License & Credits**
- This project is a learning/educational starter. Check repository license or add one if required by your institution.
- Credits: Built on a Next.js starter and Firebase Studio templates; UI primitives from Radix and Tailwind.
- AI features powered by Google Genkit and Gemini.

---

**Additional Resources**

- Next.js Docs: https://nextjs.org/docs
- Firebase Docs: https://firebase.google.com/docs
- Genkit Docs: https://firebase.google.com/docs/genkit
- Tailwind CSS: https://tailwindcss.com/docs
- Radix UI: https://www.radix-ui.com/docs

For more help, refer to individual tool documentation or open an issue in the repository.
