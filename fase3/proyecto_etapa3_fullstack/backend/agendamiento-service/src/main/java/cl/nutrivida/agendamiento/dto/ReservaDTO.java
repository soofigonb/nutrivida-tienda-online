package cl.nutrivida.agendamiento.dto;

import java.util.UUID;

public class ReservaDTO {

    private Long reservaId;
    private UUID usuarioId;

    private UUID ordenId;
    private Long itemId;
    private Integer unidad;
    private Long pacienteId;
    private String planId;
    private String servicio;
    private Integer precio;
    private Long nutricionistaId;
    private String nutricionistaNombre;
    private String fecha;
    private String hora;
    private String motivo;
    private String estado;
    private Boolean activo;

    public Long getReservaId() {
        return reservaId;
    }

    public void setReservaId(Long reservaId) {
        this.reservaId = reservaId;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(UUID usuarioId) {
        this.usuarioId = usuarioId;
    }

    public Long getPacienteId() {
        return pacienteId;
    }

    public UUID getOrdenId() { return ordenId; }
    public void setOrdenId(UUID ordenId) { this.ordenId = ordenId; }
    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }
    public Integer getUnidad() { return unidad; }
    public void setUnidad(Integer unidad) { this.unidad = unidad; }

    public void setPacienteId(Long pacienteId) {
        this.pacienteId = pacienteId;
    }

    public String getPlanId() {
        return planId;
    }

    public void setPlanId(String planId) {
        this.planId = planId;
    }

    public String getServicio() {
        return servicio;
    }

    public void setServicio(String servicio) {
        this.servicio = servicio;
    }

    public Integer getPrecio() {
        return precio;
    }

    public void setPrecio(Integer precio) {
        this.precio = precio;
    }

    public Long getNutricionistaId() {
        return nutricionistaId;
    }

    public void setNutricionistaId(Long nutricionistaId) {
        this.nutricionistaId = nutricionistaId;
    }

    public String getNutricionistaNombre() {
        return nutricionistaNombre;
    }

    public void setNutricionistaNombre(String nutricionistaNombre) {
        this.nutricionistaNombre = nutricionistaNombre;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public String getHora() {
        return hora;
    }

    public void setHora(String hora) {
        this.hora = hora;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
