ALTER TABLE db_agendamiento.reservas
    ADD COLUMN IF NOT EXISTS usuario_id UUID;

