// Traemos los tipos del dominio y el contrato (puerto) que vamos a cumplir.
// "../../" sube dos carpetas: persistence → adapters → vacancies.
import { NewVacancy, Vacancy } from '../../domain/Vacancy';
import { VacancyRepository } from '../../ports/VacancyRepository';

// "implements" es la promesa: "esta clase cumple TODO el contrato VacancyRepository".
// Si falta un método, TypeScript marca error al instante.
export class InMemoryVacancyRepository implements VacancyRepository {
  // La lista donde se guardan las vacantes. "private" = solo esta clase puede tocarla.
  private vacancies: Vacancy[];

  // El número que usará la próxima vacante que se guarde.
  private nextId: number;

  // El constructor se ejecuta al crear el repositorio con "new".
  // Puede recibir vacantes iniciales (por ejemplo, datos de prueba).
  constructor(initialVacancies: Vacancy[] = []) {
    // Se copia la lista con [...] para no depender del arreglo original de quien lo envió.
    this.vacancies = [...initialVacancies];
    // El siguiente id es la cantidad actual + 1.
    this.nextId = initialVacancies.length + 1;
  }

  // Cumple "findAll" del contrato. "async" hace que devuelva una promesa.
  // Devuelve una COPIA de la lista, para que nadie de afuera pueda modificar la original.
  findAll = async (): Promise<Vacancy[]> => [...this.vacancies];

  // Cumple "save" del contrato: recibe una vacante sin id y devuelve la vacante con id.
  save = async (newVacancy: NewVacancy): Promise<Vacancy> => {
    // Crea la vacante completa: le asigna el id y sube el contador (nextId++).
    // "...newVacancy" copia dentro los datos recibidos (title, company, modality, salary).
    const vacancy: Vacancy = { id: this.nextId++, ...newVacancy };
    // La agrega a la lista en memoria.
    this.vacancies.push(vacancy);
    // Devuelve la vacante ya guardada.
    return vacancy;
  };
}