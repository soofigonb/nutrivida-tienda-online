-- Equipo inicial de la clínica.
INSERT INTO db_profesionales.profesionales
    (nombre, especialidad, experiencia, modalidad, descripcion, imagen_url)
SELECT demo.nombre, demo.especialidad, demo.experiencia, demo.modalidad, demo.descripcion, demo.imagen
FROM (VALUES
    ('Dra. Camila Torres', 'Nutrición clínica y pérdida de peso', 8, 'Mixta',
     'Tratamiento integral de sobrepeso y reeducación alimentaria.', 'nutricionista-1'),
    ('Lic. Mateo Silva', 'Nutrición deportiva y alto rendimiento', 0, 'Presencial',
     'Especialista en composición corporal y rendimiento físico para deportistas.', 'nutricionista-2'),
    ('Dra. Valeria Rojas', 'Control de enfermedades metabólicas', 0, 'Mixta',
     'Tratamiento personalizado para diabetes, hipertensión y dislipidemias.', 'nutricionista-3'),
    ('Lic. Gabriel Morales', 'Alimentación vegetariana y vegana', 0, 'Online',
     'Guía nutricional basada en plantas, suplementación B12 y balance de nutrientes.', 'nutricionista-4')
) AS demo(nombre, especialidad, experiencia, modalidad, descripcion, imagen)
WHERE NOT EXISTS (SELECT 1 FROM db_profesionales.profesionales);
