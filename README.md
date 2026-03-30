# MedGallery — Medical File Gallery & Admin Portal

A production-ready full-stack web application for securely managing and viewing medical files (images, PDFs, reports). Built with Next.js 16, TypeScript, Prisma 7, Tailwind CSS v4, and Cloudinary.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL + Prisma ORM v7 |
| Auth | NextAuth.js v5 (JWT + Credentials) |
| Storage | Cloudinary (or local filesystem fallback) |
| Validation | Zod v4 |
| Notifications | react-hot-toast |

---

## Features

### Admin Panel (Protected)
- Secure login with JWT sessions
- Dashboard with stats — total files, categories, storage used, file type breakdown
- Upload medical files (images + PDFs, max 10MB) with drag & drop
- Edit / delete files with confirmation
- Full category CRUD with slug auto-generation

### Public Gallery
- Browse all medical files in a responsive grid
- Filter by category with emoji icons
- Search by title / description (debounced)
- File preview modal — image viewer + PDF iframe
- Pagination with ellipsis

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/           # Admin panel (sidebar layout)
│   │   ├── dashboard/         # Stats + recent uploads
│   │   ├── upload/            # File upload with drag & drop
│   │   ├── files/             # Manage files (edit/delete)
│   │   └── categories/        # Manage categories
│   ├── gallery/               # Public gallery
│   ├── api/
│   │   ├── auth/[...nextauth] # NextAuth handler
│   │   ├── files/             # GET (paginated) + POST (upload)
│   │   ├── files/[id]/        # GET + PUT + DELETE
│   │   ├── categories/        # GET + POST
│   │   ├── categories/[id]/   # PUT + DELETE
│   │   └── stats/             # Dashboard statistics
│   ├── global-error.tsx       # Global error boundary
│   ├── not-found.tsx          # 404 page
│   └── layout.tsx             # Root layout
├── components/
│   ├── admin/                 # Sidebar, Topbar
│   ├── gallery/               # FileCard, FilePreviewModal
│   └── ui/                    # Button, Input, Modal, Pagination, Skeleton
├── hooks/                     # useFiles, useDebounce
├── lib/                       # prisma, auth, storage, utils, validations
├── services/                  # API client (api.ts)
└── types/                     # Shared TypeScript types
```

---

## Running Locally

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or a Neon connection string)

### 1. Clone and install

```bash
git clone <repo-url>
cd medical-gallery
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/medical_gallery"

# NextAuth
NEXTAUTH_SECRET="your-secret"   # generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Storage
STORAGE_PROVIDER="local"        # or "cloudinary"

# Cloudinary (only if STORAGE_PROVIDER="cloudinary")
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Set up the database

```bash
npm run setup
```

This runs `prisma generate` + `prisma db push` + seeds the database.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Storage Configuration

### Local (default)
Files are saved to `public/uploads/`. Set `STORAGE_PROVIDER="local"` in `.env`.
> ⚠️ Not suitable for production — files are lost on server restart (e.g. Vercel).

### Cloudinary (recommended for production)
1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Copy your **Cloud Name**, **API Key**, and **API Secret** from the dashboard
3. Set in `.env`:
```env
STORAGE_PROVIDER="cloudinary"
CLOUDINARY_CLOUD_NAME="dxxxxxxx"
CLOUDINARY_API_KEY="123456789"
CLOUDINARY_API_SECRET="xxxxxxxxxx"
```

---

## Deployment (Vercel + Neon)

### 1. Database — Neon (Free)
1. Create a free PostgreSQL database at [neon.tech](https://neon.tech)
2. Copy the connection string

### 2. Deploy to Vercel
1. Push your code to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add these environment variables in Vercel dashboard:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon connection string |
| `NEXTAUTH_SECRET` | Strong random string |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `STORAGE_PROVIDER` | `cloudinary` |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |

4. Set build command:
```
prisma generate && next build
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | Public | List all categories with file count |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete category (cascades files) |
| GET | `/api/files` | Public | List files (paginated, filterable) |
| POST | `/api/files` | Admin | Upload file (multipart/form-data) |
| GET | `/api/files/:id` | Public | Get single file |
| PUT | `/api/files/:id` | Admin | Update file metadata |
| DELETE | `/api/files/:id` | Admin | Delete file + storage |
| GET | `/api/stats` | Admin | Dashboard statistics |

---

## Useful Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run setup        # Generate + push schema + seed DB
npm run db:push      # Push schema to DB
npm run db:seed      # Seed admin + categories
npm run db:studio    # Open Prisma Studio (localhost:5555)
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | JWT signing secret |
| `NEXTAUTH_URL` | ✅ | App base URL |
| `STORAGE_PROVIDER` | ✅ | `local` or `cloudinary` |
| `CLOUDINARY_CLOUD_NAME` | If cloudinary | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | If cloudinary | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | If cloudinary | Cloudinary API secret |
