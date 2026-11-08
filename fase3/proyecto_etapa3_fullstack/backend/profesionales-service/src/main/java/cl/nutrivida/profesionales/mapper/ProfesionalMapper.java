package cl.nutrivida.profesionales.mapper;

import cl.nutrivida.profesionales.dto.ProfesionalDTO;
import cl.nutrivida.profesionales.model.Profesional;
import org.springframework.stereotype.Component;

@Component
public class ProfesionalMapper {

    public ProfesionalDTO toDTO(Profesional p) {
        ProfesionalDTO dto = new ProfesionalDTO();
        dto.setProfesionalId(p.getProfesionalId());
        dto.setNombre(p.getNombre());
        dto.setEspecialidad(p.getEspecialidad());
        dto.setExperiencia(p.getExperiencia());
        dto.setModalidad(p.getModalidad());
        dto.setDescripcion(p.getDescripcion());
        dto.setImagenUrl(p.getImagenUrl());
        dto.setActivo(p.getActivo());
        return dto;
    }

    public Profesional toEntity(ProfesionalDTO dto) {
        Profesional p = new Profesional();
        p.setProfesionalId(dto.getProfesionalId());
        p.setNombre(dto.getNombre());
        p.setEspecialidad(dto.getEspecialidad());
        p.setExperiencia(dto.getExperiencia());
        p.setModalidad(dto.getModalidad());
        p.setDescripcion(dto.getDescripcion());
        p.setImagenUrl(dto.getImagenUrl());
        p.setActivo(dto.getActivo());
        return p;
    }
}