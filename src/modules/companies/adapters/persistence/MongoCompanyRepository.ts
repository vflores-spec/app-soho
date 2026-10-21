// Tipos del controlador de MongoDB: el cliente, el identificador y el documento con su _id.
import { MongoClient, ObjectId, WithId } from 'mongodb';

// Tipos del dominio y el contrato que vamos a cumplir.
import { Company, NewCompany } from '../../domain/Company';
import { CompanyRepository } from '../../ports/CompanyRepository';

// Un ObjectId válido son exactamente 24 caracteres hexadecimales.
const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/i;

// Mapeo: convierte un documento de MongoDB en una Company del dominio.
// Separa "_id" del resto de los datos y lo convierte en el texto "id".
const toCompany = ({ _id, ...data }: WithId<NewCompany>): Company => ({ id: _id.toHexString(), ...data });

// Adaptador de salida: cumple el mismo contrato que el repositorio en memoria, pero con MongoDB.
export class MongoCompanyRepository implements CompanyRepository {
  // La colección "companies". "client.db()" usa la base indicada al final de la URI.
  private readonly collection;

  constructor(client: MongoClient) {
    this.collection = client.db().collection<NewCompany>('companies');
  }

  // Devuelve todas las empresas. "toArray" convierte el resultado en una lista.
  findAll = async (): Promise<Company[]> => {
    const documents = await this.collection.find().toArray();
    return documents.map(toCompany);
  };

  // Busca una empresa por id (texto).
  findById = async (id: string): Promise<Company | undefined> => {
    // Si el texto no tiene forma de ObjectId, no puede existir: se evita que el controlador lance un error.
    if (!OBJECT_ID_PATTERN.test(id)) {
      return undefined;
    }

    // "findOne" devuelve el documento, o null si no hay ninguno.
    const document = await this.collection.findOne({ _id: new ObjectId(id) });
    return document ? toCompany(document) : undefined;
  };

  // Guarda una empresa nueva.
  save = async (newCompany: NewCompany): Promise<Company> => {
    // "insertOne" agrega el campo _id al objeto que recibe, así que se le entrega una COPIA.
    const result = await this.collection.insertOne({ ...newCompany });

    // "insertedId" es el ObjectId que MongoDB asignó; se convierte a texto para el dominio.
    return { id: result.insertedId.toHexString(), ...newCompany };
  };
}