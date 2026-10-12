// Importa Express (el framework) y los tipos que usaremos en el manejador de errores
import express, { NextFunction, Request, Response } from 'express';

// Códigos de estado HTTP con nombre, para no escribir números sueltos
const HTTP_STATUS = {
  OK: 200, // todo salió bien
  CREATED: 201, // se creó un recurso nuevo
  BAD_REQUEST: 400, // el cliente envió algo inválido
  NOT_FOUND: 404, // la ruta no existe
  INTERNAL_SERVER_ERROR: 500, // falló el servidor
} as const; // "as const": los valores quedan fijos y no se pueden cambiar

// Describe la forma de una vacante (solo existe para el compilador, no al ejecutar)
interface Vacancy {
  id: number; // identificador único
  title: string; // título del puesto
  company: string; // nombre de la empresa
  modality: string; // remoto, presencial o híbrido
  salary: number; // salario ofrecido
}

// Los datos que envía el cliente: una vacante sin "id" (el servidor lo asigna)
type CreateVacancyInput = Omit<Vacancy, 'id'>;

// Revisa los datos de entrada. Devuelve el mensaje de error, o null si todo está bien
const validateVacancy = (input: Partial<CreateVacancyInput>): string | null => {
  // Saca las cuatro propiedades del objeto en una sola línea (destructuring)
  const { title, company, modality, salary } = input;

  // Cada texto debe ser realmente un string y no estar vacío (ni solo espacios)
  if (typeof title !== 'string' || !title.trim() ||
      typeof company !== 'string' || !company.trim() ||
      typeof modality !== 'string' || !modality.trim()) {
    // Mensaje para el usuario: va en español
    return 'El título, la empresa y la modalidad son obligatorios';
  }
  // El salario debe ser un número y mayor que cero
  if (typeof salary !== 'number' || salary <= 0) {
    return 'El salario debe ser un número mayor que 0';
  }
  // null significa "no hay errores"
  return null;
};

// Crea la aplicación de Express
const app = express();
// Middleware: convierte el JSON que llega en un objeto disponible en req.body
app.use(express.json());

// Datos de prueba en memoria (todavía no hay base de datos)
const vacancies: Vacancy[] = [
  { id: 1, title: 'Desarrollador Backend Jr', company: 'Tech Andes', modality: 'remoto', salary: 900 },
  { id: 2, title: 'Analista de Datos', company: 'DataSur', modality: 'híbrido', salary: 1100 },
];
// Contador para asignar el siguiente id sin repetirlo nunca
let nextId = vacancies.length + 1;

// Ruta GET /vacancies: devuelve todas las vacantes
app.get('/vacancies', (req, res) => {
  // Responde con código 200 y la lista en formato JSON
  res.status(HTTP_STATUS.OK).json(vacancies);
});

// Ruta POST /vacancies: crea una vacante nueva
app.post('/vacancies', (req, res) => {
  // Toma el cuerpo de la petición y lo trata como datos de una vacante nueva
  const input = req.body as CreateVacancyInput;
  // Valida los datos; si el cuerpo viene vacío usa un objeto vacío para no fallar
  const error = validateVacancy(input ?? {});

  // Si hubo error, se responde y se sale de la función
  if (error) {
    // 400 = el cliente envió datos inválidos
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error });
    // "return" evita que siga ejecutando el resto del código
    return;
  }

  // Arma la vacante campo por campo, así no se cuelan datos extra del usuario
  const newVacancy: Vacancy = {
    id: nextId++, // usa el id actual y luego suma 1 al contador
    title: input.title.trim(), // quita espacios sobrantes
    company: input.company.trim(),
    modality: input.modality.trim(),
    salary: input.salary,
  };
  // La guarda en la lista en memoria
  vacancies.push(newVacancy);
  // 201 = creada; devuelve la vacante con su id
  res.status(HTTP_STATUS.CREATED).json(newVacancy);
});

// Se ejecuta si ninguna ruta anterior coincidió: la ruta no existe
app.use((req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Ruta no encontrada' });
});

// Manejador de errores: Express lo reconoce porque tiene 4 parámetros
app.use((err: Error & { status?: number }, req: Request, res: Response, next: NextFunction) => {
  // Usa el código del error si lo trae (ej. 400 por JSON mal escrito); si no, 500
  const status = err.status ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
  // Los errores del servidor se registran en la consola para poder revisarlos
  if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) console.error(err);
  // Responde siempre en JSON, sin mostrar detalles internos al usuario
  res.status(status).json({
    error: status < HTTP_STATUS.INTERNAL_SERVER_ERROR ? 'La petición no es válida' : 'Error interno del servidor',
  });
});

// Exporta la app para que server.ts la encienda y los tests la importen
export default app;