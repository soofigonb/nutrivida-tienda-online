ALTER TABLE db_pacientes.pacientes
    ADD COLUMN IF NOT EXISTS usuario_id UUID UNIQUE;

ALTER TABLE db_pacientes.pacientes
    ALTER COLUMN correo DROP NOT NULL;

