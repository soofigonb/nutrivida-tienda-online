-- Acelera las búsquedas.
CREATE INDEX idx_token_renovacion_usuario
    ON db_autenticacion.token_renovacion (id_usuario);

-- Acelera las búsquedas.
CREATE INDEX idx_token_renovacion_familia
    ON db_autenticacion.token_renovacion (familia_id);

-- Acelera las búsquedas.
CREATE INDEX idx_token_renovacion_expiracion
    ON db_autenticacion.token_renovacion (expira_en);
