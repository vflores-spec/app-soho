import request from 'supertest';
import app from './app';

describe('GET /vacancies', () => {
  it('responds with 200 and an array', async () => {
    const response = await request(app).get('/vacancies');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('POST /vacancies', () => {
  it('creates a vacancy and responds with 201', async () => {
    const payload = { title: 'QA Tester', company: 'Tech Andes', modality: 'presencial', salary: 800 };

    const response = await request(app).post('/vacancies').send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(payload);
    expect(response.body.id).toBeDefined();
  });

  it('responds with 400 when required fields are missing', async () => {
    const response = await request(app).post('/vacancies').send({ company: 'Tech Andes' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('El título, la empresa y la modalidad son obligatorios');
  });

  it('responds with 400 when salary is not a positive number', async () => {
    const response = await request(app)
      .post('/vacancies')
      .send({ title: 'QA Tester', company: 'Tech Andes', modality: 'remoto', salary: '900' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('El salario debe ser un número mayor que 0');
  });
});

describe('unknown routes', () => {
  it('responds with 404 in JSON', async () => {
    const response = await request(app).get('/unknown');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Ruta no encontrada');
  });
});