-- Roles iniciales.
INSERT INTO db_autenticacion.rol (nombre)
VALUES
    -- Acceso administrativo.
    ('ADMINISTRADOR'),
    -- Consulta catálogo y órdenes.
    ('VENDEDOR'),
    -- Acceso a tienda.
    ('CLIENTE');
