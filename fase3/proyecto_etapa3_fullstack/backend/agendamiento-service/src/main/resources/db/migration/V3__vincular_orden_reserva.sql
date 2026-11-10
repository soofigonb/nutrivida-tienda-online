-- Identifica cada unidad reservada en una orden.
ALTER TABLE db_agendamiento.reservas
    ADD COLUMN orden_id UUID,
    ADD COLUMN item_id BIGINT,
    ADD COLUMN unidad INTEGER,
    ADD CONSTRAINT uk_reserva_orden_unidad UNIQUE (orden_id, item_id, unidad);
