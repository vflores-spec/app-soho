// "Schema" describe un documento; "Connection" y "Model" son tipos de Mongoose.
import { Connection, Model, Schema } from 'mongoose';

// Tipos del dominio y el contrato que vamos a cumplir.
import { Company, NewCompany } from '../../domain/Company';
import { CompanyRepository } from '../../ports/CompanyRepository';

// Un ObjectId válido son exactamente 24 caracteres hexadecimales.
const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/i;

// ESQUEMA de una sede: solo tiene "city". "_id: false" evita que Mongoose le agregue un identificador propio.
const locationSchema = new Schema({ city: { type: String, required: true } }, { _id: false });

// ESQUEMA de una empresa: cómo debe ser cada documento de la colección.
const companySchema = new Schema<NewCompany>(
  {
    // Texto obligatorio.
    name: { type: String, required: true },
    industry: { type: String, required: true },

    // Lista de textos; si no se envía, queda como lista vacía.
    benefits: { type: [String], default: [] },

    // Objeto de forma libre (nombre de red → enlace). El dominio ya lo validó.
    socialLinks: { type: Schema.Types.Mixed, default: {} },

    // Lista de sedes, cada una con el esquema anterior.
    locations: { type: [locationSchema], default: [] },
  },
  // "versionKey: false" evita el campo extra "__v".
  { versionKey: false },
);

// Cómo llega un documento desde Mongoose: los datos de la empresa más su _id.
type CompanyRecord = NewCompany & { _id: { toString: () => string } };

// Mapeo: convierte un documento en una Company del dominio, campo por campo.
// Así el dominio recibe SOLO lo que espera: "_id" pasa a "id" (texto) y se copian las listas.
const toCompany = (record: CompanyRecord): Company => ({
  id: record._id.toString(),
  name: record.name,
  industry: record.industry,
  benefits: [...record.benefits],
  socialLinks: { ...record.socialLinks },
  locations: record.locations.map((location) => ({ city: location.city })),
});

// Adaptador de salida: cumple el mismo contrato que los otros repositorios, pero con Mongoose.
export class MongooseCompanyRepository implements CompanyRepository {
  // El MODELO: la "ventanilla" para operar sobre la colección "companies".
  private readonly model: Model<NewCompany>;

  // Recibe la conexión desde afuera (inyección de dependencias) y crea el modelo sobre ella.
  constructor(connection: Connection) {
    this.model = connection.model<NewCompany>('Company', companySchema, 'companies');
  }

  // Devuelve todas las empresas. ".lean()" entrega objetos simples en lugar de documentos de Mongoose.
  findAll = async (): Promise<Company[]> => {
    const records = await this.model.find().lean();
    return records.map(toCompany);
  };

  // Busca una empresa por id (texto).
  findById = async (id: string): Promise<Company | undefined> => {
    // Si no tiene forma de ObjectId no puede existir: se evita que Mongoose lance un error.
    if (!OBJECT_ID_PATTERN.test(id)) {
      return undefined;
    }

    // "findById" devuelve el documento, o null si no existe.
    const record = await this.model.findById(id).lean();
    return record ? toCompany(record) : undefined;
  };

  // Guarda una empresa nueva.
  save = async (newCompany: NewCompany): Promise<Company> => {
    // "create" valida contra el esquema, guarda y devuelve el documento con su _id.
    const created = await this.model.create(newCompany);

    // "toObject" convierte el documento de Mongoose en un objeto simple.
    return toCompany(created.toObject());
  };
}