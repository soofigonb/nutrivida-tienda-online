import {
  cleanup,
  render,
  screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest'

import { AuthContext } from '../context/AuthContext'
import { CarritoProvider } from '../context/CarritoContext'
import Carrito from './Carrito'

// ========================================
// 1. DATOS Y CONFIGURACIÓN
// ========================================

function crearReserva(cambios = {}) {
  const fecha = new Date()

  fecha.setDate(fecha.getDate() + 30)

  const fechaFutura = [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, '0'),
    String(fecha.getDate()).padStart(2, '0'),
  ].join('-')

  return {
    id: 'reserva-1',
    servicio: 'Plan nutricional integral',
    precio: 60000,
    nutricionistaId: '3',
    nutricionistaNombre: 'Dra. Valeria Rojas',
    fecha: fechaFutura,
    hora: '15:00',
    motivo: 'Evaluación anual',
    ...cambios,
  }
}

function mostrar(reservas = [], usuario = null) {
  localStorage.setItem(
    'carritoNutriVida',
    JSON.stringify(reservas),
  )

  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ usuario }}>
        <CarritoProvider>
          <Carrito />
        </CarritoProvider>
      </AuthContext.Provider>
    </MemoryRouter>,
  )

  return userEvent.setup()
}

function leerCarrito() {
  return JSON.parse(
    localStorage.getItem('carritoNutriVida') || '[]',
  )
}

function leerCitas() {
  return JSON.parse(
    localStorage.getItem('citasNutriVida') || '[]',
  )
}

async function abrirRevision(user) {
  await user.click(
    screen.getByRole('button', {
      name: /Continuar con la reserva/i,
    }),
  )
}

async function completarPaciente(user) {
  await user.type(
    screen.getByLabelText('Nombre del paciente'),
    'Ana Muñoz',
  )

  await user.type(
    screen.getByLabelText('Correo del paciente'),
    'ana@gmail.com',
  )
}

