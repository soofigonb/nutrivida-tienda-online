import {
  act,
  renderHook,
} from '@testing-library/react'

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import {
  CarritoProvider,
  useCarrito,
} from './CarritoContext'

// ========================================
// 1. DATOS DE PRUEBA
// ========================================

function fechaFutura() {
  const fecha = new Date()

  fecha.setFullYear(
    fecha.getFullYear() + 1,
  )

  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, '0'),
    String(fecha.getDate()).padStart(2, '0'),
  ].join('-')
}

function crearReserva(cambios = {}) {
  return {
    id: 'reserva-prueba',
    planId: 'consulta-inicial',
    servicio: 'Evaluación y consulta inicial',
    precio: 35000,
    nutricionistaId: '1',
    nutricionistaNombre: 'Dra. Camila Torres',
    fecha: fechaFutura(),
    hora: '09:00',
    motivo: 'Control nutricional',
    ...cambios,
  }
}

function guardarCarrito(reservas) {
  localStorage.setItem(
    'carritoNutriVida',
    JSON.stringify(reservas),
  )
}

function leerCarrito() {
  return JSON.parse(
    localStorage.getItem('carritoNutriVida'),
  )
}

function mostrarContexto() {
  return renderHook(
    () => useCarrito(),
    {
      wrapper: CarritoProvider,
    },
  )
}

// ========================================
// 2. PREPARACIÓN Y LIMPIEZA
// ========================================

