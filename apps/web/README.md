# CallMind AI — Real Estate Intelligence Platform

> AI-powered lead qualification, conversation management, and appointment booking for modern real estate agencies.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aenvsgdsn/callmindai)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Overview

**CallMind AI** is a full-stack SaaS platform that automates the real estate lead qualification lifecycle. It handles inbound inquiries via voice, SMS, and email, qualifies leads using AI-generated strategies, and books appointments — all while keeping human agents fully in control.

### Key Capabilities

| Feature | Description |
|---|---|
| 🤖 **AI Conversations** | Autonomous multi-channel outreach (SMS, Email, Voice) with real-time sentiment analysis |
| 📋 **Lead Management** | Full lead pipeline with intent scoring, source tracking, and agent assignment |
| 🧠 **Strategy Engine** | AI-generated engagement strategies with human approval before execution |
| 📅 **Appointment Booking** | Automated scheduling for viewings, consultations, and contract signings |
| 📊 **Analytics Dashboard** | Revenue tracking, conversion funnels, lead sources, and agent performance |
| ⚙️ **Settings & Integrations** | CRM, MLS, Twilio, Calendar, DocuSign, and Stripe integrations |

---

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **Language:** TypeScript 5
- **Styling:** Vanilla CSS with glassmorphism design system
- **Icons:** [Lucide React](https://lucide.dev)
- **Deployment:** [Vercel](https://vercel.com)

---

## Project Structure

```
CallMind/
├── apps/
│   └── web/                    # Next.js web application
│       ├── src/
│       │   └── app/
│       │       ├── page.tsx        # Marketing / landing page
│       │       ├── dashboard/
│       │       │   └── page.tsx    # Full dashboard (all sections)
│       │       ├── globals.css     # Design system + responsive styles
│       │       └── layout.tsx      # Root layout
│       ├── public/             # Static assets
│       ├── next.config.ts
│       └── package.json
├── packages/                   # Shared packages (future)
├── services/                   # Backend services (future)
├── vercel.json                 # Vercel deployment config
└── .gitignore
```

---

## Dashboard Sections

The dashboard (`/dashboard`) is a fully client-side SPA with 7 navigable sections:

1. **Dashboard** — KPI stats, weekly engagement chart, conversion funnel, recent leads
2. **Leads** — Full leads table with filter chips, intent scores, and slide-up detail panel
3. **Conversations** — AI chat threads with per-message history, sentiment badges, and back-navigation on mobile
4. **Strategies** — AI-generated engagement plans with expandable steps, risk flags, and approve/reject workflow
5. **Appointments** — List + calendar view of viewings, consultations, signings with status tracking
6. **Analytics** — Revenue trend, channel breakdown, funnel, top agents, and 6 KPI cards
7. **Settings** — Profile, Agency, Notifications, AI config, Integrations, Security, Billing tabs

---

## Getting Started (Local)

```bash
# 1. Clone the repository
git clone https://github.com/aenvsgdsn/callmindai.git
cd callmindai

# 2. Install dependencies
cd apps/web
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page  
Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the app

---

## Deploying to Vercel

This repo is pre-configured for Vercel via `vercel.json`.

### One-click deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aenvsgdsn/callmindai)

### Manual deploy via Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

### Deploy via Vercel Dashboard
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `https://github.com/aenvsgdsn/callmindai`
3. Vercel auto-detects the `vercel.json` — no manual config needed
4. Click **Deploy**

> **Root Directory** is set to `apps/web` in `vercel.json` automatically.

---

## Design System

CallMind uses a custom glassmorphism design system defined entirely in `globals.css`:

- **Glass cards** — frosted glass surfaces with blur + saturate backdrop filters
- **Color tokens** — violet (`#7c3aed`), sky (`#0ea5e9`), emerald (`#10b981`), amber (`#f59e0b`)
- **Typography** — Inter via system font stack
- **Animations** — `fadeInUp`, `float`, `slideUp` keyframes
- **Mobile** — Full responsive layout; sidebar collapses to a bottom tab bar on `≤ 768px`

---

## Responsive Design

| Breakpoint | Layout |
|---|---|
| `> 768px` | Left sidebar + main content |
| `≤ 768px` | Bottom tab navigation bar (62px), full-width sections |
| `≤ 420px` | Compact typography and tighter padding |

Mobile-specific behaviours:
- **Conversations:** tap a thread → list hides, full-screen chat opens with ← Back button
- **Leads:** tap a row → detail panel slides up from the bottom
- **Settings:** tabs become a horizontal scrollable pill strip

---

## Roadmap

- [ ] Real backend with Supabase / PostgreSQL
- [ ] Twilio integration for live SMS/Voice
- [ ] OpenAI GPT-4 strategy generation
- [ ] CRM sync (Salesforce, HubSpot)
- [ ] MLS property listing integration
- [ ] Mobile native app (React Native)

---

## License

MIT © 2026 CallMind AI
