// Códigos de estado HTTP con nombre, para no escribir números sueltos en el código.
export const HTTP_STATUS = {
  OK: 200, // todo salió bien
  CREATED: 201, // se creó un recurso nuevo
  NO_CONTENT: 204, // todo salió bien y no hay nada que devolver (ej. al eliminar)
  BAD_REQUEST: 400, // el cliente envió algo inválido
  NOT_FOUND: 404, // el recurso o la ruta no existe
  INTERNAL_SERVER_ERROR: 500, // falló el servidor
} as const;