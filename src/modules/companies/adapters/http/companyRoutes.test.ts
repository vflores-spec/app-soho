// Supertest hace peticiones HTTP a la app sin abrir un puerto.
import request from 'supertest';

// "../../../../" sube cuatro carpetas hasta src, donde está app.ts.
import app from '../../../../app';

// Empresa de ejemplo con datos flexibles (datos de prueba en español).
const validPayload = {
  name: 'Tech Andes',
  industry: 'Tecnología',
  benefits: ['Seguro médico', 'Trabajo remoto'],
  socialLinks: { linkedin: 'https://linkedin.com/company/techandes' },
  locations: [{ city: 'Quito' }, { city: 'Guayaquil' }],
};

describe('POST /companies', () => {
  it('creates a company with its flexible data and responds with 201', async () => {
    const response = await request(app).post('/companies').send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(validPayload);
    expect(response.body.id).toBeDefined();
  });

  it('responds with 400 when required fields are missing', async () => {
    const response = await request(app).post('/companies').send({ industry: 'Tecnología' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('El nombre y el sector son obligatorios');
  });
});

describe('GET /companies', () => {
  it('responds with 200 and an array', async () => {
    const response = await request(app).get('/companies');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('GET /companies/:id', () => {
  it('responds with 200 and the company', async () => {
    const created = await request(app).post('/companies').send(validPayload);

    const response = await request(app).get(`/companies/${created.body.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(created.body);
  });

  it('responds with 404 when the company does not exist', async () => {
    const response = await request(app).get('/companies/999');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Empresa no encontrada');
  });
});