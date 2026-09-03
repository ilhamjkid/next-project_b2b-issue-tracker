# MVP B2B Issue Tracker

A web-based ticketing system built for managing B2B issues efficiently with role-based access control (RBAC).

## 🚀 Key Features

- **Authentication & RBAC**: Session management powered by NextAuth with role-tailored access (`CLIENT` and `AGENT`).
- **Ticket Management**: Create, filter by status or priority, and update ticket details seamlessly.
- **Activity & Comments Feed**:
  - Interactive discussion threads on ticket details pages.
  - **Internal Note** support exclusively for Agents (`is_internal` flag), strictly hidden from Client views.
- **User Management**: Administrative interface for Agents to manage user.
- **Profile Settings**: Profile management interface for Clients to update personal details.
- **Modern Adaptive UI**: Fully responsive interface supporting both Dark and Light modes powered by `oklch` color scales.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router, Server Actions)
- **Authentication**: NextAuth.js
- **Database**: Neon PostgreSQL
- **Query Builder / Client**: `postgres.js` (Dynamic SQL & JSON Helpers)
- **Styling**: Tailwind CSS, shadcn/ui
- **Package Manager**: pnpm
- **Type Safety**: TypeScript

## ⚙️ Getting Started

1. **Clone the repository & Install dependencies**

   ```bash
   pnpm install
   ```

2. **Environment Variables**

   Create a `.env.local` file and configure your database and authentication keys:

   ```env
   # Database Connection
   DATABASE_URL=""
   DIRECT_URL=""

   # NextAuth v5 Config
   AUTH_SECRET=""
   ```

3. **Seed the Database**

   Populate the database with initial dummy data (users, tickets, comments):

   ```bash
   pnpm db:seed
   ```

4. **Run Development Server**

   ```bash
   pnpm dev
   ```
