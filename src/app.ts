// Express: el framework web.
import express from 'express';

// Traemos las piezas que vamos a conectar.
// Esta es la ÚNICA parte del sistema que conoce las clases concretas.
import { InMemoryVacancyRepository } from './modules/vacancies/adapters/persistence/InMemoryVacancyRepository';
import { VacancyService } from './modules/vacancies/application/VacancyService';
import { createVacancyRouter } from './modules/vacancies/adapters/http/vacancyRoutes';
import { errorHandler, notFoundHandler } from './shared/httpErrorHandlers';
import { PostgresVacancyRepository } from './modules/vacancies/adapters/persistence/PostgresVacancyRepository';
import { VacancyRepository } from './modules/vacancies/ports/VacancyRepository';
import { createPostgresPool } from './shared/database/postgresPool';

// Crea la aplicación de Express.
const app = express();

// Middleware: convierte el JSON que llega en un objeto disponible en req.body.
app.use(express.json());

// 1) El repositorio: donde se guardan las vacantes.
//    Hoy es en memoria, con dos vacantes de ejemplo (datos de prueba).
//    En la Semana 3 se cambiará SOLO esta línea por uno de PostgreSQL.
/*const vacancyRepository = new InMemoryVacancyRepository([
  { id: 1, title: 'Desarrollador Backend Jr', company: 'Tech Andes', modality: 'remoto', salary: 900 },
  { id: 2, title: 'Analista de Datos', company: 'DataSur', modality: 'híbrido', salary: 1100 },
]);*/

// Vacantes de ejemplo para el modo "memoria" (datos de prueba en español).
const sampleVacancies = [
  { id: 1, title: 'Desarrollador Backend Jr', company: 'Tech Andes', modality: 'remoto', salary: 900 },
  { id: 2, title: 'Analista de Datos', company: 'DataSur', modality: 'híbrido', salary: 1100 },
];

// 1) El repositorio: dónde se guardan las vacantes.
//    Si existe DATABASE_URL se usa PostgreSQL; si no, la lista en memoria.
//    El tipo es el CONTRATO (VacancyRepository): cualquiera de los dos lo cumple.
const vacancyRepository: VacancyRepository = process.env.DATABASE_URL
  ? new PostgresVacancyRepository(createPostgresPool(process.env.DATABASE_URL))
  : new InMemoryVacancyRepository(sampleVacancies);

// 2) El servicio (casos de uso): se le entrega el repositorio.
const vacancyService = new VacancyService(vacancyRepository);

// 3) Las rutas: se les entrega el servicio y se montan bajo el prefijo "/vacancies".
//    Así, el "/" del router se convierte en GET /vacancies y POST /vacancies.
app.use('/vacancies', createVacancyRouter(vacancyService));

// Si ninguna ruta coincidió, responde 404. Va después de todas las rutas.
app.use(notFoundHandler);

// Manejador central de errores. Va siempre al final.
app.use(errorHandler);

// Exporta la app para que server.ts la encienda y los tests la importen.
export default app;