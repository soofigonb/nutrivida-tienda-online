CREATE SCHEMA IF NOT EXISTS db_catalogo;

CREATE TABLE IF NOT EXISTS db_catalogo.categoria (
    id UUID PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(500),
    activo BOOLEAN NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL,
    actualizado_en TIMESTAMPTZ NOT NULL,
    version BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS db_catalogo.producto (
    id UUID PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    precio NUMERIC(10, 2) NOT NULL,
    stock INTEGER NOT NULL,
    imagen_url VARCHAR(500),
    activo BOOLEAN NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL,
    id_categoria UUID NOT NULL REFERENCES db_catalogo.categoria(id),
    actualizado_en TIMESTAMPTZ NOT NULL,
    version BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_producto_id_categoria
    ON db_catalogo.producto(id_categoria);