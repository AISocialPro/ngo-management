# Copilot Instructions for AI Agents

## Project Overview
- **Monorepo Structure:**
  - `admin/`: Next.js 14+ app (App Router, TypeScript, Tailwind, Prisma)
  - `backend/`: Node.js backend (modular, e.g., `campaigns/`)
- **Admin Frontend:**
  - Uses `/src/app/` for routing (App Router)
  - Each admin section (e.g., `branches`, `beneficiaries`) is a subfolder under `/src/app/admin/`
  - Shared UI in `/src/components/` (e.g., `Sidebar.tsx`, `Topbar.tsx`, `AdminLayout.tsx`)
  - API routes in `/src/app/api/` (RESTful, file-based)
  - Prisma client in `/src/lib/prisma.ts`
- **Backend:**
  - Organized by feature in `/src/modules/`
  - Each module: `controller.ts`, `service.ts`, `dto.ts`, `router.ts`

## Key Workflows
- **Start Admin Dev Server:**
  - `cd admin && npm run dev` (Next.js, port 3000)
- **Backend Dev Server:**
  - `cd backend && npm run dev` (if script exists)
- **Prisma Migrations:**
  - `cd admin && npx prisma migrate dev`

## Patterns & Conventions
- **API:**
  - Next.js API routes: `/src/app/api/{resource}/route.ts` (RESTful, e.g., `branches`)
  - Backend: Express-style modules, not tightly coupled to frontend
- **UI:**
  - Use shared components from `/src/components/`
  - Layouts: `/src/app/layout.tsx` (global), `/src/app/admin/layout.tsx` (admin)
- **TypeScript:**
  - Strict typing enforced
  - DTOs in backend for validation
- **Styling:**
  - Tailwind CSS via `tailwind.config.js`
- **Database:**
  - Prisma schema in `/admin/prisma/schema.prisma`
  - Access via `/src/lib/prisma.ts`

## Integration Points
- **Frontend ↔ Backend:**
  - Prefer using Next.js API routes for admin UI
  - Backend modules are for future expansion or non-UI APIs
- **Prisma:**
  - Used in both frontend (admin) and backend

## Examples
- **Add new admin section:**
  - Create `/src/app/admin/{section}/page.tsx`
  - Add link in `/src/components/Sidebar.tsx`
- **Add new API route:**
  - Create `/src/app/api/{resource}/route.ts`
- **Add backend module:**
  - Create `/backend/src/modules/{feature}/` with `controller.ts`, `service.ts`, etc.

## Special Notes
- **Do not mix backend modules with Next.js API routes.**
- **Keep shared logic in `/src/components/` or `/src/lib/` for reusability.**
- **Follow file-based routing conventions for Next.js.**

---

For more, see `admin/README.md` and `admin/prisma/schema.prisma`.
