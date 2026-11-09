import { api } from './api.js'

export async function registrarCitasDesdeCarrito(reservas = []) {
  if (typeof api.solicitar !== 'function') return []
  const citas = []
  for (const reserva of reservas) {
    const cita = await api.solicitar('agendamiento', {
      method: 'POST',
      body: {
        planId: String(reserva.planId),
        servicio: reserva.servicio,
        precio: Number(reserva.precio),
        nutricionistaId: Number(reserva.nutricionistaId),
        nutricionistaNombre: reserva.nutricionistaNombre,
        fecha: reserva.fecha,
        hora: reserva.hora,
        motivo: reserva.motivo,
      },
    })
    if (cita) citas.push(cita)
  }
  return citas
}

export async function listarCitasPropias() {
  if (typeof api.solicitar !== 'function') return []
  const lista = await api.solicitar('agendamiento')
  return Array.isArray(lista) ? lista : []
}

