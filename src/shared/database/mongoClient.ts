// "MongoClient" es el objeto que se conecta al servidor de MongoDB.
import { MongoClient } from 'mongodb';

// Crea el cliente a partir de la dirección (URI). Se conecta solo en la primera operación.
export const createMongoClient = (uri: string): MongoClient => new MongoClient(uri);