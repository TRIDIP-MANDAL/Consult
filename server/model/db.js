import 'dotenv/config';
import { PrismaClient } from './prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
});

export const normalizeName = (name) => {
  if (!name) return '';

  return name
    .normalize('NFD')                   // 1. Decompose accents
    .replace(/[\u0300-\u036f]/g, '')     // 2. Strip accent marks
    .toLowerCase()                       // 3. Lowercase
    .replace(/[()[\]{}<>]/g, ' ')        // 4. Remove brackets/parens
    .replace(/[^\w\s']/g, ' ')           // 5. Remove special characters (keep apostrophes)
    .replace(/\s+/g, ' ')                // 6. Collapse multiple spaces
    .trim();                             // 7. Trim edges
};

const prisma = new PrismaClient({ adapter }).$extends({
  query: {
    users: {
      async create({ args, query }) {
        if (args.data.full_name) {
          args.data.full_name_search = normalizeName(args.data.full_name);
        }
        return query(args);
      },
      async update({ args, query }) {
        if (typeof args.data.full_name === 'string') {
          args.data.full_name_search = normalizeName(args.data.full_name);
        }
        return query(args);
      },
    },
  },
});

export default prisma;