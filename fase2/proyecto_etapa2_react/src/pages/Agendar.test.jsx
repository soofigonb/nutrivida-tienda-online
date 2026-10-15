import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { CarritoProvider } from '../context/CarritoContext'
import Agendar from './Agendar'

/**
 * Función auxiliar para renderizar Agendar con contexto de Carrito y Router en memoria.
 * @param {string} rutaInicial - Ruta para simular parámetros como /agendar?plan=plan-integral
 */
function renderAgendar(rutaInicial = '/agendar') {
  return render(
    <MemoryRouter initialEntries={[rutaInicial]}>
      <CarritoProvider>
        <Routes>
          <Route path="/agendar" element={<Agendar />} />
          <Route path="/carrito" element={<div>Página Carrito</div>} />
        </Routes>
      </CarritoProvider>
    </MemoryRouter>
  )
}

describe('Módulo de Agendamiento - Agendar.jsx (Nitsi)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  /**
   * Criterio 2: Un enlace /agendar?plan=plan-integral selecciona el plan y su precio.
   */
  test('selecciona automáticamente el plan indicado en la query string (?plan=plan-integral)', () => {
    renderAgendar('/agendar?plan=plan-integral')

    const selectPlan = screen.getByLabelText(/plan o servicio/i)
    expect(selectPlan).toHaveValue('plan-integral')

    // El precio debe obtenerse de planes.js ($60.000 CLP)
    expect(screen.getAllByText(/\$60\.000/i)[0]).toBeInTheDocument()
  })

  /**
   * Criterio 1: Una fecha u hora pasada bloquea el agendamiento.
   */
  test('bloquea el agendamiento cuando se intenta seleccionar una fecha pasada', async () => {
    const user = userEvent.setup()
    renderAgendar('/agendar')

    // Seleccionar plan
    await user.selectOptions(screen.getByLabelText(/plan o servicio/i), 'consulta-inicial')

    // Seleccionar nutricionista
    await user.selectOptions(screen.getByLabelText(/nutricionista/i), '1')

    // Escribir motivo válido
    await user.type(screen.getByLabelText(/motivo de consulta/i), 'Control general de salud')

    // Ingresar una fecha pasada (año 2020)
    await user.type(screen.getByLabelText(/fecha/i), '2020-01-01')

    // Seleccionar horario
    await user.selectOptions(screen.getByLabelText(/horario/i), '09:00')

    // Intentar enviar formulario
    await user.click(screen.getByRole('button', { name: /agregar al carrito/i }))

    // Comprobar que se muestra el mensaje de error de fecha pasada
    expect(
      screen.getByText(/la fecha y el horario seleccionados deben ser futuros/i)
    ).toBeInTheDocument()

    // Comprobar que NO se agregó al carrito (el carrito en localStorage sigue vacío)
    const carritoGuardado = JSON.parse(localStorage.getItem('carritoNutriVida') || '[]')
    expect(carritoGuardado).toHaveLength(0)
  })

  /**
   * Prueba complementaria: Impedir agendar una reserva duplicada para el mismo nutricionista y horario.
   */
  test('impide agendar una reserva duplicada para el mismo nutricionista, fecha y hora', async () => {
    const user = userEvent.setup()
    renderAgendar('/agendar')

    // Preparamos fecha futura (ej. año 2028)
    const fechaFutura = '2028-11-20'

    // Primera reserva
    await user.selectOptions(screen.getByLabelText(/plan o servicio/i), 'consulta-inicial')
    await user.selectOptions(screen.getByLabelText(/nutricionista/i), '1')
    await user.type(screen.getByLabelText(/motivo de consulta/i), 'Primera evaluación')
    await user.type(screen.getByLabelText(/fecha/i), fechaFutura)
    await user.selectOptions(screen.getByLabelText(/horario/i), '11:00')
    await user.click(screen.getByRole('button', { name: /agregar al carrito/i }))

    // Debe mostrar confirmación de la primera consulta agregada
    expect(screen.getByText(/¡consulta agregada al carrito con éxito!/i)).toBeInTheDocument()

    // Intentar agendar exactamente el mismo profesional, fecha y hora
    await user.selectOptions(screen.getByLabelText(/plan o servicio/i), 'plan-integral')
    await user.selectOptions(screen.getByLabelText(/nutricionista/i), '1')
    await user.type(screen.getByLabelText(/motivo de consulta/i), 'Segunda reserva en mismo horario')
    await user.type(screen.getByLabelText(/fecha/i), fechaFutura)
    await user.selectOptions(screen.getByLabelText(/horario/i), '11:00')
    await user.click(screen.getByRole('button', { name: /agregar al carrito/i }))

    // Debe mostrar el error de conflicto de horario
    expect(
      screen.getByText(/el nutricionista seleccionado ya tiene una reserva en esa fecha y horario/i)
    ).toBeInTheDocument()
  })
})
