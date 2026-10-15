import {
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom'
import { CarritoProvider } from '../context/CarritoContext'
import { DatosProvider } from '../context/DatosContext'
import Agendar from './Agendar'

// ========================================
// 1. PREPARACIÓN DEL COMPONENTE
// ========================================

function renderAgendar(rutaInicial = '/agendar') {
  return render(
    <MemoryRouter initialEntries={[rutaInicial]}>
      <DatosProvider>
        <CarritoProvider>
          <Routes>
            <Route
              path="/agendar"
              element={<Agendar />}
            />

            <Route
              path="/carrito"
              element={<div>Página Carrito</div>}
            />
          </Routes>
        </CarritoProvider>
      </DatosProvider>
    </MemoryRouter>,
  )
}

// ========================================
// 2. PRUEBAS DE AGENDAMIENTO
// ========================================

describe('Módulo de agendamiento', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('selecciona automáticamente el plan indicado en la URL', () => {
    renderAgendar('/agendar?plan=plan-integral')

    const selectPlan = screen.getByLabelText(
      /plan o servicio/i,
    )

    expect(selectPlan).toHaveValue('plan-integral')

    expect(
      screen.getAllByText(/\$60\.000/i)[0],
    ).toBeInTheDocument()
  })

  test('bloquea el agendamiento de una fecha pasada', async () => {
    const user = userEvent.setup()

    renderAgendar()

    await user.selectOptions(
      screen.getByLabelText(/plan o servicio/i),
      'consulta-inicial',
    )

    await user.selectOptions(
      screen.getByLabelText(/nutricionista/i),
      '1',
    )

    await user.type(
      screen.getByLabelText(/motivo de consulta/i),
      'Control general de salud',
    )

    await user.type(
      screen.getByLabelText(/fecha/i),
      '2020-01-01',
    )

    await user.selectOptions(
      screen.getByLabelText(/horario/i),
      '09:00',
    )

    await user.click(
      screen.getByRole('button', {
        name: /agregar al carrito/i,
      }),
    )

    expect(
      screen.getByText(
        /la fecha y el horario seleccionados deben ser futuros/i,
      ),
    ).toBeInTheDocument()

    const carritoGuardado = JSON.parse(
      localStorage.getItem('carritoNutriVida') || '[]',
    )

    expect(carritoGuardado).toHaveLength(0)
  })

  test('impide duplicar una reserva para el mismo profesional, fecha y hora', async () => {
    const user = userEvent.setup()

    renderAgendar()

    // Fecha futura calculada para que la prueba no caduque.
    const fecha = new Date()
    fecha.setFullYear(fecha.getFullYear() + 1)

    const fechaFutura = [
      fecha.getFullYear(),
      String(fecha.getMonth() + 1).padStart(2, '0'),
      String(fecha.getDate()).padStart(2, '0'),
    ].join('-')

    // Primera reserva.
    await user.selectOptions(
      screen.getByLabelText(/plan o servicio/i),
      'consulta-inicial',
    )

    await user.selectOptions(
      screen.getByLabelText(/nutricionista/i),
      '1',
    )

    await user.type(
      screen.getByLabelText(/motivo de consulta/i),
      'Primera evaluación',
    )

    await user.type(
      screen.getByLabelText(/fecha/i),
      fechaFutura,
    )

    await user.selectOptions(
      screen.getByLabelText(/horario/i),
      '11:00',
    )

    await user.click(
      screen.getByRole('button', {
        name: /agregar al carrito/i,
      }),
    )

    expect(
      screen.getByText(
        /¡consulta agregada al carrito con éxito!/i,
      ),
    ).toBeInTheDocument()

    // Segunda reserva: mismo profesional, fecha y horario.
    await user.selectOptions(
      screen.getByLabelText(/plan o servicio/i),
      'plan-integral',
    )

    await user.selectOptions(
      screen.getByLabelText(/nutricionista/i),
      '1',
    )

    await user.type(
      screen.getByLabelText(/motivo de consulta/i),
      'Segunda reserva en mismo horario',
    )

    await user.type(
      screen.getByLabelText(/fecha/i),
      fechaFutura,
    )

    await user.selectOptions(
      screen.getByLabelText(/horario/i),
      '11:00',
    )

    await user.click(
      screen.getByRole('button', {
        name: /agregar al carrito/i,
      }),
    )

    expect(
      screen.getByText(
        /el nutricionista seleccionado ya tiene una reserva en esa fecha y horario/i,
      ),
    ).toBeInTheDocument()

    const carritoGuardado = JSON.parse(
      localStorage.getItem('carritoNutriVida') || '[]',
    )

    expect(carritoGuardado).toHaveLength(1)
  })
})