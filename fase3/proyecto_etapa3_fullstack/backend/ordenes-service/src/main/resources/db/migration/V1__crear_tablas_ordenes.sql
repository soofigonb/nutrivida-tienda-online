-- Tabla de órdenes.
CREATE TABLE db_ordenes.orden (
    -- Identificador único.
    id UUID PRIMARY KEY,
    -- Usuario propietario.
    id_usuario UUID NOT NULL,
    -- Evita órdenes duplicadas.
    clave_idempotencia UUID NOT NULL,
    -- Estados permitidos.
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('PENDIENTE', 'CONFIRMADA', 'CANCELADA')),
    -- Total en CLP.
    total NUMERIC(12,0) NOT NULL CHECK (total >= 0),
    -- Fecha de creación.
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL,
    -- Control de concurrencia.
    version BIGINT NOT NULL DEFAULT 0,
    -- Impide duplicados.
    CONSTRAINT uk_orden_usuario_clave UNIQUE (id_usuario, clave_idempotencia)
);

-- Tabla de detalles.
CREATE TABLE db_ordenes.detalle_orden (
    -- Identificador único.
    id UUID PRIMARY KEY,
    -- Orden relacionada.
    id_orden UUID NOT NULL REFERENCES db_ordenes.orden(id),
    -- Plan del catálogo.
    id_plan BIGINT NOT NULL,
    -- Nombre al comprar.
    nombre_plan VARCHAR(150) NOT NULL,
    -- Entre 1 y 100.
    cantidad INTEGER NOT NULL CHECK (cantidad BETWEEN 1 AND 100),
    -- Precio en CLP.
    precio_unitario NUMERIC(12,0) NOT NULL CHECK (precio_unitario >= 0)
);
