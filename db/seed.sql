-- Datos de ejemplo (datos de prueba en español).
-- Primero las empresas: gen_random_uuid() crea el id de texto, igual que hace Prisma.
INSERT INTO companies (id, name, industry, benefits, social_links, locations) VALUES
  (gen_random_uuid()::text, 'Tech Andes', 'Tecnología', ARRAY['Seguro médico', 'Trabajo remoto'],
   '{"linkedin": "https://linkedin.com/company/techandes"}', '[{"city": "Quito"}, {"city": "Guayaquil"}]'),
  (gen_random_uuid()::text, 'DataSur', 'Análisis de datos', ARRAY['Capacitación'],
   '{}', '[{"city": "Cuenca"}]');

-- Después las vacantes. Cada una busca el id de su empresa por nombre: así se respeta la clave foránea.
INSERT INTO vacancies (title, modality, salary, company_id) VALUES
  ('Desarrollador Backend Jr', 'remoto', 900, (SELECT id FROM companies WHERE name = 'Tech Andes')),
  ('QA Tester', 'remoto', 800, (SELECT id FROM companies WHERE name = 'Tech Andes')),
  ('Analista de Datos', 'híbrido', 1100, (SELECT id FROM companies WHERE name = 'DataSur'));