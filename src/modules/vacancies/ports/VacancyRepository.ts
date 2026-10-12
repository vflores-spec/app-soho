// Traemos solo los tipos del dominio. El puerto depende del dominio, nunca al revés.
import { NewVacancy, Vacancy } from '../domain/Vacancy';

// Contrato que debe cumplir CUALQUIER lugar donde se guarden vacantes.
// "interface" describe QUÉ se debe poder hacer, no CÓMO se hace.
export interface VacancyRepository {
  // Devuelve todas las vacantes. "Promise<Vacancy[]>" = "una promesa de una lista de vacantes".
  findAll: () => Promise<Vacancy[]>;

  // Recibe una vacante nueva (sin id), la guarda y devuelve la vacante ya con su id.
  save: (newVacancy: NewVacancy) => Promise<Vacancy>;
}