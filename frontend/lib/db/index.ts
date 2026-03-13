import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// PgBouncer-safe: prepare: false avoids DuplicatePreparedStatementError
// max: 1 mimics NullPool for serverless (each invocation gets its own connection)
const client = postgres(connectionString, {
  prepare: false,
  max: 1,
});

export const db = drizzle(client, { schema });
