import { Company, NewCompany } from '../../domain/Company';
import { CompanyRepository } from '../../ports/CompanyRepository';

// Adaptador de salida: guarda las empresas en un arreglo, sin base de datos.
export class InMemoryCompanyRepository implements CompanyRepository {
  private companies: Company[] = [];
  private nextId = 1;

  // "structuredClone" hace una copia COMPLETA (incluye listas y objetos anidados),
  // para que nadie de afuera pueda modificar los datos guardados.
  findAll = async (): Promise<Company[]> => structuredClone(this.companies);

  findById = async (id: string): Promise<Company | undefined> => {
    const company = this.companies.find((item) => item.id === id);
    return company ? structuredClone(company) : undefined;
  };

  save = async (newCompany: NewCompany): Promise<Company> => {
    // El id es TEXTO: se convierte el contador con String(...).
    const company: Company = { id: String(this.nextId++), ...newCompany };
    this.companies.push(structuredClone(company));
    return company;
  };
}