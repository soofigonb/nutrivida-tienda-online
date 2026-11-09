package cl.nutrivida.agendamiento.mapper;

import cl.nutrivida.agendamiento.dto.ReservaDTO;
import cl.nutrivida.agendamiento.model.Reserva;
import org.springframework.stereotype.Component;

@Component
public class ReservaMapper {

    public ReservaDTO toDTO(Reserva r) {
        ReservaDTO dto = new ReservaDTO();
        dto.setReservaId(r.getReservaId());
        dto.setUsuarioId(r.getUsuarioId());
        dto.setPacienteId(r.getPacienteId());
        dto.setPlanId(r.getPlanId());
        dto.setServicio(r.getServicio());
        dto.setPrecio(r.getPrecio());
        dto.setNutricionistaId(r.getNutricionistaId());
        dto.setNutricionistaNombre(r.getNutricionistaNombre());
        dto.setFecha(r.getFecha());
        dto.setHora(r.getHora());
        dto.setMotivo(r.getMotivo());
        dto.setEstado(r.getEstado());
        dto.setActivo(r.getActivo());
        return dto;
    }

    public Reserva toEntity(ReservaDTO dto) {
        Reserva r = new Reserva();
        r.setReservaId(dto.getReservaId());
        r.setUsuarioId(dto.getUsuarioId());
        r.setPacienteId(dto.getPacienteId());
        r.setPlanId(dto.getPlanId());
        r.setServicio(dto.getServicio());
        r.setPrecio(dto.getPrecio());
        r.setNutricionistaId(dto.getNutricionistaId());
        r.setNutricionistaNombre(dto.getNutricionistaNombre());
        r.setFecha(dto.getFecha());
        r.setHora(dto.getHora());
        r.setMotivo(dto.getMotivo());
        r.setEstado(dto.getEstado() != null ? dto.getEstado() : "CONFIRMADA");
        r.setActivo(dto.getActivo() != null ? dto.getActivo() : true);
        return r;
    }
}
