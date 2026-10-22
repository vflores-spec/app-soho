// "mongoose" es la librería; "Connection" es el tipo de una conexión a MongoDB.
import mongoose, { Connection } from 'mongoose';

// Crea una conexión a partir de la dirección (URI).
// "createConnection" crea una conexión PROPIA (en vez de una global), lo que facilita las pruebas.
// serverSelectionTimeoutMS: si no encuentra el servidor en 3 segundos, falla con un error claro.
export const createMongooseConnection = (uri: string): Connection =>
  mongoose.createConnection(uri, { serverSelectionTimeoutMS: 3000 });