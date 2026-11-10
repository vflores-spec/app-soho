module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  // Las pruebas de integración comparten tablas de la base de datos: se ejecutan una a la vez para que no se pisen.
  maxWorkers: 1,
};