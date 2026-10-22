/// <reference types="node" />

// Carga el archivo .env para que exista la variable DATABASE_URL.
import 'dotenv/config';

// "defineConfig" es la función de Prisma para escribir la configuración con ayuda del editor.
import { defineConfig } from 'prisma/config';

export default defineConfig({
  // Dónde está el archivo con el plano de las tablas.
  schema: 'prisma/schema.prisma',

  // La dirección de la base de datos de desarrollo (la misma que usa la aplicación).
  datasource: { url: process.env.DATABASE_URL },
});