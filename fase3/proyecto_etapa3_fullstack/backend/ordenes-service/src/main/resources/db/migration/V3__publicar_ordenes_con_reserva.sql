-- Las órdenes existentes siguen visibles.
ALTER TABLE db_ordenes.orden ADD COLUMN publicada BOOLEAN NOT NULL DEFAULT TRUE;
