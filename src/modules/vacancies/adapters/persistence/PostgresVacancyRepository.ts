// "Pool" es el grupo de conexiones a la base de datos.
import { Pool } from 'pg';

// Tipos del dominio y el contrato que vamos a cumplir.
import { NewVacancy, Vacancy } from '../../domain/Vacancy';
import { VacancyRepository } from '../../ports/VacancyRepository';

// Cómo llega una fila desde la base de datos.
// OJO: PostgreSQL entrega las columnas NUMERIC como TEXTO, por eso "salary" es string aquí.
type VacancyRow = {
  id: number;
  title: string;
  company: string;
  modality: string;
  salary: string;
};

// Las columnas que pedimos en cada consulta, escritas una sola vez.
const COLUMNS = 'id, title, company, modality, salary';

// Mapeo: convierte una fila de la base en una Vacancy del dominio.
// Aquí el adaptador "traduce": el salario pasa de texto a número con Number().
const toVacancy = (row: VacancyRow): Vacancy => ({
  id: row.id,
  title: row.title,
  company: row.company,
  modality: row.modality,
  salary: Number(row.salary),
});

// Adaptador de salida: cumple el mismo contrato que el repositorio en memoria, pero con PostgreSQL.
export class PostgresVacancyRepository implements VacancyRepository {
  // Recibe el pool desde afuera (inyección de dependencias).
  constructor(private readonly pool: Pool) {}

  // Devuelve todas las vacantes, ordenadas por id.
  findAll = async (): Promise<Vacancy[]> => {
    // "query" envía la consulta SQL a la base y espera el resultado.
    const result = await this.pool.query<VacancyRow>(`SELECT ${COLUMNS} FROM vacancies ORDER BY id`);

    // "rows" son las filas devueltas; cada una se traduce a una Vacancy.
    return result.rows.map(toVacancy);
  };

  // Busca una vacante por id.
  findById = async (id: number): Promise<Vacancy | undefined> => {
    // "$1" es un parámetro: el valor se envía en el arreglo aparte, nunca dentro del texto SQL.
    const result = await this.pool.query<VacancyRow>(`SELECT ${COLUMNS} FROM vacancies WHERE id = $1`, [id]);

    // Si no hubo ninguna fila, devuelve undefined (el servicio decidirá qué significa).
    return result.rows[0] ? toVacancy(result.rows[0]) : undefined;
  };

  // Guarda una vacante nueva.
  save = async (newVacancy: NewVacancy): Promise<Vacancy> => {
    // INSERT agrega una fila. No se envía el id: la base lo genera sola.
    // RETURNING devuelve la fila creada, ya con su id.
    const result = await this.pool.query<VacancyRow>(
      `INSERT INTO vacancies (title, company, modality, salary)
       VALUES ($1, $2, $3, $4)
       RETURNING ${COLUMNS}`,
      [newVacancy.title, newVacancy.company, newVacancy.modality, newVacancy.salary],
    );

    return toVacancy(result.rows[0]);
  };

  // Reemplaza los datos de una vacante existente.
  update = async (id: number, data: NewVacancy): Promise<Vacancy | undefined> => {
    // UPDATE modifica las filas que cumplan el WHERE; RETURNING devuelve la fila ya actualizada.
    const result = await this.pool.query<VacancyRow>(
      `UPDATE vacancies
       SET title = $1, company = $2, modality = $3, salary = $4
       WHERE id = $5
       RETURNING ${COLUMNS}`,
      [data.title, data.company, data.modality, data.salary, id],
    );

    // Si no existía esa vacante, no hay fila y devuelve undefined.
    return result.rows[0] ? toVacancy(result.rows[0]) : undefined;
  };

  // Elimina una vacante.
  remove = async (id: number): Promise<boolean> => {
    // DELETE borra las filas que cumplan el WHERE.
    const result = await this.pool.query('DELETE FROM vacancies WHERE id = $1', [id]);

    // "rowCount" es cuántas filas se borraron. Si fue al menos una, devuelve true.
    return (result.rowCount ?? 0) > 0;
  };
}