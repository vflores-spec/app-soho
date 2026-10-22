// El adaptador que conecta Prisma con PostgreSQL usando el paquete "pg".
import { PrismaPg } from '@prisma/adapter-pg';

// El cliente que Prisma generó con "npx prisma generate". "../../" sube hasta src.
import { PrismaClient } from '../../generated/prisma/client';

// Crea el cliente de Prisma a partir de la cadena de conexión. Se llama una sola vez al arrancar.
// Truco para clase: agregue "log: ['query']" dentro de las llaves de PrismaClient para ver en la consola el SQL que genera.
export const createPrismaClient = (connectionString: string): PrismaClient =>
  new PrismaClient({ adapter: new PrismaPg({ connectionString }) });