# ClinicQueue — Multilingual Clinic Operations & Queue Management SaaS

> Designed for independent doctors and small outpatient clinics in Tier-2 and Tier-3 cities in India.  
> Aligned with **PRD v1.0** and **TRD v1.0**.

---

## 🏗️ Repository Architecture

In accordance with TRD v1.0, the codebase is cleanly partitioned into modular frontend and backend applications:


```text
ClinicQueue/
├── backend/                       # Node.js + Express + TypeScript + Prisma ORM
│   ├── prisma/
│   │   └── schema.prisma          # PostgreSQL relational schema matching TRD §6
│   ├── src/
│   │   ├── config/                # Environment variables & constants
│   │   ├── database/              # MemoryStore & PostgreSQL connection layer
│   │   ├── middleware/            # JWT auth & RBAC (Owner, Receptionist, Doctor, Patient)
│   │   ├── modules/
│   │   │   ├── auth/              # Login, me, token issuance
│   │   │   ├── clinics/           # Clinic profiles, schedules, doctors
│   │   │   ├── appointments/      # Slot generation, booking, duplicate check
│   │   │   ├── queue/             # Concurrency-safe atomic token generator & wait times
│   │   │   ├── patients/          # MRN generation, search, patient history
│   │   │   ├── visits/            # Consultations, Rx, diagnoses, follow-up dates
│   │   │   ├── notifications/     # WhatsApp Business templates, delivery status, webhook
│   │   │   └── analytics/         # Daily (7/30d), weekly (8/12w), monthly (6/12m) metrics
│   │   ├── app.ts                 # Express REST API application
│   │   └── server.ts              # Server bootstrap on port 5000
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                      # React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
│   ├── public/
│   ├── src/
│   │   ├── context/               # ThemeContext (theme + language), AuthContext, ToastContext
│   │   ├── i18n/                  # Complete translations for English, Hindi (हिंदी), Kannada (ಕನ್ನಡ)
│   │   ├── layouts/
│   │   │   ├── PublicLayout.tsx   # Modern public clinic website header, language bar, footer
│   │   │   └── MainLayout.tsx     # Operations dashboard layout for Receptionist, Doctor, Owner
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   │   ├── LandingPage.tsx           # Full clinic landing website with live queue widget
│   │   │   │   ├── PublicQueue.tsx           # Interactive token tracker with progress stepper
│   │   │   │   ├── BookAppointmentPublic.tsx # Online appointment booking & WhatsApp alert
│   │   │   │   └── TvQueueDisplay.tsx        # High-contrast waiting lounge TV display board
│   │   │   ├── dashboard/         # Owner overview & reception status
│   │   │   ├── queue/             # Token call/next/skip management
│   │   │   ├── appointments/      # Clinic booking management
│   │   │   ├── doctor/            # Doctor workspace: prescription writing & history
│   │   │   └── analytics/         # Charts with Recharts for daily/weekly/monthly visits
│   │   ├── App.tsx                # Unified routing
│   │   └── index.css              # Custom healthcare palette, glassmorphism, animations
│   ├── tailwind.config.js         # Curated medical teal, dark mode slate, and glow effects
│   ├── vite.config.ts
│   └── package.json
│
├── PRD                            # Product Requirements Document v1.0
├── TRD                            # Technical Requirements Document v1.0
└── package.json                   # Root orchestrator scripts
```

---

## 🎨 Visual Aesthetics & Palette Enhancements

As requested, the website styling has been completely modernized with:
- **Curated Healthcare Palette**:
  - **Medical Teal & Emerald** (`#0D9488`, `#14B8A6`, `#10B981`) for vitality, hygiene, and active queue indicators.
  - **Deep Slate & Midnight Navy** (`#0A0F1D`, `#0F172A`, `#1E293B`) for a sleek dark mode.
  - **Cyan Accents** (`#06B6D4`) for child health / pediatric services.
  - **Soft Amber / Coral** for queue status and delay warnings.
- **Glassmorphism & Micro-Animations**:
  - `backdrop-blur-md` glass cards with ambient gradients.
  - Pulsing live consultation indicator badges.
  - Framer-motion interactive token progress tracker.
  - Hover micro-animations on doctor cards and action buttons.

---

## 🌐 Multilingual Support (PRD FR-20)

Integrated three primary languages for Tier-2 & Tier-3 clinics in India:
1. **English (EN)**
2. **हिंदी (HI)**
3. **ಕನ್ನಡ (KN)**

Instant language switching is accessible directly from the top navigation bar of both the Public Clinic Website and Staff Operations Dashboard.

---

## 🚀 Quick Start Guide

### 1. Run the Backend API (Port 5000)
```bash
cd backend
npm run dev
```
*Health Check: http://localhost:5000/health*  
*API Discovery: http://localhost:5000/api/v1*

### 2. Run the Frontend Website (Port 5173)
```bash
cd frontend
npm run dev
```
*Public Website: http://localhost:5173*  
*Live Queue Tracker: http://localhost:5173/public/queue*  
*Book Appointment: http://localhost:5173/public/book*  
*Waiting Lounge TV Display: http://localhost:5173/public/tv*  
*Staff Portal: http://localhost:5173/portal*


ClinicQue
