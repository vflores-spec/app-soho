import { DomainError } from '../../../shared/DomainError';
import { NotFoundError } from '../../../shared/NotFoundError';
import { InMemoryCompanyRepository } from '../adapters/persistence/InMemoryCompanyRepository';
import { CompanyService } from './CompanyService';

const validInput = { name: 'Tech Andes', industry: 'Tecnología', benefits: ['Trabajo remoto'] };

// Crea un servicio nuevo con un repositorio vacío para cada prueba.
const createService = (): CompanyService => new CompanyService(new InMemoryCompanyRepository());

describe('CompanyService', () => {
  it('creates a valid company and returns it with an id', async () => {
    const created = await createService().create(validInput);

    expect(created).toEqual({ id: '1', ...validInput, socialLinks: {}, locations: [] });
  });

  it('rejects an invalid company and does not save it', async () => {
    const service = createService();

    await expect(service.create({ industry: 'Tecnología' })).rejects.toThrow(DomainError);
    expect(await service.list()).toEqual([]);
  });

  it('gets a company by id and throws NotFoundError when it does not exist', async () => {
    const service = createService();
    const created = await service.create(validInput);

    expect(await service.getById(created.id)).toEqual(created);
    await expect(service.getById('999')).rejects.toThrow(NotFoundError);
  });
});