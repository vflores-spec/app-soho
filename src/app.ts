// Express: el framework web.
import express from 'express';

// Piezas de Vacancies.
import { createVacancyRouter } from './modules/vacancies/adapters/http/vacancyRoutes';
import { InMemoryVacancyRepository } from './modules/vacancies/adapters/persistence/InMemoryVacancyRepository';
import { PostgresVacancyRepository } from './modules/vacancies/adapters/persistence/PostgresVacancyRepository';
import { VacancyService } from './modules/vacancies/application/VacancyService';
import { VacancyRepository } from './modules/vacancies/ports/VacancyRepository';

// Piezas de Companies.
import { createCompanyRouter } from './modules/companies/adapters/http/companyRoutes';
import { InMemoryCompanyRepository } from './modules/companies/adapters/persistence/InMemoryCompanyRepository';
import { CompanyService } from './modules/companies/application/CompanyService';

// Piezas compartidas.
import { createPostgresPool } from './shared/database/postgresPool';
import { errorHandler, notFoundHandler } from './shared/httpErrorHandlers';

import { MongoCompanyRepository } from './modules/companies/adapters/persistence/MongoCompanyRepository';
import { CompanyRepository } from './modules/companies/ports/CompanyRepository';
import { createMongoClient } from './shared/database/mongoClient';

import { PrismaVacancyRepository } from './modules/vacancies/adapters/persistence/PrismaVacancyRepository';
import { createPrismaClient } from './shared/database/prismaClient';

import { MongooseCompanyRepository } from './modules/companies/adapters/persistence/MongooseCompanyRepository';
import { createMongooseConnection } from './shared/database/mongooseConnection';

// Crea la aplicación de Express.
const app = express();

// Middleware: convierte el JSON que llega en un objeto disponible en req.body.
app.use(express.json());

// Vacantes de ejemplo para el modo "memoria" (datos de prueba en español).
const sampleVacancies = [
  { id: 1, title: 'Desarrollador Backend Jr', company: 'Tech Andes', modality: 'remoto', salary: 900 },
  { id: 2, title: 'Analista de Datos', company: 'DataSur', modality: 'híbrido', salary: 1100 },
];

// Elige el repositorio de vacantes según las variables de entorno.
// Devuelve el repositorio y un nombre, para poder avisar por consola cuál se está usando.
const createVacancyRepository = (): { name: string; repository: VacancyRepository } => {
  const databaseUrl = process.env.DATABASE_URL;

  // Sin DATABASE_URL: lista en memoria.
  if (!databaseUrl) {
    return { name: 'in memory', repository: new InMemoryVacancyRepository(sampleVacancies) };
  }

  // Con VACANCIES_ADAPTER=prisma: PostgreSQL a través de Prisma (ORM).
  if (process.env.VACANCIES_ADAPTER === 'prisma') {
    return {
      name: 'PostgreSQL with Prisma',
      repository: new PrismaVacancyRepository(createPrismaClient(databaseUrl)),
    };
  }

  // Por defecto: PostgreSQL con SQL escrito a mano (paquete pg).
  return {
    name: 'PostgreSQL with pg',
    repository: new PostgresVacancyRepository(createPostgresPool(databaseUrl)),
  };
};

// ---------- Módulo Vacancies ----------
// Si existe DATABASE_URL se usa PostgreSQL; si no, la lista en memoria.
const { name: vacanciesAdapterName, repository: vacancyRepository } = createVacancyRepository();
console.log(`Vacancies persistence: ${vacanciesAdapterName}`);

// El servicio recibe el repositorio y las rutas reciben el servicio.
const vacancyService = new VacancyService(vacancyRepository);
app.use('/vacancies', createVacancyRouter(vacancyService));

// Elige el repositorio de empresas según las variables de entorno.
const createCompanyRepository = (): { name: string; repository: CompanyRepository } => {
  const mongodbUri = process.env.MONGODB_URI;

  // Sin MONGODB_URI: lista en memoria.
  if (!mongodbUri) {
    return { name: 'in memory', repository: new InMemoryCompanyRepository() };
  }

  // Con COMPANIES_ADAPTER=mongoose: MongoDB a través de Mongoose (ODM).
  if (process.env.COMPANIES_ADAPTER === 'mongoose') {
    return {
      name: 'MongoDB with Mongoose',
      repository: new MongooseCompanyRepository(createMongooseConnection(mongodbUri)),
    };
  }

  // Por defecto: MongoDB con el controlador oficial.
  return {
    name: 'MongoDB with the official driver',
    repository: new MongoCompanyRepository(createMongoClient(mongodbUri)),
  };
};

// ---------- Módulo Companies ----------
const { name: companiesAdapterName, repository: companyRepository } = createCompanyRepository();
console.log(`Companies persistence: ${companiesAdapterName}`);

const companyService = new CompanyService(companyRepository);
app.use('/companies', createCompanyRouter(companyService));

// Si ninguna ruta coincidió, responde 404. Va después de todas las rutas.
app.use(notFoundHandler);

// Manejador central de errores. Va siempre al final.
app.use(errorHandler);

// Exporta la app para que server.ts la encienda y los tests la importen.
export default app;