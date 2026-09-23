# Vriddhi — Mentorship & Consultancy Platform

**Vriddhi** is a full-stack web application that connects users with professional mentors for one-on-one consultancy sessions. It supports session booking, payments, OTP-based verification, real-time chat, reporting, and feedback — all within a role-based access system (User, Mentor, Admin).

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Frontend Pages & Routes](#frontend-pages--routes)
- [Authentication & Security](#authentication--security)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Docker Setup](#docker-setup)
- [Scripts](#scripts)

---

## Project Overview

Vriddhi provides a platform where:

- **Users** can discover mentors, book consultancy sessions, make payments, and leave feedback.
- **Mentors** can manage their profile, set availability and charges, and approve/update session statuses.
- **Admins** have elevated access to manage users, view reports, and handle contact queries.

### Key Features

| Feature | Description |
|---|---|
| 🔐 Authentication | JWT-based login/signup with OTP (email & SMS) verification |
| 👤 Role System | Three roles: `USER`, `MENTOR`, `ADMIN` |
| 📅 Session Booking | Book consultancy sessions with mentors, track status lifecycle |
| 💳 Payments | Paytm-integrated payment gateway with callback handling |
| 💬 Chat | Real-time messaging between users and mentors |
| ⭐ Feedback | Users can submit and manage platform feedback with ratings |
| 🚩 Reports | Users can report other users/sessions; admins manage resolution |
| 📧 Contact Us | Public contact form with OTP verification |
| 🖼️ Image Upload | Profile images stored via Cloudflare R2 (S3-compatible) |
| 📊 Audit Logs | Tamper-evident audit trail for all data modifications |

---

## Tech Stack

### Backend (`/server`)

| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | HTTP server & routing |
| **Prisma ORM** | Type-safe database client & migrations |
| **PostgreSQL** | Primary relational database |
| **Redis (ioredis)** | OTP caching & session data |
| **JWT + bcryptjs** | Authentication & password hashing |
| **Nodemailer** | Email delivery (OTP, notifications) |
| **Twilio** | SMS OTP verification |
| **Cloudflare R2** | S3-compatible image/document storage |
| **Paytm Checksum** | Payment gateway integration |
| **Morgan** | HTTP request logging |
| **Docker** | Redis containerization |

### Frontend (`/client`)

| Technology | Purpose |
|---|---|
| **React 19 + TypeScript** | UI framework |
| **Vite 8** | Build tool & dev server |
| **React Router DOM v7** | Client-side routing |
| **Tailwind CSS v4** | Utility-first styling |
| **Zustand** | Lightweight global state management |
| **Axios** | HTTP client for API calls |
| **Hashids** | Obfuscates numeric IDs in URLs |
| **libphonenumber-js** | Phone number formatting & validation |

---

## Project Structure

```
Vriddhi/
├── client/                    # React + TypeScript frontend
│   ├── src/
│   │   ├── App.tsx            # Route definitions
│   │   ├── main.tsx           # React entry point
│   │   ├── index.css          # Global styles
│   │   ├── assets/            # Static assets
│   │   ├── component/         # Reusable UI components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Payment.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── ImgUpld.tsx
│   │   │   ├── ConfirmationModal.tsx
│   │   │   └── cards/
│   │   ├── context/           # React context providers
│   │   │   ├── Socket.tsx     # WebSocket context
│   │   │   └── Theme.tsx      # Theme context
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── otpHook.ts
│   │   ├── lib/               # Utility functions & API helpers
│   │   ├── config/            # App configuration
│   │   └── pages/             # Route-level page components
│   │       ├── auth/
│   │       │   ├── Login.tsx
│   │       │   ├── Signup.tsx
│   │       │   └── ResetPassword.tsx
│   │       ├── profile/
│   │       │   ├── Profile.tsx
│   │       │   ├── UpdateProfile.tsx
│   │       │   └── MentorProfile.tsx
│   │       ├── session/
│   │       │   ├── BookSession.tsx
│   │       │   ├── MySessions.tsx
│   │       │   └── DetailedSession.tsx
│   │       ├── static/
│   │       │   ├── Layout.tsx
│   │       │   ├── Home.tsx
│   │       │   ├── HowItWorks.tsx
│   │       │   ├── AboutUs.tsx
│   │       │   └── PageNotFound.tsx
│   │       ├── FindTalent.tsx
│   │       ├── Feedbacks.tsx
│   │       ├── ContactUs.tsx
│   │       └── Membership.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── server/                    # Node.js + Express backend
    ├── index.js               # App entry point
    ├── prisma/
    │   ├── schema.prisma      # Database schema
    │   └── migrations/        # SQL migration history
    ├── controller/            # Request handlers (business logic)
    │   ├── auth.controller.js
    │   ├── bookService.controller.js
    │   ├── payment.controller.js
    │   ├── feedback.controller.js
    │   ├── report.controller.js
    │   ├── contactus.controller.js
    │   ├── image.controller.js
    │   ├── imageUpload.controller.js
    │   ├── mobOtp.controller.js
    │   ├── otpVerify.controller.js
    │   ├── chat.controller.js
    │   └── adminAction.controller.js
    ├── routes/                # Express route definitions
    ├── middleware/            # Auth & guard middleware
    │   ├── protectRoute.js    # JWT verification, role guards
    │   ├── restrictAuth.js    # Block already-logged-in users
    │   └── otpVerified.js     # OTP session validation
    ├── model/                 # Prisma-generated client
    ├── repository/            # Database query layer
    ├── service/               # Business logic / service layer
    ├── lib/                   # Shared utilities
    │   ├── authHelper.js
    │   ├── redis.js
    │   └── others.js
    ├── exception/
    │   └── AppError.js        # Custom error hierarchy
    ├── logger/                # Logging utilities
    ├── docker-compose.yml     # Redis via Docker
    ├── MAINCORRECTED.sql      # Reference SQL script
    └── package.json
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│              CLIENT (React)             │
│   Vite + TypeScript + Tailwind CSS      │
│   React Router │ Zustand │ Axios        │
└──────────────────┬──────────────────────┘
                   │ HTTP/REST (CORS)
┌──────────────────▼──────────────────────┐
│            SERVER (Express 5)           │
│  Middleware → Routes → Controllers      │
│     ↓             ↓           ↓         │
│  JWT Auth    Role Guards   Services     │
└───────┬──────────────────────┬──────────┘
        │                      │
┌───────▼───────┐     ┌────────▼────────┐
│  PostgreSQL   │     │   Redis Cache   │
│  (via Prisma) │     │  (OTP Storage)  │
└───────────────┘     └─────────────────┘
        │
┌───────▼──────────────────────────────────┐
│           External Services              │
│  Cloudflare R2  │  Twilio  │  Paytm     │
│  (File Storage) │  (SMS)   │  (Payment) │
│                 │ Nodemailer (Email)     │
└──────────────────────────────────────────┘
```

---

## Database Schema

The PostgreSQL database is managed via **Prisma ORM** with the following models:

### Models

| Model | Description |
|---|---|
| `Users` | Core user table. Supports `USER`, `MENTOR`, `ADMIN` roles. Includes full-text trigram search index on `full_name_search`. |
| `Mentor` | One-to-one extension of `Users` for mentor-specific data (availability, rating, charge, level). |
| `Consultancy_service` | Represents a booked session between a user and a mentor. |
| `Chat` | A unique pair-chat channel between two users. |
| `Message` | Individual messages within a chat, optionally tied to a call. |
| `Call` | Audio/video call records linked to messages. |
| `Feedback` | One-per-user platform feedback with rating. |
| `Payments` | Payment records for sessions or memberships. |
| `Memberships` | Membership plan definitions. |
| `Report` | User reports against other users or sessions. |
| `Document` | User-uploaded documents for verification. |
| `ContactUs` | Contact form submissions. |
| `Relationship` | User-to-user relations (FAVOURITE, BLOCK, FOLLOWS). |
| `AdminAction` | Admin activity log (CRUD operations with metadata). |
| `AuditLog` | Tamper-evident audit trail for all table changes. |

### Key Enums

| Enum | Values |
|---|---|
| `UserRole` | `USER`, `MENTOR`, `ADMIN` |
| `MentorLevel` | `BRONZE`, `SILVER`, `GOLD`, `PLATINUM`, `DIAMOND` |
| `MentorExpertise` | `BEGINNER`, `INTERMEDIATE`, `EXPERT` |
| `ServiceStatus` | `INITIATED`, `SCHEDULED`, `CANCELED`, `ONGOING`, `DONE` |
| `PaymentStatus` | `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED` |
| `ReportStatus` | `PENDING`, `ONGOING`, `RESOLVED`, `REJECTED` |
| `ContactStatus` | `PENDING`, `ONGOING`, `DONE` |
| `Relation` | `FAVOURITE`, `BLOCK`, `FOLLOWS` |
| `Currency` | `INR`, `USD`, `EUR`, `GBP`, and 25+ others |

### PostgreSQL Extensions

- **`pg_trgm`** — Trigram-based fuzzy full-text search (mentor name search)
- **`unaccent`** — Accent-insensitive text search
- **`fuzzystrmatch`** — String similarity functions

---

## API Reference

Base URL: `http://localhost:5100`

### Authentication — `/auth`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | No (OTP verified) | Register a new user |
| `POST` | `/auth/login` | No | Log in, receive JWT cookie |
| `GET` | `/auth/logout` | ✅ User | Clear session cookie |
| `GET` | `/auth/profile/:id` | ✅ User | Fetch own profile |
| `PATCH` | `/auth/editprofile/:id` | ✅ User | Update profile details |
| `PATCH` | `/auth/changepasswd/:id` | ✅ User | Change password |
| `DELETE` | `/auth/deleteprofile/:id` | ✅ User | Soft-delete account |
| `PATCH` | `/auth/reset-passwd` | No (OTP verified) | Reset forgotten password |
| `GET` | `/auth/our-mentors` | No | Browse all mentors |
| `GET` | `/auth/our-mentors/suggestions` | No | Mentor search autocomplete |
| `GET` | `/auth/mentor/:id` | No | Public mentor profile |

### OTP — `/otp` and `/otp-mob`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/otp/send` | Send OTP via email |
| `POST` | `/otp/verify` | Verify email OTP |
| `POST` | `/otp-mob/send` | Send OTP via SMS (Twilio) |
| `POST` | `/otp-mob/verify` | Verify SMS OTP |

### Consultancy Sessions — `/bookservice`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/bookservice/create/:mentorId` | ✅ User | Book a session with a mentor |
| `GET` | `/bookservice/get/:id` | ✅ User | Fetch a session by ID |
| `GET` | `/bookservice/getall` | ✅ User | List all sessions (Admin query params supported) |
| `PATCH` | `/bookservice/update/:id` | ✅ User | Update session (reschedule / status / rating) |

**Session status flow:**

```
INITIATED → SCHEDULED  (mentor approves + payment done)
          → CANCELED
SCHEDULED → ONGOING → DONE
```

Update permissions by role:
- **User** — reschedule (date/time/duration) when `INITIATED`; add rating/opinion when `DONE`
- **Mentor** — transition status; approve session
- **Admin** — update any field freely

### Payments — `/payment`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/payment/initiate` | Initiate a Paytm transaction |
| `GET` | `/payment/verify` | Verify transaction status |
| `POST` | `/payment/callback` | Paytm server callback handler |

### Feedback — `/feedback`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/feedback/fetchall` | Optional | Get all platform feedback |
| `GET` | `/feedback/fetch/:id` | No | Get a single feedback entry |
| `POST` | `/feedback/create` | ✅ User | Submit platform feedback |
| `PATCH` | `/feedback/update/:id` | ✅ User | Edit own feedback |
| `DELETE` | `/feedback/delete/:id` | ✅ User | Delete own feedback |

### Reports — `/report`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/report/createreport` | ✅ User | File a report against a user/session |
| `GET` | `/report/getreport/:id` | No | View a single report |
| `GET` | `/report/getallreport` | ✅ Admin | View all reports |
| `PATCH` | `/report/updatereport/:id` | ✅ User | Update a report |
| `DELETE` | `/report/deletereport/:id` | ✅ User | Delete report (before resolution) |

### Contact Us — `/contactus`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/contactus/create` | Submit a contact form (OTP verified) |
| `GET` | `/contactus/getall` | Get all submissions (Admin) |
| `GET` | `/contactus/get/:id` | Get a single submission (Admin) |
| `PATCH` | `/contactus/update/:id` | Update contact status (Admin) |
| `DELETE` | `/contactus/delete/:id` | Delete a submission (Admin) |

### Image Upload — `/image`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/image/upload` | Upload image to Cloudflare R2 |
| `GET` | `/image/:key` | Fetch a presigned URL for an image |

---

## Frontend Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | `Home` | Landing page |
| `/find-talent` | `FindTalent` | Browse & search mentors with filters |
| `/mentor/:hash` | `MentorProfile` | Public mentor profile (ID obfuscated via Hashids) |
| `/book-session/:hash` | `BookSession` | Session booking form |
| `/my-sessions` | `MySessions` | View all booked sessions |
| `/session/:hash` | `DetailedSession` | Session details, status updates, payment |
| `/how-it-works` | `HowItWorks` | Platform explainer |
| `/aboutus` | `AboutUs` | About the platform |
| `/contactus` | `ContactUs` | Contact form |
| `/feedbacks` | `Feedbacks` | Platform feedback listing |
| `/membership` | `Membership` | Membership plans |
| `/login` | `Login` | Login form |
| `/signup` | `Signup` | Registration form with OTP |
| `/reset-password` | `ResetPassword` | Password reset with OTP |
| `/profile` | `Profile` | Authenticated user profile |
| `/profile/edit-profile` | `UpdateProfile` | Profile editor |
| `*` | `PageNotFound` | 404 fallback |

All pages are wrapped in a shared `<Layout />` component that provides the `Header` and `Footer`.

---

## Authentication & Security

### JWT Authentication

- Tokens are issued on login and stored as **HTTP-only signed cookies**.
- `cookie-parser` with a `COOKIE_SECRET` is used to sign and verify cookies.
- Tokens carry the user's ID and role for downstream authorization checks.

### Middleware Guards

| Middleware | File | Purpose |
|---|---|---|
| `protect` | `protectRoute.js` | Validates JWT from cookie; attaches user to `req` |
| `userRoute` | `protectRoute.js` | Ensures requester owns the resource, or is ADMIN |
| `adminRoute` | `protectRoute.js` | Restricts access to the `ADMIN` role only |
| `optionalUser` | `protectRoute.js` | Optionally attaches user if logged in (no hard block) |
| `restrictAuth` | `restrictAuth.js` | Blocks authenticated users from public-only routes (e.g. login) |
| `isVerified` | `otpVerified.js` | Requires a completed OTP verification session before proceeding |

### OTP Verification Flow

1. Client requests an OTP → server generates a code and stores it in **Redis** with a TTL.
2. Client submits the OTP → server verifies against the Redis value.
3. On success, a verified session flag is set in Redis.
4. The `isVerified` middleware checks this flag before allowing protected unauthenticated actions (signup, password reset, contact form).

### Custom Error Classes

Defined in `server/exception/AppError.js`:

| Class | HTTP Status | Use Case |
|---|---|---|
| `AppError` | (base) | Parent class for all custom errors |
| `ValidationError` | 400 | Request data fails business rules |
| `UnauthorizedError` | 401 | User is not authenticated |
| `ForbiddenError` | 403 | Authenticated but lacks permission |
| `NotFoundError` | 404 | Requested resource does not exist |
| `ConflictError` | 409 | State conflict (e.g. duplicate account) |

---

## Environment Variables

Create a `.env` file in the `/server` directory:

```env
# Server
PORT=5100
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/vriddhi

# Redis
REDIS_URL=redis://localhost:6379

# JWT & Cookies
JWT_SECRET=your_jwt_secret
COOKIE_KEY=cookie_data
COOKIE_SECRET=your_cookie_secret
SALT_ROUNDS=10

# Email (Nodemailer / Gmail App Password)
OUR_MAIL=your_email@gmail.com
OUR_MAIL_PASSWD=your_gmail_app_password
SUPPORT_MAIL=support@yourdomain.com

# Twilio (SMS OTP)
TWILIO_ACNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_SENDER_PH_NO=+1xxxxxxxxxx

# Cloudflare R2 (Image Storage — S3-compatible)
CLOUDFLARE_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name

# Paytm Payment Gateway
MID=your_merchant_id
MKEY=your_merchant_key

# CORS
CLIENT_BASE_URL=http://localhost:5173
```

> **Note:** Never commit `.env` files to version control. Both `/server/.gitignore` and `/client/.gitignore` exclude them by default.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14
- Redis (or Docker — see below)
- npm

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Vriddhi
```

### 2. Set Up the Backend

```bash
cd server
npm install
```

- Fill in your `.env` values (see [Environment Variables](#environment-variables)).
- Start Redis (see [Docker Setup](#docker-setup)).
- Run Prisma migrations to create the database schema:

```bash
npx prisma migrate deploy
npx prisma generate
```

- Start the development server:

```bash
# With auto-reload (recommended)
npx nodemon index.js

# Or standard start
node index.js
```

The server will be available at `http://localhost:5100`.

### 3. Set Up the Frontend

```bash
cd ../client
npm install
npm run dev
```

The client dev server will be available at `http://localhost:5173`.

---

## Docker Setup

A `docker-compose.yml` is provided in `/server` to spin up a **Redis** container:

```yaml
version: '3.8'
services:
  redis:
    image: redis:alpine
    container_name: redis-cache
    ports:
      - "6379:6379"
```

Start Redis with:

```bash
cd server
docker-compose up -d
```

---

## Scripts

### Server (`/server`)

| Command | Description |
|---|---|
| `node index.js` | Start the server |
| `npx nodemon index.js` | Start with auto-reload on file changes |
| `npx prisma migrate dev` | Create and apply a new migration |
| `npx prisma migrate deploy` | Apply all pending migrations (production) |
| `npx prisma generate` | Regenerate the Prisma client |
| `npx prisma studio` | Open the Prisma database GUI |
| `docker-compose up -d` | Start Redis in the background |

### Client (`/client`)

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Compile TypeScript and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the codebase |

