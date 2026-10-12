// Códigos de estado HTTP con nombre, para no escribir números sueltos en el código.
// "as const" hace que los valores queden fijos y no se puedan modificar.
export const HTTP_STATUS = {
  OK: 200, // todo salió bien
  CREATED: 201, // se creó un recurso nuevo
  BAD_REQUEST: 400, // el cliente envió algo inválido
  NOT_FOUND: 404, // la ruta no existe
  INTERNAL_SERVER_ERROR: 500, // falló el servidor
} as const;