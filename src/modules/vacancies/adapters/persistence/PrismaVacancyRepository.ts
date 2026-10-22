// El tipo del cliente de Prisma. "../../../../" sube cuatro carpetas hasta src.
import { PrismaClient } from '../../../../generated/prisma/client';

// Tipos del dominio y el contrato que vamos a cumplir.
import { NewVacancy, Vacancy } from '../../domain/Vacancy';
import { VacancyRepository } from '../../ports/VacancyRepository';

// Cómo llega un registro desde Prisma. El salario es un "Decimal" (un objeto con el método toNumber).
type VacancyRecord = {
  id: number;
  title: string;
  company: string;
  modality: string;
  salary: { toNumber: () => number };
};

// Mapeo: convierte un registro de Prisma en una Vacancy del dominio.
// Aquí el adaptador "traduce": el salario pasa de Decimal a número con toNumber().
const toVacancy = (record: VacancyRecord): Vacancy => ({
  id: record.id,
  title: record.title,
  company: record.company,
  modality: record.modality,
  salary: record.salary.toNumber(),
});

// Responde si un error de Prisma es "no se encontró el registro" (código P2025).
const isRecordNotFound = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2025';

// Adaptador de salida: cumple el mismo contrato que los otros repositorios, pero con Prisma.
export class PrismaVacancyRepository implements VacancyRepository {
  // Recibe el cliente de Prisma desde afuera (inyección de dependencias).
  constructor(private readonly prisma: PrismaClient) {}

  // Devuelve todas las vacantes, ordenadas por id.
  findAll = async (): Promise<Vacancy[]> => {
    // "findMany" equivale a SELECT; "orderBy" equivale a ORDER BY.
    const records = await this.prisma.vacancy.findMany({ orderBy: { id: 'asc' } });
    return records.map(toVacancy);
  };

  // Busca una vacante por id.
  findById = async (id: number): Promise<Vacancy | undefined> => {
    // "findUnique" busca UN registro por un campo único (el id). Devuelve null si no existe.
    const record = await this.prisma.vacancy.findUnique({ where: { id } });
    return record ? toVacancy(record) : undefined;
  };

  // Guarda una vacante nueva.
  save = async (newVacancy: NewVacancy): Promise<Vacancy> => {
    // "create" equivale a INSERT; "data" son los valores. El id lo genera la base de datos.
    const record = await this.prisma.vacancy.create({ data: newVacancy });
    return toVacancy(record);
  };

  // Reemplaza los datos de una vacante existente.
  update = async (id: number, data: NewVacancy): Promise<Vacancy | undefined> => {
    try {
      // "update" equivale a UPDATE ... WHERE id = ...
      const record = await this.prisma.vacancy.update({ where: { id }, data });
      return toVacancy(record);
    } catch (error) {
      // Si no existía esa vacante, Prisma lanza P2025: se traduce a "undefined" según el contrato.
      if (isRecordNotFound(error)) {
        return undefined;
      }
      // Cualquier otro error es inesperado: se vuelve a lanzar.
      throw error;
    }
  };

  // Elimina una vacante.
  remove = async (id: number): Promise<boolean> => {
    try {
      // "delete" equivale a DELETE ... WHERE id = ...
      await this.prisma.vacancy.delete({ where: { id } });
      return true;
    } catch (error) {
      // Si no existía, Prisma lanza P2025: se traduce a "false" según el contrato.
      if (isRecordNotFound(error)) {
        return false;
      }
      throw error;
    }
  };
}