// "Router" es un mini-grupo de rutas de Express, que luego se conecta a la aplicación.
import { Router } from 'express';

// Traemos el servicio (los casos de uso) y los códigos HTTP.
// "../../" sube a vacancies; "../../../../" sube hasta src, para entrar a "shared".
import { VacancyService } from '../../application/VacancyService';
import { HTTP_STATUS } from '../../../../shared/httpStatus';

// Recibe el servicio desde afuera (inyección de dependencias) y devuelve las rutas ya armadas.
export const createVacancyRouter = (service: VacancyService): Router => {
  // Crea el grupo de rutas vacío.
  const router = Router();

  // GET /: listar vacantes. La ruta completa será /vacancies porque así se conectará en app.ts.
  router.get('/', async (req, res) => {
    // Pide la lista al caso de uso "list".
    const vacancies = await service.list();
    // Responde con 200 y la lista en JSON.
    res.status(HTTP_STATUS.OK).json(vacancies);
  });

  // POST /: crear una vacante.
  router.post('/', async (req, res) => {
    // Le pasa al caso de uso los datos del cuerpo de la petición.
    // Si son inválidos, el dominio lanza un DomainError y el manejador central responde 400.
    const vacancy = await service.create(req.body);
    // Si todo salió bien, responde 201 (creado) con la vacante y su id.
    res.status(HTTP_STATUS.CREATED).json(vacancy);
  });

  // Devuelve el grupo de rutas listo para conectarlo.
  return router;
};