beforeEach(() => {
  localStorage.clear()
  guardarCarrito([crearReserva()])
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ========================================
// 3. PRUEBAS DE CONFIRMACIÓN Y PERSISTENCIA
// ========================================

describe(
  'Validaciones y persistencia del carrito',
  () => {
    test(
      'conserva el carrito si falla el guardado de las citas',
      () => {
        const { result } = mostrarContexto()
        const original =
          Storage.prototype.setItem

        vi.spyOn(
          Storage.prototype,
          'setItem',
        ).mockImplementation(function (
          clave,
          valor,
        ) {
          if (clave === 'citasNutriVida') {
            throw new Error('Sin espacio')
          }

          return original.call(
            this,
            clave,
            valor,
          )
        })

        let respuesta

        act(() => {
          respuesta =
            result.current.confirmarReservas()
        })

        expect(respuesta.exito).toBe(false)

        expect(
          result.current.reservas,
        ).toHaveLength(1)

        expect(leerCarrito()).toHaveLength(1)

        expect(
          localStorage.getItem('citasNutriVida'),
        ).toBeNull()
      },
    )

    test(
      'rechaza una reserva que quedó en el pasado',
      () => {
        guardarCarrito([
          crearReserva({
            fecha: '2020-01-01',
          }),
        ])

        const { result } = mostrarContexto()
        let respuesta

        act(() => {
          respuesta =
            result.current.confirmarReservas()
        })

        expect(respuesta.exito).toBe(false)

        expect(
          respuesta.mensaje,
        ).toMatch(/futuros/i)

        expect(leerCarrito()).toHaveLength(1)

        expect(
          localStorage.getItem('citasNutriVida'),
        ).toBeNull()
      },
    )

    test(
      'vuelve a comprobar si el horario fue ocupado antes de confirmar',
      () => {
        const { result } = mostrarContexto()

        localStorage.setItem(
          'citasNutriVida',
          JSON.stringify([
            crearReserva({
              id: 'otra-reserva',
              idCita: 'otra-cita',
              estado: 'confirmada',
            }),
          ]),
        )

        let respuesta

        act(() => {
          respuesta =
            result.current.confirmarReservas()
        })

        expect(respuesta.exito).toBe(false)

        expect(respuesta.mensaje).toMatch(
          /horario ya está ocupado/i,
        )

        expect(
          JSON.parse(
            localStorage.getItem(
              'citasNutriVida',
            ),
          ),
        ).toHaveLength(1)

        expect(leerCarrito()).toHaveLength(1)
      },
    )

    test(
      'no confirma parcialmente un carrito con horarios duplicados',
      () => {
        guardarCarrito([
          crearReserva(),
          crearReserva({
            id: 'segunda',
          }),
        ])

        const { result } = mostrarContexto()
        let respuesta

        act(() => {
          respuesta =
            result.current.confirmarReservas()
        })

        expect(respuesta.exito).toBe(false)

        expect(leerCarrito()).toHaveLength(2)

        expect(
          localStorage.getItem('citasNutriVida'),
        ).toBeNull()
      },
    )

    test(
      'restaura las citas anteriores si falla el vaciado del carrito',
      () => {
        const anteriores = [
          crearReserva({
            id: 'anterior',
            fecha: '2020-01-01',
            estado: 'confirmada',
          }),
        ]

        localStorage.setItem(
          'citasNutriVida',
          JSON.stringify(anteriores),
        )

        const { result } = mostrarContexto()
        const original =
          Storage.prototype.setItem

        vi.spyOn(
          Storage.prototype,
          'setItem',
        ).mockImplementation(function (
          clave,
          valor,
        ) {
          if (clave === 'carritoNutriVida') {
            throw new Error(
              'No se pudo vaciar',
            )
          }

          return original.call(
            this,
            clave,
            valor,
          )
        })

        let respuesta

        act(() => {
          respuesta =
            result.current.confirmarReservas()
        })

        expect(respuesta.exito).toBe(false)

        expect(
          JSON.parse(
            localStorage.getItem(
              'citasNutriVida',
            ),
          ),
        ).toEqual(anteriores)

        expect(
          result.current.reservas,
        ).toHaveLength(1)

        expect(leerCarrito()).toHaveLength(1)
      },
    )

    test(
      'un reintento no duplica citas si también falló la restauración',
      () => {
        const { result } = mostrarContexto()
        const original =
          Storage.prototype.setItem

        vi.spyOn(
          Storage.prototype,
          'setItem',
        ).mockImplementation(function (
          clave,
          valor,
        ) {
          if (clave === 'carritoNutriVida') {
            throw new Error(
              'No se pudo vaciar',
            )
          }

          return original.call(
            this,
            clave,
            valor,
          )
        })

        vi.spyOn(
          Storage.prototype,
          'removeItem',
        ).mockImplementation(() => {
          throw new Error(
            'No se pudo restaurar',
          )
        })

        let respuesta

        act(() => {
          respuesta =
            result.current.confirmarReservas()
        })

        expect(respuesta.exito).toBe(false)

        expect(
          JSON.parse(
            localStorage.getItem(
              'citasNutriVida',
            ),
          ),
        ).toHaveLength(1)

        expect(leerCarrito()).toHaveLength(1)

        // Recuperar el almacenamiento y reintentar.
        vi.restoreAllMocks()

        act(() => {
          respuesta =
            result.current.confirmarReservas()
        })

        expect(respuesta.exito).toBe(true)

        expect(
          JSON.parse(
            localStorage.getItem(
              'citasNutriVida',
            ),
          ),
        ).toHaveLength(1)

        expect(leerCarrito()).toEqual([])
      },
    )

    test(
      'conserva el contenido de citas si sus datos están dañados',
      () => {
        localStorage.setItem(
          'citasNutriVida',
          'contenido inválido',
        )

        const { result } = mostrarContexto()
        let respuesta

        act(() => {
          respuesta =
            result.current.confirmarReservas()
        })

        expect(respuesta.exito).toBe(false)

        expect(
          localStorage.getItem('citasNutriVida'),
        ).toBe('contenido inválido')

        expect(leerCarrito()).toHaveLength(1)
      },
    )

    test(
      'rechaza un precio que no corresponde al plan',
      () => {
        guardarCarrito([
          crearReserva({
            precio: 1,
          }),
        ])

        const { result } = mostrarContexto()
        let respuesta

        act(() => {
          respuesta =
            result.current.confirmarReservas()
        })

        expect(respuesta.exito).toBe(false)

        expect(
          respuesta.mensaje,
        ).toMatch(/precio del plan/i)

        expect(leerCarrito()).toHaveLength(1)

        expect(
          localStorage.getItem('citasNutriVida'),
        ).toBeNull()
      },
    )

    test(
      'no agrega una reserva a la interfaz si falla su persistencia',
      () => {
        guardarCarrito([])

        const { result } = mostrarContexto()

        vi.spyOn(
          Storage.prototype,
          'setItem',
        ).mockImplementation(() => {
          throw new Error('Sin espacio')
        })

        let respuesta

        act(() => {
          respuesta =
            result.current.agregarReserva(
              crearReserva(),
            )
        })

        expect(respuesta.exito).toBe(false)

        expect(
          result.current.reservas,
        ).toEqual([])

        expect(leerCarrito()).toEqual([])
      },
    )

    test(
      'rechaza la confirmación si el nutricionista ya no está disponible',
      () => {
        const { result } = mostrarContexto()

        localStorage.setItem(
          'nutricionistasNutriVida',
          JSON.stringify([]),
        )

        let respuesta

        act(() => {
          respuesta =
            result.current.confirmarReservas()
        })

        expect(respuesta.exito).toBe(false)

        expect(respuesta.mensaje).toMatch(
          /nutricionista ya no está disponible/i,
        )

        expect(leerCarrito()).toHaveLength(1)
      },
    )
  },
)