# HackMyWay_Final

A comprehensive hackathon discovery and management platform for Indian students and organizers.

## Quick Links

- **Full Developer Guide**: See [`hackmywaycodebase/README.md`](hackmywaycodebase/README.md) for complete setup, build, and deployment instructions.
- **Project Summary (for Reports)**: See [`hackmywaycodebase/REPORT_SUMMARY.md`](hackmywaycodebase/REPORT_SUMMARY.md) for a one-page summary formatted for mini project reports and PDF export.

## Overview

HackMyWay is a Next.js + Firebase full-stack application that enables:
- Browsing and filtering hackathons
- Organizer dashboards for event creation and management
- User profiles, saved events, and notifications
- Leaderboards and AI-assisted features (Genkit + Google GenAI)

**Tech Stack**: Next.js 15, TypeScript, Tailwind CSS, Radix UI, Firebase, Genkit

## Getting Started

```bash
cd hackmywaycodebase
npm install
npm run dev
```

For production build:
```bash
npm run build
npm run start
```

Deployment to Firebase Hosting:
```bash
firebase login
firebase deploy --only hosting
```

See [`hackmywaycodebase/README.md`](hackmywaycodebase/README.md) for detailed environment setup, debugging, and deployment steps.