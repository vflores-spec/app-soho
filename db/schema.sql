-- Crea la tabla de vacantes solo si todavía no existe (así se puede ejecutar varias veces sin error).
CREATE TABLE IF NOT EXISTS vacancies (
  -- Identificador único. "GENERATED ALWAYS AS IDENTITY" = la base lo numera sola: 1, 2, 3...
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Título del puesto: texto de hasta 150 caracteres. "NOT NULL" = no puede quedar vacío.
  title VARCHAR(150) NOT NULL,

  -- Nombre de la empresa: texto de hasta 150 caracteres, obligatorio.
  company VARCHAR(150) NOT NULL,

  -- Modalidad (remoto, presencial, híbrido): texto corto, obligatorio.
  modality VARCHAR(30) NOT NULL,

  -- Salario: número con hasta 10 dígitos y 2 decimales. "CHECK" obliga a que sea mayor que 0.
  salary NUMERIC(10, 2) NOT NULL CHECK (salary > 0)
);