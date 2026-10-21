import { Company, NewCompany } from '../domain/Company';

// Contrato que debe cumplir CUALQUIER lugar donde se guarden empresas.
export interface CompanyRepository {
  // Devuelve todas las empresas.
  findAll: () => Promise<Company[]>;

  // Busca una empresa por su id (texto). Devuelve undefined si no existe.
  findById: (id: string) => Promise<Company | undefined>;

  // Guarda una empresa nueva (sin id) y la devuelve ya con su id.
  save: (newCompany: NewCompany) => Promise<Company>;
}