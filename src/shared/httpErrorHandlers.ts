// Traemos los tipos de Express que necesitamos para describir los parámetros.
import { NextFunction, Request, Response } from 'express';

// Traemos el error de negocio y los códigos HTTP.
import { DomainError } from './DomainError';
import { HTTP_STATUS } from './httpStatus';

// Se ejecuta cuando ninguna ruta coincidió con la petición: la ruta no existe.
export const notFoundHandler = (req: Request, res: Response): void => {
  // Responde con 404 y un mensaje en JSON (mensaje para el usuario: en español).
  res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Ruta no encontrada' });
};

// Manejador central de errores. Express lo reconoce porque tiene 4 parámetros.
// "Error & { status?: number }" = un error que puede traer, o no, un código de estado.
export const errorHandler = (
  err: Error & { status?: number },
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // CASO 1: se rompió una regla de negocio. El usuario se equivocó: 400 con el mensaje del dominio.
  if (err instanceof DomainError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error: err.message });
    return;
  }

  // CASO 2: otro error. Usa su código si lo trae (ej. 400 por JSON mal escrito); si no, 500.
  const status = err.status ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;

  // Los errores del servidor se registran en la consola para poder revisarlos después.
  if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    console.error(err);
  }

  // Responde siempre en JSON y sin mostrar detalles internos al usuario.
  res.status(status).json({
    error: status < HTTP_STATUS.INTERNAL_SERVER_ERROR ? 'La petición no es válida' : 'Error interno del servidor',
  });
};