// Grupo de rutas de Express.
import { Router } from 'express';

// Códigos HTTP con nombre y el servicio con los casos de uso.
import { HTTP_STATUS } from '../../../../shared/httpStatus';
import { CompanyService } from '../../application/CompanyService';

// Recibe el servicio desde afuera y devuelve las rutas ya armadas.
export const createCompanyRouter = (service: CompanyService): Router => {
  // Crea el grupo de rutas vacío.
  const router = Router();

  // GET /companies → listar todas las empresas.
  router.get('/', async (req, res) => {
    res.status(HTTP_STATUS.OK).json(await service.list());
  });

  // GET /companies/:id → ver una empresa. El id llega como texto y así se usa.
  router.get('/:id', async (req, res) => {
    res.status(HTTP_STATUS.OK).json(await service.getById(req.params.id));
  });

  // POST /companies → crear una empresa. Si los datos son inválidos, el dominio lanza DomainError (→ 400).
  router.post('/', async (req, res) => {
    res.status(HTTP_STATUS.CREATED).json(await service.create(req.body));
  });

  // Devuelve el grupo de rutas listo para conectarlo en app.ts.
  return router;
};