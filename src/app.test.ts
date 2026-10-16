// Supertest permite hacer peticiones HTTP a la app sin abrir un puerto.
import request from 'supertest';

// Importa la aplicación ya ensamblada.
import app from './app';

// Datos válidos de ejemplo (datos de prueba en español).
const validPayload = { title: 'QA Tester', company: 'Tech Andes', modality: 'presencial', salary: 800 };

// Crea una vacante por HTTP y devuelve la respuesta (para obtener su id en las pruebas siguientes).
const createVacancy = async () => request(app).post('/vacancies').send(validPayload);

describe('GET /vacancies', () => {
  it('responds with 200 and an array', async () => {
    // Actúa: pide la lista.
    const response = await request(app).get('/vacancies');

    // Verifica: código 200 y que el cuerpo sea un arreglo.
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('POST /vacancies', () => {
  it('creates a vacancy and responds with 201', async () => {
    const response = await request(app).post('/vacancies').send(validPayload);

    // Verifica: 201, que contenga los datos enviados y que tenga un id asignado.
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(validPayload);
    expect(response.body.id).toBeDefined();
  });

  it('responds with 400 when required fields are missing', async () => {
    // Envía solo la empresa: faltan título y modalidad.
    const response = await request(app).post('/vacancies').send({ company: 'Tech Andes' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('El título, la empresa y la modalidad son obligatorios');
  });

  it('responds with 400 when salary is not a positive number', async () => {
    // El salario viene como texto, no como número.
    const response = await request(app).post('/vacancies').send({ ...validPayload, salary: '900' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('El salario debe ser un número mayor que 0');
  });
});

describe('GET /vacancies/:id', () => {
  it('responds with 200 and the vacancy', async () => {
    // Prepara: crea una vacante y toma su id.
    const created = await createVacancy();

    // Actúa: la pide por id.
    const response = await request(app).get(`/vacancies/${created.body.id}`);

    // Verifica: es la misma vacante.
    expect(response.status).toBe(200);
    expect(response.body).toEqual(created.body);
  });

  it('responds with 404 when the vacancy does not exist', async () => {
    const response = await request(app).get('/vacancies/9999');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Vacante no encontrada');
  });

  it('responds with 400 when the id is not a number', async () => {
    const response = await request(app).get('/vacancies/abc');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('El identificador no es válido');
  });
});

describe('PUT /vacancies/:id', () => {
  it('updates the vacancy and responds with 200', async () => {
    const created = await createVacancy();

    // Edita cambiando el salario.
    const response = await request(app)
      .put(`/vacancies/${created.body.id}`)
      .send({ ...validPayload, salary: 1500 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: created.body.id, ...validPayload, salary: 1500 });
  });

  it('responds with 400 when the data is invalid', async () => {
    const created = await createVacancy();

    // Edita con el título vacío.
    const response = await request(app)
      .put(`/vacancies/${created.body.id}`)
      .send({ ...validPayload, title: '' });

    expect(response.status).toBe(400);
  });

  it('responds with 404 when the vacancy does not exist', async () => {
    const response = await request(app).put('/vacancies/9999').send(validPayload);

    expect(response.status).toBe(404);
  });
});

describe('DELETE /vacancies/:id', () => {
  it('deletes the vacancy and responds with 204', async () => {
    const created = await createVacancy();

    // Actúa: la elimina.
    const response = await request(app).delete(`/vacancies/${created.body.id}`);

    // Verifica: 204 y que ya no se pueda encontrar.
    expect(response.status).toBe(204);
    expect((await request(app).get(`/vacancies/${created.body.id}`)).status).toBe(404);
  });

  it('responds with 404 when the vacancy does not exist', async () => {
    const response = await request(app).delete('/vacancies/9999');

    expect(response.status).toBe(404);
  });
});

describe('unknown routes', () => {
  it('responds with 404 in JSON', async () => {
    const response = await request(app).get('/unknown');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Ruta no encontrada');
  });
});