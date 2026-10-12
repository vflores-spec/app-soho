import { InMemoryVacancyRepository } from './InMemoryVacancyRepository';

// Una vacante de ejemplo que reutilizamos en las pruebas (datos de prueba en español)
const sampleVacancy = { title: 'QA Tester', company: 'Tech Andes', modality: 'remoto', salary: 800 };

describe('InMemoryVacancyRepository', () => {
  it('starts empty when no initial vacancies are given', async () => {
    const repository = new InMemoryVacancyRepository();

    // "toEqual([])" verifica que la lista esté vacía
    expect(await repository.findAll()).toEqual([]);
  });

  it('saves a vacancy and assigns an id', async () => {
    const repository = new InMemoryVacancyRepository();

    const saved = await repository.save(sampleVacancy);

    // La primera vacante recibe el id 1 y conserva sus datos
    expect(saved).toEqual({ id: 1, ...sampleVacancy });
  });

  it('assigns increasing ids and lists what was saved', async () => {
    const repository = new InMemoryVacancyRepository();

    await repository.save(sampleVacancy);
    const second = await repository.save(sampleVacancy);

    expect(second.id).toBe(2);
    expect(await repository.findAll()).toHaveLength(2);
  });
});