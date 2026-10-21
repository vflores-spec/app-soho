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

// Crea la aplicación de Express.
const app = express();

// Middleware: convierte el JSON que llega en un objeto disponible en req.body.
app.use(express.json());

// Vacantes de ejemplo para el modo "memoria" (datos de prueba en español).
const sampleVacancies = [
  { id: 1, title: 'Desarrollador Backend Jr', company: 'Tech Andes', modality: 'remoto', salary: 900 },
  { id: 2, title: 'Analista de Datos', company: 'DataSur', modality: 'híbrido', salary: 1100 },
];

// ---------- Módulo Vacancies ----------
// Si existe DATABASE_URL se usa PostgreSQL; si no, la lista en memoria.
const vacancyRepository: VacancyRepository = process.env.DATABASE_URL
  ? new PostgresVacancyRepository(createPostgresPool(process.env.DATABASE_URL))
  : new InMemoryVacancyRepository(sampleVacancies);
console.log(`Vacancies persistence: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'in memory'}`);

// El servicio recibe el repositorio y las rutas reciben el servicio.
const vacancyService = new VacancyService(vacancyRepository);
app.use('/vacancies', createVacancyRouter(vacancyService));

// ---------- Módulo Companies ----------
// Si existe MONGODB_URI se usa MongoDB; si no, la lista en memoria.
const companyRepository: CompanyRepository = process.env.MONGODB_URI
  ? new MongoCompanyRepository(createMongoClient(process.env.MONGODB_URI))
  : new InMemoryCompanyRepository();
console.log(`Companies persistence: ${process.env.MONGODB_URI ? 'MongoDB' : 'in memory'}`);

const companyService = new CompanyService(companyRepository);
app.use('/companies', createCompanyRouter(companyService));

// Si ninguna ruta coincidió, responde 404. Va después de todas las rutas.
app.use(notFoundHandler);

// Manejador central de errores. Va siempre al final.
app.use(errorHandler);

// Exporta la app para que server.ts la encienda y los tests la importen.
export default app;