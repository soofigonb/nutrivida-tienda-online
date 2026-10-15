import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { CarritoProvider } from '../context/CarritoContext'
import Carrito from './Carrito'

function renderCarrito() {
  return render(
    <MemoryRouter>
      <CarritoProvider>
        <Carrito />
      </CarritoProvider>
    </MemoryRouter>
  )
}

describe('Módulo de Carrito de Reservas - Carrito.jsx (Nitsi)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('muestra el mensaje de estado vacío cuando no hay reservas agregadas', () => {
    renderCarrito()
    expect(screen.getByText(/todavía no has agregado una consulta/i)).toBeInTheDocument()
  })

  /**
   * Criterio 2: el carrito calcula y actualiza el total al eliminar.
   */
  test('calcula el total de las consultas y lo actualiza inmediatamente al eliminar un ítem', async () => {
    const user = userEvent.setup()

    // Sembrar dos reservas en localStorage: una de $35.000 y otra de $60.000 (Total inicial = $95.000)
    const reservasIniciales = [
      {
        id: 'reserva-1',
        servicio: 'Evaluación y consulta inicial',
        precio: 35000,
        nutricionistaId: '1',
        nutricionistaNombre: 'Dra. Camila Torres',
        fecha: '2028-10-15',
        hora: '09:00',
        motivo: 'Control de rutina',
      },
      {
        id: 'reserva-2',
        servicio: 'Plan nutricional integral',
        precio: 60000,
        nutricionistaId: '2',
        nutricionistaNombre: 'Lic. Mateo Silva',
        fecha: '2028-10-16',
        hora: '11:00',
        motivo: 'Plan de alimentación deportiva',
      },
    ]

    localStorage.setItem('carritoNutriVida', JSON.stringify(reservasIniciales))

    renderCarrito()

    // Verificar que ambas reservas se muestren
    expect(screen.getByText('Evaluación y consulta inicial')).toBeInTheDocument()
    expect(screen.getByText('Plan nutricional integral')).toBeInTheDocument()

    // Total inicial esperado: $95.000 CLP
    expect(screen.getByText(/\$95\.000/i)).toBeInTheDocument()

    // Eliminar la primera reserva ($35.000)
    const botonesEliminar = screen.getAllByRole('button', { name: /eliminar/i })
    await user.click(botonesEliminar[0])

    // El nuevo total debe reflejar únicamente los $60.000 del plan integral
    expect(screen.getAllByText(/\$60\.000/i)[0]).toBeInTheDocument()
    expect(screen.queryByText('Evaluación y consulta inicial')).not.toBeInTheDocument()
  })

  /**
   * Criterio 3: Una confirmación exitosa crea citas y limpia el carrito; una fallida lo conserva.
   */
  test('una confirmación exitosa crea citas en citasNutriVida y limpia el carrito', async () => {
    const user = userEvent.setup()

    const reservaPrueba = [
      {
        id: 'reserva-exito',
        servicio: 'Plan nutricional integral',
        precio: 60000,
        nutricionistaId: '3',
        nutricionistaNombre: 'Dra. Valeria Rojas',
        fecha: '2028-12-01',
        hora: '15:00',
        motivo: 'Evaluación anual',
      },
    ]

    localStorage.setItem('carritoNutriVida', JSON.stringify(reservaPrueba))

    renderCarrito()

    const botonConfirmar = screen.getByRole('button', { name: /confirmar agendamiento/i })
    await user.click(botonConfirmar)

    // Debe mostrar la vista de confirmación exitosa
    expect(screen.getByText(/¡agendamiento confirmado!/i)).toBeInTheDocument()

    // Comprobar que se guardó en citasNutriVida
    const citas = JSON.parse(localStorage.getItem('citasNutriVida') || '[]')
    expect(citas.length).toBeGreaterThan(0)
    expect(citas[0].servicio).toBe('Plan nutricional integral')

    // Comprobar que el carrito quedó vacío en localStorage
    const carritoActual = JSON.parse(localStorage.getItem('carritoNutriVida') || '[]')
    expect(carritoActual).toHaveLength(0)
  })

  test('una confirmación fallida muestra el error y conserva las reservas en el carrito', async () => {
    const user = userEvent.setup()

    const reservaPrueba = [
      {
        id: 'reserva-fallo',
        servicio: 'Plan de nutrición deportiva',
        precio: 50000,
        nutricionistaId: '2',
        nutricionistaNombre: 'Lic. Mateo Silva',
        fecha: '2028-12-05',
        hora: '17:00',
        motivo: 'Preparación maratón',
      },
    ]

    localStorage.setItem('carritoNutriVida', JSON.stringify(reservaPrueba))

    renderCarrito()

    // Activar simulación de fallo controlada
    const switchFallo = screen.getByRole('checkbox', { name: /simular fallo/i })
    await user.click(switchFallo)

    // Presionar confirmar
    const botonConfirmar = screen.getByRole('button', { name: /confirmar agendamiento/i })
    await user.click(botonConfirmar)

    // Debe mostrar el mensaje de error controlado
    expect(screen.getByText(/simulación de fallo/i)).toBeInTheDocument()

    // El carrito debe seguir conservando la reserva
    expect(screen.getByText('Plan de nutrición deportiva')).toBeInTheDocument()
    const carritoGuardado = JSON.parse(localStorage.getItem('carritoNutriVida') || '[]')
    expect(carritoGuardado).toHaveLength(1)
  })
})
