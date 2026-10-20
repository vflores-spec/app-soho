// Carga las variables del archivo .env. DEBE ir primero: así están disponibles
// cuando se importan las demás piezas.
import 'dotenv/config';

// Importa la aplicación ya configurada (ahora sí encuentra DATABASE_URL).
import app from './app';

// Lee el puerto de la variable de entorno PORT; si no existe, usa 3000.
const PORT = Number(process.env.PORT) || 3000;

// Enciende el servidor y avisa por consola cuando está listo.
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});