async function confirmar(user) {
  await user.click(
    screen.getByRole('button', {
      name: /Confirmar agendamiento/i,
    }),
  )
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

// ========================================
// 2. ESTADO VACÍO Y TOTAL
// ========================================

describe('Carrito y revisión de reservas', () => {
  test('muestra el estado vacío cuando no hay consultas', () => {
    mostrar()

    expect(
      screen.getByText(
        /Todavía no has agregado una consulta/i,
      ),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('button', {
        name: /Continuar con la reserva/i,
      }),
    ).not.toBeInTheDocument()
  })

  test('calcula el total y lo actualiza al eliminar una consulta', async () => {
    const user = mostrar([
      crearReserva({
        id: 'reserva-inicial',
        servicio: 'Evaluación y consulta inicial',
        precio: 35000,
        nutricionistaId: '1',
        hora: '09:00',
      }),
      crearReserva(),
    ])

    expect(
      screen.getByText('$95.000 CLP'),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: 'Eliminar Evaluación y consulta inicial',
      }),
    )

    expect(
      screen.queryByText('Evaluación y consulta inicial'),
    ).not.toBeInTheDocument()

    expect(
      document.getElementById('total-carrito'),
    ).toHaveTextContent('$60.000 CLP')

    expect(leerCarrito()).toHaveLength(1)

    expect(leerCarrito()[0]).toMatchObject({
      servicio: 'Plan nutricional integral',
      precio: 60000,
    })
  })

  // ========================================
  // 3. REVISIÓN PREVIA A LA CONFIRMACIÓN
  // ========================================

  test('abrir la revisión muestra las consultas sin confirmar ni vaciar el carrito', async () => {
    const reserva = crearReserva()
    const user = mostrar([reserva])

    await abrirRevision(user)

    expect(
      screen.getByRole('heading', {
        name: 'Revisa y confirma tu reserva',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(reserva.servicio),
    ).toBeInTheDocument()

    expect(
      screen.getByText(reserva.nutricionistaNombre),
    ).toBeInTheDocument()

    expect(
      screen.getByText(`Motivo: ${reserva.motivo}`),
    ).toBeInTheDocument()

    expect(
      document.getElementById('lista-carrito'),
    ).toHaveTextContent(reserva.fecha)

    expect(
      document.getElementById('lista-carrito'),
    ).toHaveTextContent(reserva.hora)

    expect(
      document.getElementById('total-carrito'),
    ).toHaveTextContent('$60.000 CLP')

    expect(
      screen.getByLabelText('Nombre del paciente'),
    ).toHaveValue('')

    expect(
      screen.getByLabelText('Correo del paciente'),
    ).toHaveValue('')

    expect(leerCitas()).toEqual([])
    expect(leerCarrito()).toEqual([reserva])
  })

  test('completa nombre y correo con los datos de la sesión', async () => {
    const user = mostrar(
      [crearReserva()],
      {
        id: 'paciente-1',
        nombre: 'Sofía González',
        correo: 'sofia@duoc.cl',
        rol: 'paciente',
      },
    )

    await abrirRevision(user)

    expect(
      screen.getByLabelText('Nombre del paciente'),
    ).toHaveValue('Sofía González')

    expect(
      screen.getByLabelText('Correo del paciente'),
    ).toHaveValue('sofia@duoc.cl')

    expect(leerCitas()).toEqual([])
  })

  test('permite volver al carrito sin perder consultas ni crear citas', async () => {
    const reserva = crearReserva()
    const user = mostrar([reserva])

    await abrirRevision(user)

    await user.click(
      screen.getByRole('button', {
        name: 'Volver al carrito',
      }),
    )

    expect(
      screen.getByRole('heading', {
        name: 'Mi Carrito de Reservas',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Eliminar Plan nutricional integral',
      }),
    ).toBeInTheDocument()

    expect(leerCitas()).toEqual([])
    expect(leerCarrito()).toEqual([reserva])
  })

  test('rechaza datos vacíos y correo inválido sin confirmar', async () => {
    const reserva = crearReserva()
    const user = mostrar([reserva])

    await abrirRevision(user)
    await confirmar(user)

    expect(
      await screen.findByText(
        'Ingresa un nombre de entre 2 y 100 caracteres.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'Ingresa un correo electrónico válido.',
      ),
    ).toBeInTheDocument()

    await user.type(
      screen.getByLabelText('Nombre del paciente'),
      'Ana',
    )

    await user.type(
      screen.getByLabelText('Correo del paciente'),
      'correo-invalido',
    )

    await confirmar(user)

    expect(
      screen.getByLabelText('Correo del paciente'),
    ).toHaveClass('is-invalid')

    expect(
      screen.getByLabelText('Nombre del paciente'),
    ).toHaveValue('Ana')

    expect(leerCitas()).toEqual([])
    expect(leerCarrito()).toEqual([reserva])
  })

  // ========================================
  // 4. CONFIRMACIÓN Y PERSISTENCIA
  // ========================================

  test('confirma, conserva el precio del plan y guarda los datos del paciente', async () => {
    const reserva = crearReserva()
    const user = mostrar([reserva])

    await abrirRevision(user)
    await completarPaciente(user)
    await confirmar(user)

    expect(
      await screen.findByRole('heading', {
        name: '¡Agendamiento Confirmado!',
      }),
    ).toBeInTheDocument()

    const citas = leerCitas()

    expect(citas).toHaveLength(1)

    expect(citas[0]).toMatchObject({
      reservaId: reserva.id,
      servicio: reserva.servicio,
      precio: 60000,
      nutricionistaId: reserva.nutricionistaId,
      fecha: reserva.fecha,
      hora: reserva.hora,
      motivo: reserva.motivo,
      pacienteNombre: 'Ana Muñoz',
      pacienteCorreo: 'ana@gmail.com',
      estado: 'confirmada',
    })

    expect(
      screen.getByText('Ana Muñoz'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('ana@gmail.com'),
    ).toBeInTheDocument()

    expect(
      screen.getByText(citas[0].idCita),
    ).toBeInTheDocument()

    expect(leerCarrito()).toEqual([])
  })

  test('un fallo conserva el carrito y permite reintentar sin duplicar citas', async () => {
    const reserva = crearReserva()
    const user = mostrar([reserva])

    await abrirRevision(user)
    await completarPaciente(user)

    // React Bootstrap lo presenta visualmente como
    // interruptor, pero su rol accesible es checkbox.
    const simulacion = screen.getByRole('checkbox', {
      name: /Simular fallo al confirmar/i,
    })

    await user.click(simulacion)

    expect(simulacion).toBeChecked()

    await confirmar(user)

    expect(
      await screen.findByText(/Simulación de fallo:/i),
    ).toBeInTheDocument()

    expect(leerCarrito()).toEqual([reserva])
    expect(leerCitas()).toEqual([])

    expect(
      screen.getByLabelText('Nombre del paciente'),
    ).toHaveValue('Ana Muñoz')

    expect(
      screen.getByLabelText('Correo del paciente'),
    ).toHaveValue('ana@gmail.com')

    await user.click(simulacion)

    expect(simulacion).not.toBeChecked()

    await confirmar(user)

    expect(
      await screen.findByRole('heading', {
        name: '¡Agendamiento Confirmado!',
      }),
    ).toBeInTheDocument()

    expect(leerCitas()).toHaveLength(1)

    expect(leerCitas()[0]).toMatchObject({
      reservaId: reserva.id,
      precio: reserva.precio,
      pacienteNombre: 'Ana Muñoz',
      pacienteCorreo: 'ana@gmail.com',
      estado: 'confirmada',
    })

    expect(leerCarrito()).toEqual([])
  })
})