// Error de negocio, para avisar cuando se rompe una regla.
import { DomainError } from '../../../shared/DomainError';

// Una sede de la empresa (solo guardamos la ciudad).
export interface CompanyLocation {
  city: string;
}

// Cómo es una empresa ya guardada.
export interface Company {
  id: string; // identificador único: es texto porque MongoDB usa un ObjectId
  name: string; // nombre de la empresa
  industry: string; // sector al que pertenece
  benefits: string[]; // LISTA de textos (dato flexible)
  socialLinks: Record<string, string>; // OBJETO nombre → enlace (dato flexible)
  locations: CompanyLocation[]; // LISTA de objetos (dato flexible)
}

// Una empresa nueva: igual a Company pero SIN el id.
export type NewCompany = Omit<Company, 'id'>;

// Responde si un valor es un texto que no está vacío.
const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim() !== '';

// Valida y limpia la lista de beneficios. Si no se envió, devuelve una lista vacía.
const parseBenefits = (value: unknown): string[] => {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value) || !value.every(isNonEmptyString)) {
    throw new DomainError('Los beneficios deben ser una lista de textos');
  }
  return value.map((benefit) => benefit.trim());
};

// Valida las redes sociales: un objeto cuyos valores son enlaces de texto. Si no se envió, devuelve {}.
const parseSocialLinks = (value: unknown): Record<string, string> => {
  if (value === undefined) {
    return {};
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value) || !Object.values(value).every(isNonEmptyString)) {
    throw new DomainError('Las redes sociales deben ser un objeto con enlaces de texto');
  }
  return value as Record<string, string>;
};

// Valida las sedes: una lista de objetos y cada uno con una ciudad. Si no se envió, devuelve una lista vacía.
const parseLocations = (value: unknown): CompanyLocation[] => {
  if (value === undefined) {
    return [];
  }
  const isValid =
    Array.isArray(value) &&
    value.every((item) => typeof item === 'object' && item !== null && isNonEmptyString((item as { city?: unknown }).city));
  if (!isValid) {
    throw new DomainError('Cada sede debe tener al menos una ciudad');
  }
  return (value as CompanyLocation[]).map((location) => ({ city: location.city.trim() }));
};

// Valida datos "crudos" y devuelve una empresa nueva limpia, o lanza un DomainError.
export const parseNewCompany = (input: unknown): NewCompany => {
  const { name, industry, benefits, socialLinks, locations } = (input ?? {}) as Record<string, unknown>;

  // REGLA: nombre y sector son obligatorios.
  if (!isNonEmptyString(name) || !isNonEmptyString(industry)) {
    throw new DomainError('El nombre y el sector son obligatorios');
  }

  // Los datos flexibles son opcionales, pero si vienen deben tener la forma correcta.
  return {
    name: name.trim(),
    industry: industry.trim(),
    benefits: parseBenefits(benefits),
    socialLinks: parseSocialLinks(socialLinks),
    locations: parseLocations(locations),
  };
};