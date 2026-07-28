import 'dotenv/config';
import { PrismaClient } from './prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { normalizeName } from '../lib/others.js';

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
});

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