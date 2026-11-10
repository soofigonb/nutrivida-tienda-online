-- Un horario activo por profesional.
CREATE UNIQUE INDEX uk_reserva_horario_activo
    ON db_agendamiento.reservas (nutricionista_id, fecha, hora)
    WHERE activo;
