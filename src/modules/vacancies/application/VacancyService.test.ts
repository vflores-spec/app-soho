import { DomainError } from '../../../shared/DomainError';
import { InMemoryVacancyRepository } from '../adapters/persistence/InMemoryVacancyRepository';
import { VacancyService } from './VacancyService';

// Datos de ejemplo válidos (datos de prueba en español)
const validInput = { title: 'QA Tester', company: 'Tech Andes', modality: 'remoto', salary: 800 };

describe('VacancyService', () => {
  it('creates a valid vacancy and returns it with an id', async () => {
    // Se le entrega al servicio un repositorio: eso es la inyección de dependencias
    const service = new VacancyService(new InMemoryVacancyRepository());

    const created = await service.create(validInput);

    expect(created).toEqual({ id: 1, ...validInput });
  });

  it('rejects an invalid vacancy and does not save it', async () => {
    const service = new VacancyService(new InMemoryVacancyRepository());

    // Con datos inválidos, "create" debe fallar con un DomainError
    await expect(service.create({ company: 'Tech Andes' })).rejects.toThrow(DomainError);
    // Y la lista debe seguir vacía: no se guardó nada
    expect(await service.list()).toEqual([]);
  });

  it('lists the vacancies that were created', async () => {
    const service = new VacancyService(new InMemoryVacancyRepository());

    await service.create(validInput);

    expect(await service.list()).toHaveLength(1);
  });
});