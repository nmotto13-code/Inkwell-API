# InkWell-API — Codebase Analysis

**Generated:** 2026-04-17  
**Version at analysis:** 1.1.0 → 1.2.0 (bumped)

---

## Project Purpose

InkWell is a full-stack journaling platform supporting multiple reflection "tracks" (emotional wellness, gratitude, productivity, habit tracking, dream journal, creative writing, family, self-discovery). Users create journal entries, organize them into journals/pages, track goals, and monitor habits — accessible on web and iOS/Android via Capacitor.

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ES modules) |
| Framework | Express.js v5.2.1 |
| Database | PostgreSQL via Prisma ORM v5.22.0 |
| Auth | Auth0 (`express-oauth2-jwt-bearer`) |
| Hosting | Railway (https://inkwell-api-production-91d6.up.railway.app) |

### Frontend
| Layer | Technology |
|-------|-----------|
| UI Library | React v18.2.0 |
| Build Tool | Vite v6.1.0 |
| Routing | React Router DOM v6.26.0 |
| Component Library | Radix UI (Shadcn-style) |
| Styling | TailwindCSS v3.4.17 |
| Server State | TanStack React Query v5.84.1 |
| Forms | React Hook Form v7.54.2 + Zod v3.24.2 |
| Mobile Wrapper | Capacitor v8.3.0 |
| Animations | Framer Motion |
| Charts | Recharts |
| Rich Text | React Quill |
| CI/CD (mobile) | Ionic AppFlow (appId: 97a73519) |

---

## Directory Structure

```
InkWell-API/
├── src/
│   ├── index.js                   # Express API entry point (port 3000)
│   ├── main.jsx                   # React SPA entry point
│   ├── App.jsx                    # Root component + React Router routes
│   ├── api/
│   │   └── inkwellApi.js          # API client + useApi() hook
│   ├── components/
│   │   ├── Layout.jsx             # App shell with nav
│   │   ├── OnboardingGate.jsx     # Protected onboarding route wrapper
│   │   ├── WriteDialog.jsx        # Entry creation dialog
│   │   ├── dashboard/             # Dashboard components
│   │   ├── entry/                 # Entry form components (mood, gratitude, habits, goals)
│   │   ├── progress/              # Goals & calendar components
│   │   └── ui/                    # Shared Radix/Shadcn UI primitives
│   ├── lib/
│   │   ├── AuthContext.jsx        # Auth0 state + user profile management
│   │   ├── prisma.js              # Prisma client singleton
│   │   ├── query-client.js        # React Query client config
│   │   ├── trackConfig.js         # Track definitions & mood options
│   │   └── utils.js               # cn() and other helpers
│   ├── middleware/
│   │   └── auth.js                # Auth0 JWT validation middleware
│   ├── mobile/pages/              # Mobile-specific onboarding pages
│   ├── pages/                     # Page-level React components (routes)
│   └── routes/                    # Express route handlers
│       ├── entries.js
│       ├── journals.js
│       ├── pages.js
│       ├── goals.js
│       ├── children.js
│       └── users.js
├── prisma/
│   └── schema.prisma              # All DB models
├── ios/                           # Capacitor iOS Xcode project
├── dist/                          # Vite build output
├── scripts/                       # DB migration scripts
├── package.json                   # v1.2.0 — monorepo (backend + frontend)
├── vite.config.js
├── capacitor.config.ts            # appId: com.inkwell.app
├── appflow.config.json
├── tailwind.config.js
└── index.html                     # SPA shell
```

---

## API Endpoints

**Base URL (prod):** `https://inkwell-api-production-91d6.up.railway.app`  
**Auth:** All `/api/*` routes require `Authorization: Bearer <Auth0 JWT>`. Only `GET /health` is public.

### Entries
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/entries` | List entries (paginated; filter by track/mood) |
| GET | `/api/entries/:id` | Get single entry |
| POST | `/api/entries` | Create entry |
| PUT | `/api/entries/:id` | Update entry |
| DELETE | `/api/entries/:id` | Delete entry |

### Journals
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/journals` | List journals (with latest page) |
| GET | `/api/journals/:id` | Get journal with all pages |
| POST | `/api/journals` | Create journal |
| PUT | `/api/journals/:id` | Update journal |
| DELETE | `/api/journals/:id` | Delete journal (cascades to pages) |

### Pages
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/pages` | List all user pages |
| GET | `/api/journals/:journalId/pages` | Pages for a journal |
| POST | `/api/journals/:journalId/pages` | Create page in journal |
| GET | `/api/pages/:id` | Get single page |
| PUT | `/api/pages/:id` | Update page |
| DELETE | `/api/pages/:id` | Delete page |

### Goals
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/goals` | List goals |
| POST | `/api/goals` | Create goal |
| PUT | `/api/goals/:id` | Update goal |
| DELETE | `/api/goals/:id` | Delete goal |

### Children (Family Track)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/children` | List child profiles |
| POST | `/api/children` | Create child profile |

### Users
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/me` | Get user profile |
| POST | `/api/users/me` | Create/upsert user (onboarding) |
| PATCH | `/api/users/me` | Update profile |
| PATCH | `/api/users/me/settings` | Update settings (daily_play_goal_minutes) |
| PATCH | `/api/users/me/mobile-onboarding` | Update mobile onboarding status |

---

## Database Models (Prisma / PostgreSQL)

### JournalEntry
Standalone journal entries (not inside a journal).  
Key fields: `id`, `user_id`, `track`, `title`, `content`, `mood`, `gratitude_items[]`, `goals (JSON)`, `habits (JSON)`, `tags[]`, `is_private`, `entry_date`.

### Journal
Container for pages.  
Key fields: `id`, `user_id`, `track`, `name`, `description`, `cover_emoji`.  
Relations: `pages[]` (one-to-many → Page, cascade delete).

### Page
A page within a Journal. Same data shape as JournalEntry plus `journal_id` FK.

### JournalingGoal
Progress goals.  
Key fields: `title`, `target_type`, `target_value`, `track`, `completed`, `completed_date`.

### UserProfile
Auth0-linked user record from onboarding.  
Key fields: `user_id` (unique, Auth0 sub), `enrolled_tracks[]`, `onboarding_completed`, `track_sensitivity (JSON)`, `daily_play_goal_minutes`.

### ChildProfile
Family track child data.  
Key fields: `name`, `birthdate`, `known_allergens[]`, `developmental_focus[]`, `profile (JSON)`.

---

## Authentication

- **Provider:** Auth0 (`dev-gh1ftkwgayfwa5e1.us.auth0.com`)
- **Audience:** `https://api.inkwell.app`
- **Algorithm:** RS256
- **Backend:** `express-oauth2-jwt-bearer` validates JWT; `req.auth.payload.sub` = user ID
- **Frontend:** `AuthContext.jsx` wraps app; tokens retrieved via `getAccessTokenSilently()`
- **Mobile:** Capacitor callback scheme `com.inkwell.app` for Auth0 redirect
- **Offline cache:** Capacitor Preferences stores profile data locally

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Railway PostgreSQL connection string |
| `AUTH0_DOMAIN` | Auth0 tenant domain |
| `AUTH0_AUDIENCE` | Auth0 API audience |
| `VITE_AUTH0_DOMAIN` | Auth0 domain (frontend) |
| `VITE_AUTH0_CLIENT_ID` | Auth0 client ID (frontend) |
| `VITE_AUTH0_CALLBACK_SCHEME` | Mobile OAuth callback scheme |
| `VITE_API_URL` | Production API base URL |
| `ALLOWED_ORIGINS` | CORS allowlist (comma-separated) |
| `PORT` | API server port (default 3000) |

---

## Journaling Tracks

1. Emotional Wellness
2. Gratitude
3. Productivity
4. Habit Tracking
5. Dream Journal
6. Creative Writing
7. Family
8. Self Discovery

**Mood options:** Joyful, Calm, Hopeful, Sad, Anxious, Angry, Tired, Confused

---

## Architecture Notes

- **Monorepo:** Backend API + frontend SPA share `package.json` and `node_modules`
- **Dual entry model:** `JournalEntry` (standalone) and `Page` (journal-bound) share nearly identical schemas for flexibility
- **User-scoped queries:** Every DB query filters by `user_id` from the JWT — no cross-user data leakage
- **JSON fields:** `goals`, `habits`, `track_sensitivity` stored as JSON for schema-free evolution
- **Cascade deletes:** Journal → Pages auto-cascade via Prisma relation config
- **Platform detection:** Frontend detects Capacitor vs web to switch Auth0 redirect URI
- **Base44 plugin:** Vite integration for runtime analytics and visual editing (dev tool)
- **Mobile CI/CD:** Ionic AppFlow handles automated iOS builds from this repo

---

## Version History (tracked in package.json)

| Version | Notes |
|---------|-------|
| 1.0.x | Initial build |
| 1.1.0 | Onboarding flow fixes, iOS build pipeline restored |
| **1.2.0** | Analysis file added, version bump |
