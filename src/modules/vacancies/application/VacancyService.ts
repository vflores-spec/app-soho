// Traemos del dominio: la regla de validación (parseNewVacancy) y el tipo Vacancy.
// "../" sube una carpeta: de application a vacancies.
import { parseNewVacancy, Vacancy } from '../domain/Vacancy';

// Traemos el contrato (puerto). Observe que NO traemos el repositorio en memoria:
// el servicio solo conoce el contrato, no sabe dónde se guardan realmente los datos.
import { VacancyRepository } from '../ports/VacancyRepository';

// Un "servicio" agrupa los casos de uso relacionados con vacantes.
// "export" permite que otros archivos lo puedan usar.
export class VacancyService {
  // El constructor se ejecuta una sola vez, cuando se crea el servicio con "new".
  // Recibe el repositorio desde afuera (inyección de dependencias).
  // "private readonly" guarda el repositorio dentro del servicio como "this.repository"
  // y evita que se reemplace después.
  constructor(private readonly repository: VacancyRepository) {}

  // CASO DE USO 1: listar vacantes.
  // "async" = devuelve una promesa. Pide la lista al repositorio y la devuelve.
  list = async (): Promise<Vacancy[]> => this.repository.findAll();

  // CASO DE USO 2: crear una vacante.
  // "input: unknown" = recibe datos de cualquier tipo; aún no sabemos si son válidos.
  create = async (input: unknown): Promise<Vacancy> => {
    // 1) El dominio valida los datos. Si algo está mal, lanza un DomainError
    //    y la función se detiene aquí: nunca llega a guardar.
    const newVacancy = parseNewVacancy(input);

    // 2) Si todo está bien, se le pide al repositorio que la guarde
    //    y se devuelve la vacante ya con su id.
    return this.repository.save(newVacancy);
  };
}