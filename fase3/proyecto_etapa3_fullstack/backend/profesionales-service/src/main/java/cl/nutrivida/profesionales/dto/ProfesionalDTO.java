package cl.nutrivida.profesionales.dto;

public class ProfesionalDTO {

    private Long profesionalId;
    private String nombre;
    private String especialidad;
    private Integer experiencia;
    private String modalidad;
    private String descripcion;
    private String imagenUrl;
    private Boolean activo;

    public Long getProfesionalId() { return profesionalId; }
    public void setProfesionalId(Long profesionalId) { this.profesionalId = profesionalId; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }
    public Integer getExperiencia() { return experiencia; }
    public void setExperiencia(Integer experiencia) { this.experiencia = experiencia; }
    public String getModalidad() { return modalidad; }
    public void setModalidad(String modalidad) { this.modalidad = modalidad; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}