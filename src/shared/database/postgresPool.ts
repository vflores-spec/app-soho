// "Pool" es un grupo de conexiones a la base de datos que se reutilizan, en lugar de abrir una nueva 
// en cada consulta.
import { Pool } from 'pg';

// Crea el pool a partir de la cadena de conexión (la URL). Se llama una sola vez, al arrancar la aplicación.
export const createPostgresPool = (connectionString: string): Pool => new Pool({ connectionString });