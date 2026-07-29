=========================================
=== . ! Official CodeCore Project ! . ===
=========================================

# Create a .env file and put this in it.

# Connect to Postgres via the shared transaction-mode pooler (IPv4-only)

DATABASE_URL="postgresql://postgres.gnitsfewcoqldrxfunzu:[JqY5K&/hynzZ46d]@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Connect to Postgres via the shared session-mode pooler (used for migrations)

DIRECT_URL="postgresql://postgres.gnitsfewcoqldrxfunzu:[JqY5K&/hynzZ46d]@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"

# And put this in prisma/schema.prisma

    url = env("DATABASE_URL")
    directUrl = env("DIRECT_URL")

    datasource db {
    provider = "postgresql"
    ( here )
    }
