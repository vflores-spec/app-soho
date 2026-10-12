// Importa el error de negocio. "../../../" significa "subir tres carpetas":
// domain → vacancies → modules → src, y desde ahí entra a "shared".
import { DomainError } from '../../../shared/DomainError';

// Describe cómo es una vacante ya guardada. "interface" solo existe para el compilador:
// sirve para que el editor avise si usamos una propiedad que no existe.
export interface Vacancy {
  id: number; // identificador único, lo asigna el sistema
  title: string; // título del puesto
  company: string; // empresa que publica
  modality: string; // remoto, presencial o híbrido
  salary: number; // salario ofrecido
}

// Una vacante nueva: es una Vacancy SIN el "id" (todavía no se ha guardado).
// "Omit" significa "toma este tipo y quítale esta propiedad".
export type NewVacancy = Omit<Vacancy, 'id'>;

// Recibe datos "crudos" (de cualquier cosa que llegue de afuera), los valida y los devuelve limpios.
// "unknown" significa "no sé qué es esto todavía": obliga a comprobarlo antes de usarlo.
export const parseNewVacancy = (input: unknown): NewVacancy => {
  // Si no llegó nada ("??"), usa un objeto vacío. Luego saca cuatro datos de una vez (destructuring).
  const { title, company, modality, salary } = (input ?? {}) as Record<string, unknown>;

  // REGLA 1: título, empresa y modalidad deben ser texto y no estar vacíos.
  // "typeof x !== 'string'" pregunta si NO es texto. ".trim()" quita espacios de los extremos.
  if (typeof title !== 'string' || !title.trim() ||
      typeof company !== 'string' || !company.trim() ||
      typeof modality !== 'string' || !modality.trim()) {
    // "throw" detiene la función y avisa que se rompió una regla. El mensaje es para el usuario.
    throw new DomainError('El título, la empresa y la modalidad son obligatorios');
  }

  // REGLA 2: el salario debe ser un número mayor que cero.
  if (typeof salary !== 'number' || salary <= 0) {
    throw new DomainError('El salario debe ser un número mayor que 0');
  }

  // Si llegó hasta aquí, todo es válido: devuelve los datos ya limpios (sin espacios sobrantes).
  return { title: title.trim(), company: company.trim(), modality: modality.trim(), salary };
};