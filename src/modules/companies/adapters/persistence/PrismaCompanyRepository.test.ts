// Carga el .env para tener TEST_DATABASE_URL (Jest no lo carga solo).
import 'dotenv/config';

import { PrismaClient } from '../../../../generated/prisma/client';
import { createPrismaClient } from '../../../../shared/database/prismaClient';
import { PrismaCompanyRepository } from './PrismaCompanyRepository';

// Protección: la base de pruebas debe existir y ser distinta de la de desarrollo.
if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL debe existir y ser distinta de DATABASE_URL');
}

// Empresa de ejemplo con datos flexibles (datos de prueba en español).
const sampleCompany = {
  name: 'Tech Andes',
  industry: 'Tecnología',
  benefits: ['Seguro médico', 'Trabajo remoto'],
  socialLinks: { linkedin: 'https://linkedin.com/company/techandes' },
  locations: [{ city: 'Quito' }, { city: 'Guayaquil' }],
};

describe('PrismaCompanyRepository', () => {
  let prisma: PrismaClient;
  let repository: PrismaCompanyRepository;

  // Una vez antes de todas las pruebas: abre la conexión a la base de PRUEBAS.
  beforeAll(() => {
    prisma = createPrismaClient(process.env.TEST_DATABASE_URL as string);
    repository = new PrismaCompanyRepository(prisma);
  });

  // Antes de CADA prueba: vacía la tabla. CASCADE también vacía "vacancies", que depende de "companies".
  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE companies CASCADE');
  });

  // Una vez al final: cierra la conexión para que Jest pueda terminar.
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('starts empty', async () => {
    expect(await repository.findAll()).toEqual([]);
  });

  it('saves a company with its flexible data and assigns a text id', async () => {
    const saved = await repository.save(sampleCompany);

    expect(typeof saved.id).toBe('string');
    expect(saved.id).not.toBe('');
    expect(saved).toEqual({ id: saved.id, ...sampleCompany });
  });

  it('lists what was saved', async () => {
    const saved = await repository.save(sampleCompany);

    expect(await repository.findAll()).toEqual([saved]);
  });

  it('finds a company by id', async () => {
    const saved = await repository.save(sampleCompany);

    expect(await repository.findById(saved.id)).toEqual(saved);
  });

  it('returns undefined when the id does not exist', async () => {
    expect(await repository.findById('no-existe')).toBeUndefined();
  });
});