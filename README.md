# MVP B2B Issue Tracker

A web-based ticketing system built for managing B2B issues efficiently with role-based access control (RBAC).

## 🚀 Key Features

- **Authentication & RBAC**: Session management powered by Auth.js (NextAuth) with role-tailored access (`CLIENT` and `AGENT`).
- **Ticket Management**: Create, filter by status or priority, and update ticket details seamlessly.
- **Activity & Comments Feed**:
  - Interactive discussion threads on ticket details pages.
  - **Internal Note** support exclusively for Agents (`is_internal` flag), strictly hidden from Client views.
- **User Management**: Administrative interface for Agents to manage users.
- **Profile Settings**: Profile management interface for Clients to update personal details.
- **Modern Adaptive UI**: Fully responsive interface supporting both Dark and Light modes powered by `oklch` color scales.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router, Server Actions)
- **Authentication**: Auth.js (NextAuth v5)
- **Database & Query Builder**: Neon PostgreSQL, `postgres.js`
- **Styling**: Tailwind CSS, shadcn/ui
- **Runtime & Package Manager**: Bun
- **Type Safety**: TypeScript

## ⚙️ Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/ilhamjkid/next-project_b2b-issue-tracker.git
cd next-project_b2b-issue-tracker
bun install
```

### 2. Configure Environment Variables

Create a `.env.local` file and configure your database and authentication keys:

```env
# Database Connection
DATABASE_URL=""
DIRECT_URL=""

# NextAuth v5 Config
AUTH_SECRET=""
```

### 3. Database Migration & Seed

Populate the database with initial dummy data (users, tickets, comments):

```bash
bun run db:seed
```

### 4. Run Development Server

```bash
bun dev
```
