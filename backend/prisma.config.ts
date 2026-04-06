import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// Cargar variables de entorno manualmente
dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});