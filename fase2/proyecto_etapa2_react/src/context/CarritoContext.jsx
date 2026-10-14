import React, { createContext, useContext, useEffect, useState } from 'react'
import { guardarDatos, leerDatos } from '../utils/storage'

export const CarritoContext = createContext()

export const useCarrito = () => {
  const context = useContext(CarritoContext)
  if (!context) {
    throw new Error('useCarrito debe utilizarse dentro de un CarritoProvider')
  }
  return context
}

export const CarritoProvider = ({ children }) => {
  // Inicialización de reservas leyendo desde localStorage ('carritoNutriVida')
  const [reservas, setReservas] = useState(() => {
    return leerDatos('carritoNutriVida', [])
  })

  // Sincronizar cambios en localStorage cada vez que cambien las reservas
  useEffect(() => {
    guardarDatos('carritoNutriVida', reservas)
  }, [reservas])

  // Total acumulado de las reservas en el carrito
  const total = reservas.reduce((acc, item) => acc + (Number(item.precio) || 0), 0)

  // Cantidad de consultas en el carrito
  const cantidad = reservas.length

  /**
   * Verifica si ya existe una cita para el mismo profesional, fecha y hora.
   * Revisa tanto el carrito actual como las citas ya confirmadas ('citasNutriVida').
   */
  const existeConflictoHorario = (nutricionistaId, fecha, hora, reservaIdIgnorar = null) => {
    const coincidenciaEnCarrito = reservas.some(
      (item) =>
        String(item.nutricionistaId) === String(nutricionistaId) &&
        item.fecha === fecha &&
        item.hora === hora &&
        (!reservaIdIgnorar || item.id !== reservaIdIgnorar)
    )

    if (coincidenciaEnCarrito) return true

    const citasConfirmadas = leerDatos('citasNutriVida', [])
    const coincidenciaEnCitas = citasConfirmadas.some(
      (cita) =>
        String(cita.nutricionistaId) === String(nutricionistaId) &&
        cita.fecha === fecha &&
        cita.hora === hora
    )

    return coincidenciaEnCitas
  }

  /**
   * Agrega una reserva al carrito con validación de duplicados.
   */
  const agregarReserva = (datosReserva) => {
    const { nutricionistaId, fecha, hora } = datosReserva

    if (existeConflictoHorario(nutricionistaId, fecha, hora)) {
      return {
        exito: false,
        mensaje:
          'Ya existe una reserva agendada para este nutricionista en la misma fecha y horario.',
      }
    }

    const nuevaReserva = {
      id: datosReserva.id || `reserva-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      pacienteId: datosReserva.pacienteId || null,
      nutricionistaId: datosReserva.nutricionistaId,
      nutricionistaNombre: datosReserva.nutricionistaNombre || '',
      planId: datosReserva.planId,
      servicio: datosReserva.servicio,
      precio: Number(datosReserva.precio) || 0,
      fecha: datosReserva.fecha,
      hora: datosReserva.hora,
      motivo: datosReserva.motivo?.trim() || '',
    }

    setReservas((prev) => [...prev, nuevaReserva])
    return { exito: true, reserva: nuevaReserva }
  }

  /**
   * Elimina una reserva individual por su ID.
   */
  const eliminarReserva = (id) => {
    setReservas((prev) => prev.filter((item) => item.id !== id))
    return { exito: true }
  }

  /**
   * Vacía completamente el carrito.
   */
  const vaciarCarrito = () => {
    setReservas([])
    guardarDatos('carritoNutriVida', [])
  }

  /**
   * Confirma las reservas del carrito, creando las citas persistidas en 'citasNutriVida'.
   * @param {Object|null} pacienteSesion - Datos del paciente en sesión (opcional)
   * @param {boolean} simularFallo - Permite simular una falla controlada para pruebas
   */
  const confirmarReservas = (pacienteSesion = null, simularFallo = false) => {
    if (reservas.length === 0) {
      return {
        exito: false,
        mensaje: 'El carrito está vacío. Agrega una consulta antes de confirmar.',
      }
    }

    if (simularFallo) {
      return {
        exito: false,
        mensaje:
          'Simulación de fallo: No fue posible procesar el pago o confirmación. Las reservas se conservan en tu carrito.',
      }
    }

    try {
      const citasActuales = leerDatos('citasNutriVida', [])
      const nuevasCitas = reservas.map((reserva) => ({
        ...reserva,
        idCita: `cita-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        fechaConfirmacion: new Date().toISOString(),
        pacienteId: pacienteSesion?.id || reserva.pacienteId || 'paciente-invitado',
        pacienteNombre: pacienteSesion?.nombre || 'Paciente',
        pacienteCorreo: pacienteSesion?.correo || '',
        estado: 'confirmada',
      }))

      const historialActualizado = [...citasActuales, ...nuevasCitas]
      guardarDatos('citasNutriVida', historialActualizado)

      // Se limpia el carrito solo tras confirmar exitosamente
      vaciarCarrito()

      return {
        exito: true,
        citasCreadas: nuevasCitas,
        mensaje: '¡Agendamiento confirmado con éxito!',
      }
    } catch (error) {
      console.error('Error al confirmar reservas:', error)
      return {
        exito: false,
        mensaje: 'Ocurrió un error al guardar la confirmación en el navegador.',
      }
    }
  }

  return (
    <CarritoContext.Provider
      value={{
        reservas,
        agregarReserva,
        eliminarReserva,
        vaciarCarrito,
        confirmarReservas,
        existeConflictoHorario,
        cantidad,
        total,
      }}
    >
      {children}
    </CarritoContext.Provider>
  )
}
