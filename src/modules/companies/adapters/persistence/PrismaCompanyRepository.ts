// El tipo del cliente de Prisma. "../../../../" sube cuatro carpetas hasta src.
import { PrismaClient } from '../../../../generated/prisma/client';

// Tipos del dominio y el contrato que vamos a cumplir.
import { Company, CompanyLocation, NewCompany } from '../../domain/Company';
import { CompanyRepository } from '../../ports/CompanyRepository';

// Cómo llega un registro desde Prisma. Los campos Json llegan como "unknown": el adaptador los interpreta.
type CompanyRecord = {
  id: string;
  name: string;
  industry: string;
  benefits: string[];
  socialLinks: unknown;
  locations: unknown;
};

// Mapeo: convierte un registro de Prisma en una Company del dominio.
// El dominio ya validó la forma de los datos Json al guardarlos, por eso aquí solo se indica su tipo
const toCompany = (record: CompanyRecord): Company => ({
  id: record.id,
  name: record.name,
  industry: record.industry,
  benefits: record.benefits,
  socialLinks: record.socialLinks as Record<string, string>,
  locations: record.locations as CompanyLocation[],
});

// Adaptador de salida - cumple el mismo contrato que los de MongoDB, pero con Prisma y PostgreSQL.
export class PrismaCompanyRepository implements CompanyRepository {
  // Recibe el cliente de Prisma desde afuera (inyección de dependencias).
  constructor(private readonly prisma: PrismaClient) {}

  // Devuelve todas las empresas, ordenadas por nombre
  findAll = async (): Promise<Company[]> => {
    const records = await this.prisma.company.findMany({ orderBy: { name: 'asc' } });
    return records.map(toCompany);
  };

  // Busca una empresa por id (texto).
  findById = async (id: string): Promise<Company | undefined> => {
    // Aquí el id es un texto libre: si no existe, Prisma devuelve null 
    const record = await this.prisma.company.findUnique({ where: { id } });
    return record ? toCompany(record) : undefined;
  };

  // Guarda una empresa nueva. El id (uuid) lo genera Prisma
  save = async (newCompany: NewCompany): Promise<Company> => {
    const record = await this.prisma.company.create({
      data: {
        name: newCompany.name,
        industry: newCompany.industry,
        benefits: newCompany.benefits,
        socialLinks: newCompany.socialLinks,
        // Se copia cada sede como objeto simple - así Prisma la acepta como JSON
        locations: newCompany.locations.map((location) => ({ city: location.city })),
      },
    });
    return toCompany(record);
  };
}