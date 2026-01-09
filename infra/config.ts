import { SupabaseDatabaseClient } from '@/infra/db/clients/supabase-client';

export const ProjectConfig = {
  database: {
    client: new SupabaseDatabaseClient(),
    url: process.env.DATABASE_URL,
    port: process.env.DATABASE_PORT,
    name: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
};

export const databaseClient = ProjectConfig.database.client;
