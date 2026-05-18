# SNS-NEST Project Documentation

## 1. Project Overview
This document outlines the software engineering architecture, technology stack, security measures, and development progress for the **SNS-NEST** project. This is designed as a high-end, production-ready web application leveraging the MERN stack.

## 2. Architecture & Tech Stack

### Frontend (Client)
- **Framework:** React.js (via Vite for highly optimized, fast builds)
- **Styling:** TailwindCSS (utility-first, fast paint times)
- **State Management:** Zustand (client state) & TanStack React Query (server state/caching)
- **High-End Animation & Rendering (Zero Lag):**
  - `gsap` (GreenSock) & `framer-motion`: For cinematic, hardware-accelerated animations.
  - `@studio-freight/lenis`: For lag-free, premium smooth scrolling.
  - `@react-three/fiber`: For 3D elements and WebGL capabilities.
- **Frontend Security:** `dompurify` (XSS prevention), `crypto-js` (client-side payload encryption), `react-helmet-async` (secure document head management).
- **Form Handling:** `react-hook-form` & `zod` (prevents re-render lag during typing).

### Backend (Server)
- **Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Architecture Pattern:** Modular / MVC (TBD)

### 2.1 Security & Encryption Measures
The backend is fortified with enterprise-grade security libraries:
- **Authentication:** `jsonwebtoken` (JWT) for stateless session management.
- **Password Hashing:** `bcryptjs` for secure password storage.
- **Data Protection:** `crypto-js` for two-way encryption/decryption of sensitive Personally Identifiable Information (PII) before database persistence.
- **Header Security:** `helmet` to set secure HTTP headers and protect against well-known web vulnerabilities.
- **Injection Protection:** 
  - `express-mongo-sanitize`: Prevents NoSQL Operator Injection.
  - `xss-clean`: Sanitizes user inputs to prevent Cross-Site Scripting (XSS).
- **Traffic Control & Mitigations:**
  - `express-rate-limit`: Prevents brute-force attacks and DDoS by limiting request rates.
  - `hpp`: Protects against HTTP Parameter Pollution attacks.
- **Cookies:** `cookie-parser` to handle secure, HTTP-only cookies.
- **CORS:** `cors` configured for strict Cross-Origin Resource Sharing rules.

### 2.2 Performance, Logging & Utilities
- **Validation:** `zod` for strict request body, params, and query validation.
- **Logging:** `winston` and `morgan` for comprehensive, format-rich HTTP request logging and error tracking.
- **Optimization:** `compression` for GZIP payload compression to reduce response sizes and increase API speed.
- **Error Handling:** `express-async-handler` to gracefully catch and forward exceptions in async route handlers.

## 3. Project Structure (Current)
```text
SNS-NEST/
├── backend/
│   ├── .env               (Environment Configurations)
│   ├── package.json       (Backend Dependencies)
│   └── node_modules/
├── frontend/
│   └── .gitkeep           (To be initialized)
└── README.md              (Project Documentation)
```

## 4. Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Ensure dependencies are installed (already executed via `npm install`).
3. Set up environment variables in `backend/.env`.
4. *Start scripts to be configured.*

## 5. Changelog / Progress Tracking

| Date | Changes / Milestones Achieved |
| :--- | :--- |
| **Current** | - Initialized monorepo-style structure with `frontend` and `backend` directories. |
| **Current** | - Defined and installed comprehensive high-end backend dependencies. |
| **Current** | - Implemented core security toolkit (`helmet`, `xss-clean`, `express-rate-limit`, etc.). |
| **Current** | - Set up structured Software Engineering documentation in `README.md`. |

## 6. API Documentation
*(To be populated as controllers and routes are developed)*
