-- Estados iniciales.
INSERT INTO db_autenticacion.estado_usuario (nombre)
VALUES
    -- Pendiente de activación.
    ('PENDIENTE'),
    -- Puede iniciar sesión.
    ('ACTIVO'),
    -- Acceso bloqueado.
    ('BLOQUEADO'),
    -- Cuenta desactivada.
    ('INACTIVO');
