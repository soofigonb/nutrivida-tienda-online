package cl.nutrivida.pacientes.mapper;

import cl.nutrivida.pacientes.dto.PacienteDTO;
import cl.nutrivida.pacientes.model.Paciente;
import org.springframework.stereotype.Component;

@Component
public class PacienteMapper {

    public PacienteDTO toDTO(Paciente p) {
        PacienteDTO dto = new PacienteDTO();
        dto.setPacienteId(p.getPacienteId());
        dto.setUsuarioId(p.getUsuarioId());
        dto.setRun(p.getRun());
        dto.setNombre(p.getNombre());
        dto.setApellidos(p.getApellidos());
        dto.setCorreo(p.getCorreo());
        dto.setTelefono(p.getTelefono());
        dto.setDireccion(p.getDireccion());
        dto.setFechaNacimiento(p.getFechaNacimiento());
        dto.setRegion(p.getRegion());
        dto.setComuna(p.getComuna());
        dto.setActivo(p.getActivo());
        return dto;
    }

    public Paciente toEntity(PacienteDTO dto) {
        Paciente p = new Paciente();
        p.setPacienteId(dto.getPacienteId());
        p.setUsuarioId(dto.getUsuarioId());
        p.setRun(dto.getRun());
        p.setNombre(dto.getNombre());
        p.setApellidos(dto.getApellidos());
        p.setCorreo(dto.getCorreo());
        p.setTelefono(dto.getTelefono());
        p.setDireccion(dto.getDireccion());
        p.setFechaNacimiento(dto.getFechaNacimiento());
        p.setRegion(dto.getRegion());
        p.setComuna(dto.getComuna());
        p.setActivo(dto.getActivo() != null ? dto.getActivo() : true);
        return p;
    }
}
