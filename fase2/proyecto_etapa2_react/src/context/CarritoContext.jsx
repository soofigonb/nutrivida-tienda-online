import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import planes from '../data/planes'
import nutricionistasIniciales from '../data/nutricionistas'
import { esFechaHoraFutura } from '../utils/validaciones'

// ========================================
// 1. CONTEXTO Y ALMACENAMIENTO
// ========================================

export const CarritoContext = createContext(null)

const CLAVE_CARRITO = 'carritoNutriVida'
const CLAVE_CITAS = 'citasNutriVida'

function leerLista(clave, alternativa = []) {
  const contenido = localStorage.getItem(clave)

  if (contenido === null) {
    return alternativa
  }

  const lista = JSON.parse(contenido)

  if (
    !Array.isArray(lista) ||
    lista.some(
      (item) =>
        !item ||
        typeof item !== 'object' ||
        Array.isArray(item),
    )
  ) {
    throw new Error(
      'Los datos guardados no tienen un formato válido.',
    )
  }

  return lista
}

function mismoHorario(a, b) {
  return (
    String(a.nutricionistaId) ===
      String(b.nutricionistaId) &&
    a.fecha === b.fecha &&
    a.hora === b.hora
  )
}

function cargarCarrito() {
  try {
    return {
      reservas: leerLista(CLAVE_CARRITO),
      errorCarrito: '',
    }
  } catch {
    return {
      reservas: [],
      errorCarrito:
        'No se pudo leer el carrito. Los datos guardados se conservaron.',
    }
  }
}

function crearId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `reserva-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`
  )
}

// ========================================
// 2. VALIDAR Y NORMALIZAR UNA RESERVA
// ========================================

function prepararReserva(reserva, profesionales) {
  const horariosPermitidos = [
    '09:00',
    '11:00',
    '15:00',
    '17:00',
  ]

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      reserva.fecha || '',
    ) ||
    !horariosPermitidos.includes(reserva.hora)
  ) {
    throw new Error(
      'Revisa la fecha y el horario de la reserva.',
    )
  }

  const [anio, mes, dia] = reserva.fecha
    .split('-')
    .map(Number)

  const fecha = new Date(anio, mes - 1, dia)

  if (
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia ||
    !esFechaHoraFutura(
      reserva.fecha,
      reserva.hora,
    )
  ) {
    throw new Error(
      'La fecha y el horario deben ser futuros. Vuelve a agendar la consulta.',
    )
  }

  const profesional = profesionales.find(
    (item) =>
      String(item.id) ===
      String(reserva.nutricionistaId),
  )

  if (!profesional) {
    throw new Error(
      'El nutricionista ya no está disponible. Vuelve a seleccionar un profesional.',
    )
  }

  // Compatibilidad con reservas antiguas
  // que guardaban el servicio sin planId.
  const plan = reserva.planId
    ? planes.find(
        (item) => item.id === reserva.planId,
      )
    : planes.find(
        (item) =>
          item.nombre === reserva.servicio,
      )

  if (!plan) {
    throw new Error(
      'El plan ya no está disponible. Vuelve a seleccionar un servicio.',
    )
  }

  if (Number(reserva.precio) !== plan.precio) {
    throw new Error(
      'El precio del plan cambió. Elimina esta reserva y vuelve a agendarla.',
    )
  }

  const motivo = String(
    reserva.motivo || '',
  ).trim()

  if (
    motivo.length < 5 ||
    motivo.length > 100
  ) {
    throw new Error(
      'El motivo debe tener entre 5 y 100 caracteres.',
    )
  }

  return {
    ...reserva,
    planId: plan.id,
    servicio: plan.nombre,
    precio: plan.precio,
    nutricionistaNombre: profesional.nombre,
    motivo,
  }
}

// ========================================
// 3. PROVEEDOR Y SINCRONIZACIÓN
// ========================================

