/// <reference types="node" />

// Carga el archivo .env para que exista la variable TEST_DATABASE_URL.
import 'dotenv/config';

import { defineConfig } from 'prisma/config';

// Igual que prisma.config.ts, pero apunta a la base de datos de PRUEBAS.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: { url: process.env.TEST_DATABASE_URL },
});
