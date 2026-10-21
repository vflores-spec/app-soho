import { NotFoundError } from '../../../shared/NotFoundError';
import { Company, parseNewCompany } from '../domain/Company';
import { CompanyRepository } from '../ports/CompanyRepository';

// Mensaje para el usuario (en español), escrito una sola vez.
const COMPANY_NOT_FOUND_MESSAGE = 'Empresa no encontrada';

// Casos de uso de empresas. Recibe el repositorio desde afuera (inyección de dependencias).
export class CompanyService {
  constructor(private readonly repository: CompanyRepository) {}

  // Listar todas las empresas.
  list = async (): Promise<Company[]> => this.repository.findAll();

  // Obtener una empresa por id; si no existe, lanza NotFoundError (→ 404).
  getById = async (id: string): Promise<Company> => {
    const company = await this.repository.findById(id);

    if (!company) {
      throw new NotFoundError(COMPANY_NOT_FOUND_MESSAGE);
    }

    return company;
  };

  // Crear una empresa: el dominio valida y limpia; luego se guarda.
  create = async (input: unknown): Promise<Company> => this.repository.save(parseNewCompany(input));
}