export function CarritoProvider({ children }) {
  const [estado, setEstado] =
    useState(cargarCarrito)

  const { reservas, errorCarrito } = estado

  useEffect(() => {
    function actualizar(event) {
      if (
        event.key === null ||
        event.key === CLAVE_CARRITO
      ) {
        setEstado(cargarCarrito())
      }
    }

    window.addEventListener(
      'storage',
      actualizar,
    )

    return () => {
      window.removeEventListener(
        'storage',
        actualizar,
      )
    }
  }, [])

  // Guardar primero y actualizar la interfaz
  // únicamente cuando el guardado termina.
  function guardarCarrito(actualizadas) {
    localStorage.setItem(
      CLAVE_CARRITO,
      JSON.stringify(actualizadas),
    )

    setEstado({
      reservas: actualizadas,
      errorCarrito: '',
    })
  }

  function informarError(mensaje) {
    setEstado((anterior) => ({
      ...anterior,
      errorCarrito: mensaje,
    }))

    return {
      exito: false,
      mensaje,
    }
  }

  const total = reservas.reduce(
    (suma, item) =>
      suma + (Number(item.precio) || 0),
    0,
  )

  const cantidad = reservas.length

  // ========================================
  // 4. COMPROBAR DISPONIBILIDAD
  // ========================================

  function existeConflictoHorario(
    nutricionistaId,
    fecha,
    hora,
    reservaIdIgnorar = null,
  ) {
    try {
      const objetivo = {
        nutricionistaId,
        fecha,
        hora,
      }

      const carrito = leerLista(CLAVE_CARRITO)
      const citas = leerLista(CLAVE_CITAS)

      const conflictoCarrito = carrito.some(
        (item) =>
          String(item.id) !==
            String(reservaIdIgnorar) &&
          mismoHorario(item, objetivo),
      )

      const conflictoCitas = citas.some(
        (item) =>
          item.estado !== 'cancelada' &&
          mismoHorario(item, objetivo),
      )

      return conflictoCarrito || conflictoCitas
    } catch {
      // No ofrecer un horario cuando no se pudo
      // comprobar su disponibilidad.
      return true
    }
  }

  // ========================================
  // 5. AGREGAR UNA RESERVA
  // ========================================

  function agregarReserva(datosReserva) {
    try {
      const carrito = leerLista(CLAVE_CARRITO)
      const citas = leerLista(CLAVE_CITAS)

      const profesionales = leerLista(
        'nutricionistasNutriVida',
        nutricionistasIniciales,
      )

      const nueva = prepararReserva(
        {
          ...datosReserva,
          id: crearId(),
          pacienteId:
            datosReserva.pacienteId || null,
        },
        profesionales,
      )

      const registrosOcupados = [
        ...carrito,
        ...citas.filter(
          (item) =>
            item.estado !== 'cancelada',
        ),
      ]

      if (
        registrosOcupados.some((item) =>
          mismoHorario(item, nueva),
        )
      ) {
        return {
          exito: false,
          mensaje:
            'Ya existe una reserva agendada para este nutricionista en la misma fecha y horario.',
        }
      }

      guardarCarrito([...carrito, nueva])

      return {
        exito: true,
        reserva: nueva,
      }
    } catch (error) {
      return informarError(
        `No se pudo agregar la reserva. ${error.message}`,
      )
    }
  }

  // ========================================
  // 6. ELIMINAR Y VACIAR EL CARRITO
  // ========================================

  function eliminarReserva(id) {
    try {
      const carrito = leerLista(CLAVE_CARRITO)

      guardarCarrito(
        carrito.filter(
          (item) =>
            String(item.id) !== String(id),
        ),
      )

      return { exito: true }
    } catch {
      return informarError(
        'No se pudo eliminar la reserva. El carrito se conserva.',
      )
    }
  }

  function vaciarCarrito() {
    try {
      guardarCarrito([])

      return { exito: true }
    } catch {
      return informarError(
        'No se pudo vaciar el carrito. Las reservas se conservan.',
      )
    }
  }

  // ========================================
  // 7. CONFIRMAR LAS RESERVAS
  // ========================================

  function confirmarReservas(
    pacienteSesion = null,
    simularFallo = false,
  ) {
    try {
      const actuales =
        leerLista(CLAVE_CARRITO)

      // Detectar cambios que no estén reflejados
      // todavía en la vista del usuario.
      if (
        JSON.stringify(actuales) !==
        JSON.stringify(reservas)
      ) {
        setEstado({
          reservas: actuales,
          errorCarrito: '',
        })

        return {
          exito: false,
          mensaje:
            'El carrito cambió en otra operación. Revisa las reservas antes de confirmar nuevamente.',
        }
      }

      if (actuales.length === 0) {
        return {
          exito: false,
          mensaje:
            'El carrito está vacío. Agrega una consulta antes de confirmar.',
        }
      }

      if (simularFallo) {
        return {
          exito: false,
          mensaje:
            'Simulación de fallo: no fue posible confirmar. Las reservas se conservan en tu carrito.',
        }
      }

      const contenidoAnterior =
        localStorage.getItem(CLAVE_CITAS)

      const citas = leerLista(CLAVE_CITAS)

      const profesionales = leerLista(
        'nutricionistasNutriVida',
        nutricionistasIniciales,
      )

      const nuevas = []
      const confirmadas = []
      const ids = new Set()

      // Validar todas las reservas antes de guardar.
      for (const reserva of actuales) {
        if (
          !reserva.id ||
          ids.has(String(reserva.id))
        ) {
          throw new Error(
            'El carrito contiene identificadores inválidos o repetidos.',
          )
        }

        ids.add(String(reserva.id))

        // Un intento anterior puede haber guardado
        // la cita sin conseguir limpiar el carrito.
        // Reutilizarla evita duplicarla al reintentar.
        const existente = citas.find(
          (cita) =>
            String(cita.reservaId || cita.id) ===
            String(reserva.id),
        )

        if (existente) {
          if (
            existente.estado !== 'confirmada' ||
            !mismoHorario(existente, reserva)
          ) {
            throw new Error(
              'La reserva ya tiene un registro asociado. Revisa sus datos.',
            )
          }

          confirmadas.push(existente)
          continue
        }

        const validada = prepararReserva(
          reserva,
          profesionales,
        )

        const ocupadas = [
          ...citas.filter(
            (item) =>
              item.estado !== 'cancelada',
          ),
          ...nuevas,
        ]

        if (
          ocupadas.some((item) =>
            mismoHorario(item, validada),
          )
        ) {
          throw new Error(
            'El horario ya está ocupado. Elimina esa reserva y selecciona otro horario.',
          )
        }

        const cita = {
          ...validada,
          reservaId: reserva.id,
          idCita: `cita-${reserva.id}`,
          fechaConfirmacion:
            new Date().toISOString(),
          pacienteId:
            pacienteSesion?.id ||
            reserva.pacienteId ||
            'paciente-invitado',
          pacienteNombre:
            pacienteSesion?.nombre || 'Paciente',
          pacienteCorreo:
            pacienteSesion?.correo || '',
          estado: 'confirmada',
        }

        nuevas.push(cita)
        confirmadas.push(cita)
      }

      // ========================================
      // 8. GUARDAR ANTES DE VACIAR
      // ========================================

      if (nuevas.length > 0) {
        localStorage.setItem(
          CLAVE_CITAS,
          JSON.stringify([...citas, ...nuevas]),
        )
      }

      try {
        guardarCarrito([])
      } catch {
        // Si falla el vaciado, intentar restaurar
        // el contenido anterior de las citas.
        if (nuevas.length > 0) {
          try {
            if (contenidoAnterior === null) {
              localStorage.removeItem(CLAVE_CITAS)
            } else {
              localStorage.setItem(
                CLAVE_CITAS,
                contenidoAnterior,
              )
            }
          } catch {
            return informarError(
              'Las citas se guardaron, pero no se pudo limpiar el carrito. Puedes reintentar; no se duplicarán.',
            )
          }
        }

        return informarError(
          'No se pudo vaciar el carrito. Las reservas se conservan; intenta nuevamente.',
        )
      }

      return {
        exito: true,
        citasCreadas: confirmadas,
        mensaje:
          '¡Agendamiento confirmado con éxito!',
      }
    } catch (error) {
      return informarError(
        `No se pudo confirmar la reserva. ${error.message}`,
      )
    }
  }

  // ========================================
  // 9. COMPARTIR EL CONTEXTO
  // ========================================

  return (
    <CarritoContext.Provider
      value={{
        reservas,
        cantidad,
        total,
        errorCarrito,
        agregarReserva,
        eliminarReserva,
        vaciarCarrito,
        confirmarReservas,
        existeConflictoHorario,
      }}
    >
      {children}
    </CarritoContext.Provider>
  )
}

export function useCarrito() {
  const contexto = useContext(CarritoContext)

  if (!contexto) {
    throw new Error(
      'useCarrito debe utilizarse dentro de un CarritoProvider',
    )
  }

  return contexto
}