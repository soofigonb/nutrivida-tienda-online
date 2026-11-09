-- Planes de la tienda.
INSERT INTO db_catalogo.categoria (id, nombre, activo, creado_en, actualizado_en, version)
VALUES ('e24694e1-cacd-4d38-9808-74cad316dd09', 'Planes nutricionales', TRUE, NOW(), NOW(), 0)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO db_catalogo.producto
    (id, nombre, descripcion, precio, stock, activo, creado_en, actualizado_en, version, id_categoria, codigo)
SELECT plan.id::UUID, plan.nombre, plan.descripcion, plan.precio, 100, TRUE, NOW(), NOW(), 0,
       categoria.id, plan.codigo
FROM (VALUES
    ('eb4622dd-eaf4-49e9-8b43-8d24063e694b', 'Evaluación y consulta inicial',
     'Evaluación antropométrica, diagnóstico nutricional y pauta de alimentación personalizada.', 35000, 'consulta-inicial'),
    ('0e046931-ebfb-481a-8133-5c8b2052ef39', 'Plan nutricional integral',
     'Incluye dos controles mensuales, ajuste de minuta, seguimiento y guía de compras.', 60000, 'plan-integral'),
    ('71cf9b69-7a5a-4dc4-b634-f66931266d32', 'Plan de nutrición deportiva',
     'Estrategias de alimentación, suplementación personalizada y análisis del rendimiento.', 50000, 'nutricion-deportiva')
) AS plan(id, nombre, descripcion, precio, codigo)
CROSS JOIN db_catalogo.categoria AS categoria
WHERE categoria.nombre = 'Planes nutricionales'
  AND NOT EXISTS (SELECT 1 FROM db_catalogo.producto WHERE LOWER(nombre) = LOWER(plan.nombre))
ON CONFLICT (id) DO NOTHING;

UPDATE db_catalogo.producto AS producto
SET codigo = plan.codigo, actualizado_en = NOW(), version = producto.version + 1
FROM (VALUES
    ('Evaluación y consulta inicial', 'consulta-inicial'),
    ('Plan nutricional integral', 'plan-integral'),
    ('Plan de nutrición deportiva', 'nutricion-deportiva')
) AS plan(nombre, codigo)
WHERE producto.id = (
    SELECT candidato.id FROM db_catalogo.producto AS candidato
    WHERE LOWER(candidato.nombre) = LOWER(plan.nombre)
    ORDER BY candidato.activo DESC, candidato.id
    LIMIT 1
) AND producto.codigo IS NULL;
