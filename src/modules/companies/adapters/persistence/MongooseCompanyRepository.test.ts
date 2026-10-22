// Carga el .env para tener MONGODB_TEST_URI (Jest no lo carga solo).
import 'dotenv/config';

import { Connection } from 'mongoose';

import { createMongooseConnection } from '../../../../shared/database/mongooseConnection';
import { MongooseCompanyRepository } from './MongooseCompanyRepository';

// Protección: la base de pruebas debe existir y ser distinta de la de desarrollo.
if (!process.env.MONGODB_TEST_URI || process.env.MONGODB_TEST_URI === process.env.MONGODB_URI) {
  throw new Error('MONGODB_TEST_URI debe existir y ser distinta de MONGODB_URI');
}

// Empresa de ejemplo con datos flexibles (datos de prueba en español).
const sampleCompany = {
  name: 'Tech Andes',
  industry: 'Tecnología',
  benefits: ['Seguro médico', 'Trabajo remoto'],
  socialLinks: { linkedin: 'https://linkedin.com/company/techandes' },
  locations: [{ city: 'Quito' }, { city: 'Guayaquil' }],
};

describe('MongooseCompanyRepository', () => {
  let connection: Connection;
  let repository: MongooseCompanyRepository;

  // Una vez antes de todas las pruebas: abre la conexión a la base de PRUEBAS y espera a que esté lista.
  beforeAll(async () => {
    connection = createMongooseConnection(process.env.MONGODB_TEST_URI as string);
    await connection.asPromise();
    repository = new MongooseCompanyRepository(connection);
  });

  // Antes de CADA prueba: vacía la colección
  beforeEach(async () => {
    await connection.collection('companies').deleteMany({});
  });

  // Una vez al final - cierra la conexión para que Jest pueda terminar
  afterAll(async () => {
    await connection.close();
  });

  it('starts empty', async () => {
    expect(await repository.findAll()).toEqual([]);
  });

  it('saves a company with its flexible data and assigns a text id', async () => {
    const saved = await repository.save(sampleCompany);

    expect(saved.id).toMatch(/^[0-9a-f]{24}$/);
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

  it('returns undefined when the id does not exist or is not valid', async () => {
    expect(await repository.findById('507f1f77bcf86cd799439011')).toBeUndefined();
    expect(await repository.findById('abc')).toBeUndefined();
  });
});