import { api } from './api.js'

export function consultarDisponibilidad(nutricionistaId, fecha, hora, { signal, cliente = api } = {}) {
  const parametros = new URLSearchParams({ nutricionistaId, fecha, hora })
  return cliente.solicitar(`agendamiento/disponibilidad?${parametros}`, { publica: true, signal })
}

export async function registrarCitasDesdeCarrito(reservas, orden) {
  const citas = []
  const pendientes = []
  for (const [indice, reserva] of reservas.entries()) {
    try {
      const referencia = orden.unidades?.[indice]
      if (!referencia) throw new Error('No se encontró la unidad de esta consulta en la orden.')
      const cita = await api.solicitar('agendamiento', {
        method: 'POST',
        body: {
          ordenId: orden.id,
          itemId: referencia.idItem,
          unidad: referencia.unidad,
          nutricionistaId: Number(reserva.nutricionistaId),
          fecha: reserva.fecha,
          hora: reserva.hora,
          motivo: reserva.motivo,
        },
      })
      if (!cita?.reservaId) throw new Error('El servicio no devolvió un identificador de cita.')
      citas.push(cita)
    } catch (error) {
      pendientes.push({ id: reserva.id, servicio: reserva.servicio, motivo: error.message })
    }
  }
  return { citas, pendientes }
}

export function cancelarCita(id) {
  return api.solicitar(`agendamiento/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function reprogramarCita(id, datos) {
  return api.solicitar(`agendamiento/${encodeURIComponent(id)}`, { method: 'PUT', body: datos })
}

