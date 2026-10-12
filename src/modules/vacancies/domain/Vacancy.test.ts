// Traemos el error esperado y la función que vamos a probar
import { DomainError } from '../../../shared/DomainError';
import { parseNewVacancy } from './Vacancy';

// "describe" agrupa las pruebas de una misma cosa y le pone título
describe('parseNewVacancy', () => {
  // "it" es UNA prueba. Se lee como una frase: "it returns the vacancy data trimmed"
  it('returns the vacancy data trimmed', () => {
    // ACTUAR: llamamos a la función con espacios sobrantes en el título
    const result = parseNewVacancy({ title: ' QA Tester ', company: 'Tech Andes', modality: 'remoto', salary: 800 });

    // VERIFICAR: esperamos que los espacios hayan desaparecido
    expect(result).toEqual({ title: 'QA Tester', company: 'Tech Andes', modality: 'remoto', salary: 800 });
  });

  it('throws when a required field is missing', () => {
    // Para probar que algo LANZA un error, se envuelve en una función flecha
    // y se verifica con "toThrow". Aquí falta el título.
    expect(() => parseNewVacancy({ company: 'Tech Andes' })).toThrow(DomainError);
  });

  it('throws when salary is not a positive number', () => {
    // Con salario 0 debe lanzar el error con este mensaje exacto
    expect(() => parseNewVacancy({ title: 'QA', company: 'Tech', modality: 'remoto', salary: 0 })).toThrow(
      'El salario debe ser un número mayor que 0',
    );
  });
});