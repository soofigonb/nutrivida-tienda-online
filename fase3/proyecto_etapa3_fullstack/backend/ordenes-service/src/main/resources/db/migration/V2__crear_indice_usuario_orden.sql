-- Acelera las búsquedas.
CREATE INDEX idx_orden_usuario ON db_ordenes.orden(id_usuario);
