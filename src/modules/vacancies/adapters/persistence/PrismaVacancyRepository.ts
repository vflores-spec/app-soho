import { PrismaClient } from '../../../../generated/prisma/client';

import { DomainError } from '../../../../shared/DomainError';

import { NewVacancy, Vacancy } from '../../domain/Vacancy';
import { VacancyRepository } from '../../ports/VacancyRepository';

// Cómo llega un registro desde Prisma: la vacante MÁS el nombre de su empresa (el resultado del JOIN)
type VacancyRecord = {
  id: number;
  title: string;
  companyId: string;
  modality: string;
  salary: { toNumber: () => number };
  company: { name: string };
};

// "include" le pide a Prisma el JOIN: junto con cada vacante trae el nombre de su empresa.
// Se escribe una sola vez y se reutiliza en todas las consultas.
const withCompanyName = { company: { select: { name: true } } };

// Mapeo: convierte un registro de Prisma en una Vacancy del dominio.
// Aquí el adaptador "traduce": el salario pasa de Decimal a número y el nombre de la empresa sale del JOIN.
const toVacancy = (record: VacancyRecord): Vacancy => ({
  id: record.id,
  title: record.title,
  companyId: record.companyId,
  companyName: record.company.name,
  modality: record.modality,
  salary: record.salary.toNumber(),
});

// Responde si un error de Prisma tiene cierto código. Así no repetimos la comprobación.
const hasErrorCode = (error: unknown, code: string): boolean =>
  typeof error === 'object' && error !== null && (error as { code?: string }).code === code;

// P2025: "no se encontró el registro".
const isRecordNotFound = (error: unknown): boolean => hasErrorCode(error, 'P2025');

// P2003: "se violó una clave foránea": se intentó usar una empresa que no existe.
const isForeignKeyViolation = (error: unknown): boolean => hasErrorCode(error, 'P2003');

// Mensaje para el usuario (en español), escrito una sola vez.
const COMPANY_NOT_FOUND_MESSAGE = 'La empresa indicada no existe';

// Adaptador de salida: cumple el mismo contrato que los otros repositorios, pero con Prisma.
export class PrismaVacancyRepository implements VacancyRepository {
  // Recibe el cliente de Prisma desde afuera (inyección de dependencias).
  constructor(private readonly prisma: PrismaClient) {}

  // Devuelve todas las vacantes, ordenadas por id, cada una con el nombre de su empresa.
  findAll = async (): Promise<Vacancy[]> => {
    // "findMany" equivale a SELECT; "orderBy" a ORDER BY; "include" al JOIN.
    const records = await this.prisma.vacancy.findMany({ orderBy: { id: 'asc' }, include: withCompanyName });
    return records.map(toVacancy);
  };

  // Busca una vacante por id.
  findById = async (id: number): Promise<Vacancy | undefined> => {
    // "findUnique" busca UN registro por un campo único (el id). Devuelve null si no existe.
    const record = await this.prisma.vacancy.findUnique({ where: { id }, include: withCompanyName });
    return record ? toVacancy(record) : undefined;
  };

  // Guarda una vacante nueva.
  save = async (newVacancy: NewVacancy): Promise<Vacancy> => {
    try {
      // "create" equivale a INSERT; "data" son los valores. El id lo genera la base de datos.
      const record = await this.prisma.vacancy.create({ data: newVacancy, include: withCompanyName });
      return toVacancy(record);
    } catch (error) {
      // La base de datos rechazó la clave foránea: la empresa no existe. Se traduce a un error de negocio (→ 400).
      if (isForeignKeyViolation(error)) {
        throw new DomainError(COMPANY_NOT_FOUND_MESSAGE);
      }
      throw error;
    }
  };

  // Reemplaza los datos de una vacante existente.
  update = async (id: number, data: NewVacancy): Promise<Vacancy | undefined> => {
    try {
      // "update" equivale a UPDATE ... WHERE id = ...
      const record = await this.prisma.vacancy.update({ where: { id }, data, include: withCompanyName });
      return toVacancy(record);
    } catch (error) {
      // Si no existía esa vacante, Prisma lanza P2025: se traduce a "undefined" según el contrato.
      if (isRecordNotFound(error)) {
        return undefined;
      }
      // Si la nueva empresa no existe, se traduce igual que al guardar.
      if (isForeignKeyViolation(error)) {
        throw new DomainError(COMPANY_NOT_FOUND_MESSAGE);
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