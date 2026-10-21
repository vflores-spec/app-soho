import { DomainError } from '../../../shared/DomainError';
import { parseNewCompany } from './Company';

// Datos válidos de ejemplo, con todos los datos flexibles (datos de prueba en español).
const validInput = {
  name: 'Tech Andes',
  industry: 'Tecnología',
  benefits: ['Seguro médico', 'Trabajo remoto'],
  socialLinks: { linkedin: 'https://linkedin.com/company/techandes' },
  locations: [{ city: 'Quito' }],
};

describe('parseNewCompany', () => {
  it('returns the company with all its flexible data', () => {
    expect(parseNewCompany(validInput)).toEqual(validInput);
  });

  it('uses empty defaults when the optional data is missing', () => {
    expect(parseNewCompany({ name: 'DataSur', industry: 'Datos' })).toEqual({
      name: 'DataSur',
      industry: 'Datos',
      benefits: [],
      socialLinks: {},
      locations: [],
    });
  });

  it('throws when name or industry is missing', () => {
    expect(() => parseNewCompany({ industry: 'Tecnología' })).toThrow(DomainError);
  });

  it('throws when benefits is not a list of texts', () => {
    expect(() => parseNewCompany({ ...validInput, benefits: 'remoto' })).toThrow(
      'Los beneficios deben ser una lista de textos',
    );
  });

  it('throws when a location has no city', () => {
    expect(() => parseNewCompany({ ...validInput, locations: [{}] })).toThrow(
      'Cada sede debe tener al menos una ciudad',
    );
  });
});