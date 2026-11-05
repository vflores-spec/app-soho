// Carga el .env para tener TEST_DATABASE_URL 
import 'dotenv/config';

import { DomainError } from '../../../../shared/DomainError';
import { PrismaClient } from '../../../../generated/prisma/client';
import { createPrismaClient } from '../../../../shared/database/prismaClient';
import { PrismaVacancyRepository } from './PrismaVacancyRepository';

// La base de pruebas debe existir y ser distinta de la de desarrollo.
if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL debe existir y ser distinta de DATABASE_URL');
}

describe('PrismaVacancyRepository', () => {
  let prisma: PrismaClient;
  let repository: PrismaVacancyRepository;

  // Datos de ejemplo - datos de prueba en español. Se completan en beforeEach, cuando ya existe la empresa.
  let companyId: string;
  let sampleVacancy: { title: string; companyId: string; modality: string; salary: number };

  // Una vez antes de todas las pruebas: abre la conexión a la base de PRUEBAS
  beforeAll(() => {
    prisma = createPrismaClient(process.env.TEST_DATABASE_URL as string);
    repository = new PrismaVacancyRepository(prisma);
  });

  // Antes de CADA prueba: vacía ambas tablas, reinicia los ids y crea la empresa de la que dependen las vacantes.
  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE companies, vacancies RESTART IDENTITY CASCADE');
    const company = await prisma.company.create({ data: { name: 'Tech Andes', industry: 'Tecnología' } });
    companyId = company.id;
    sampleVacancy = { title: 'QA Tester', companyId, modality: 'remoto', salary: 800 };
  });

  // Una vez al final: cierra la conexión para que Jest pueda terminar.
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('starts empty', async () => {
    expect(await repository.findAll()).toEqual([]);
  });

  it('saves a vacancy, assigns an id and returns the company name from the JOIN', async () => {
    const saved = await repository.save(sampleVacancy);

    expect(saved).toEqual({ id: 1, ...sampleVacancy, companyName: 'Tech Andes' });
  });

  it('assigns increasing ids and lists what was saved', async () => {
    await repository.save(sampleVacancy);
    const second = await repository.save(sampleVacancy);

    expect(second.id).toBe(2);
    expect(await repository.findAll()).toHaveLength(2);
  });

  it('finds a vacancy by id and returns undefined when it does not exist', async () => {
    const saved = await repository.save(sampleVacancy);

    expect(await repository.findById(saved.id)).toEqual(saved);
    expect(await repository.findById(999)).toBeUndefined();
  });

  it('updates an existing vacancy and keeps its id', async () => {
    const saved = await repository.save(sampleVacancy);

    const updated = await repository.update(saved.id, { ...sampleVacancy, salary: 1000 });

    expect(updated).toEqual({ id: saved.id, ...sampleVacancy, salary: 1000, companyName: 'Tech Andes' });
    expect(await repository.update(999, sampleVacancy)).toBeUndefined();
  });

  it('removes a vacancy and reports whether it existed', async () => {
    const saved = await repository.save(sampleVacancy);

    expect(await repository.remove(saved.id)).toBe(true);
    expect(await repository.findAll()).toEqual([]);
    expect(await repository.remove(saved.id)).toBe(false);
  });

  it('rejects a vacancy whose company does not exist', async () => {
    const saved = await repository.save(sampleVacancy);

    // La base de datos rechaza la clave foránea y el adaptador la traduce a un DomainError.
    await expect(repository.save({ ...sampleVacancy, companyId: 'no-existe' })).rejects.toThrow(DomainError);
    await expect(repository.update(saved.id, { ...sampleVacancy, companyId: 'no-existe' })).rejects.toThrow(
      'La empresa indicada no existe',
    );
  });

  it('does not let the database delete a company that still has vacancies', async () => {
    await repository.save(sampleVacancy);

    // "onDelete: Restrict" del esquema: la empresa no se puede borrar mientras tenga vacantes.
    await expect(prisma.company.delete({ where: { id: companyId } })).rejects.toThrow();
  });
});