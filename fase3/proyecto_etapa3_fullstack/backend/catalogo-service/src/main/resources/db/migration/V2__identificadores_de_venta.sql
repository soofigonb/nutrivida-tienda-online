-- Identificador estable para las órdenes.
ALTER TABLE db_catalogo.producto
    ADD COLUMN id_venta BIGINT GENERATED ALWAYS AS IDENTITY (START WITH 1000000000),
    ADD COLUMN codigo VARCHAR(100),
    ADD CONSTRAINT uk_producto_id_venta UNIQUE (id_venta),
    ADD CONSTRAINT uk_producto_codigo UNIQUE (codigo);
