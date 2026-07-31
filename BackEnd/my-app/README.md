# ============================================================

# CodeCore - Official Backend

# ============================================================

CodeCore is a software development studio focused on building
modern, secure, and scalable web applications using the latest
technologies.

============================================================
Requirements
============================================================

- Node.js 20+
- npm 10+
- PostgreSQL (Supabase)

============================================================
Installation
============================================================

Install all project dependencies:

npm install

============================================================
Environment Setup
============================================================

Create a file named:

.env

Then add the following variables:

# PostgreSQL (Transaction Mode Pooler - IPv4 Only)

DATABASE_URL="postgresql://postgres.gnitsfewcoqldrxfunzu:[JqY5K&/hynzZ46d]@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# PostgreSQL (Session Mode Pooler - Required for Prisma Migrations)

DIRECT_URL="postgresql://postgres.gnitsfewcoqldrxfunzu:[JqY5K&/hynzZ46d]@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"

============================================================
Prisma Configuration
============================================================

Open:

prisma/schema.prisma

Configure the datasource like this:

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
directUrl = env("DIRECT_URL")
}

============================================================
Generate Prisma Client
============================================================

npx prisma generate

============================================================
Run Database Migrations
============================================================

Development:

npx prisma migrate dev

Production:

npx prisma migrate deploy

============================================================
Run the Development Server
============================================================

npm run dev

============================================================
Project Structure
============================================================

backend/
│
├── app/
├── prisma/
├── uploads/
├── package.json
├── tsconfig.json
└── .env

============================================================
Tech Stack
============================================================

• Node.js
• Express.js
• TypeScript
• Prisma ORM
• PostgreSQL
• Supabase

============================================================
Available Scripts
============================================================

npm run dev - Start development server
npm run build - Build the project
npm start - Start production server

============================================================
Important Notes
============================================================

• Never commit your .env file to GitHub.
• Keep DATABASE_URL and DIRECT_URL private.
• DATABASE_URL is used by the application.
• DIRECT_URL is used only by Prisma migrations.
• Make sure PostgreSQL is accessible before running migrations.

============================================================
License
============================================================

All Rights Reserved © CodeCore

============================================================
Official CodeCore Project
============================================================
