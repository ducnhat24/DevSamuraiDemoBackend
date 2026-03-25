# Acme Analytics Dashboard - Backend API

A robust, scalable, and secure RESTful API built to power the Acme Analytics Dashboard. Developed as part of a 48-hour technical sprint, this backend focuses on clean architecture, type safety, and efficient database interactions.

## Live API
- **Base URL:** [https://coral-app-gim35.ondigitalocean.app]https://coral-app-gim35.ondigitalocean.app)
- **Frontend Repository:** [https://github.com/ducnhat24/DevSamuraiDemoFrontend](https://github.com/ducnhat24/DevSamuraiDemoFrontend)

## Key Features
- **Secure Authentication:** Implemented robust JWT-based authentication (Access & Refresh tokens) with password hashing.
- **Relational Data Modeling:** Designed a structured PostgreSQL database schema using Prisma ORM for type-safe database queries.
- **Modular Architecture:** Utilized NestJS's dependency injection and modular structure (Auth, User modules) to keep the codebase maintainable and scalable.
- **Production-Ready Deployment:** Configured for cloud deployment on DigitalOcean App Platform, integrating seamlessly with Supabase's IPv6 connection pooling.

## Technology Stack
- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL (Hosted on Supabase)
- **Security:** Passport.js, JWT, bcrypt
- **Package Manager:** pnpm

---

## Assumptions & Trade-offs

Building a fully functional backend within a 48-hour window requires strategic prioritization. Here are the technical trade-offs and decisions made:

1. **Monolithic Architecture vs. Microservices:**
   - *Trade-off:* Chosen a monolithic structure using NestJS.
   - *Reasoning:* For an application of this scale and a tight deadline, a monolith significantly reduces infrastructure overhead while NestJS ensures the codebase remains strictly organized and easily splittable in the future.
2. **Database Hosting & IPv6 Constraints:**
   - *Trade-off:* Used Supabase Free Tier, which recently dropped IPv4 support, causing conflicts with CI/CD runners (like DigitalOcean/Render) that rely on IPv4.
   - *Reasoning:* Instead of paying for a managed database instance, I engineered a workaround using Supabase's Connection Pooler (port 6543) with `pgbouncer=true` for standard queries, and a separate `DIRECT_URL` (session mode) specifically for Prisma migrations. This demonstrates resourcefulness and DevOps problem-solving skills.
3. **Automated Testing Coverage:**
   - *Trade-off:* While the testing scaffolding is set up (Jest, `.spec.ts`, and `e2e` configurations are present), comprehensive test coverage was traded for core feature completion and deployment troubleshooting.
   - *Reasoning:* The priority was delivering a working, deployed, and integrated product. The existing test setup serves as a foundation for immediate implementation in the next development cycle.

---

## Setup Instructions (Local Development)

### 1. Prerequisites
- Node.js (v18 or higher)
- pnpm (Recommended)
- A running PostgreSQL database (Local or Cloud)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/ducnhat24/devsamuraidemobackend.git
pnpm install
```

### 3. Environment Variables
Create a `.env` file in the root directory. You will need to set up your database connection strings and JWT secrets:
```env
# Database connection (Transaction mode for queries)
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?pgbouncer=true"

# Direct database connection (Session mode for migrations)
DIRECT_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]"

# JWT Secrets
JWT_ACCESS_SECRET="your-super-secret-access-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
```

### 4. Database Setup
Run Prisma migrations to generate the client and apply the schema to your database:
```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Run the Application
```bash
# development mode
pnpm run start:dev

# production mode
pnpm run start:prod
```
The API will be available at `http://localhost:3000`.

---
