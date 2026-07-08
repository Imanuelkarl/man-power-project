import { PrismaClient } from '../generated/prisma/client.js';
// Import the Postgres adapter for Prisma client initialization
import {PrismaPg} from '@prisma/adapter-pg';
import { withAccelerate } from '@prisma/extension-accelerate';
import dotenv from "dotenv";

dotenv.config();

import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

// Simple Prisma client export for a non-Nest (plain Node.js) project
const prisma = new PrismaClient({ log:['error','info'],adapter }).$extends(withAccelerate())

// Optional: ensure graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
