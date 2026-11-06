// Verifica que el carrito no anuncie una reserva clínica cuando solo existe una orden.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import { AuthContext } from '../context/AuthContext'
import { CarritoContext } from '../context/CarritoContext'
import Carrito from './Carrito'

const reserva = { id: 'r1', servicio: 'Consulta inicial', nutricionistaNombre: 'Profesional', fecha: '2027-01-01', hora: '09:00', precio: 35000 }
let confirmar
beforeEach(() => { confirmar = vi.fn().mockResolvedValue({ exito: true, orden: { id: 'orden-1', estado: 'PENDIENTE', total: 35000 } }) })
function mostrar(usuario = { id: 'cuenta-1', correo: 'ana@duoc.cl', rol: 'CLIENTE' }, reservas = [reserva]) {
  render(<MemoryRouter><AuthContext.Provider value={{ usuario }}><CarritoContext.Provider value={{ reservas, cantidad: reservas.length, total: reservas.length * 35000, confirmarReservas: confirmar, eliminarReserva: vi.fn(), vaciarCarrito: vi.fn() }}><Carrito /></CarritoContext.Provider></AuthContext.Provider></MemoryRouter>)
  return userEvent.setup()
}
it('muestra el carrito vacío', () => { mostrar(null, []); expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument() })
it('exige sesión antes de ofrecer la creación de orden', () => {
  mostrar(null)
  expect(screen.getByRole('link', { name: 'Inicia sesión' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Revisar orden' })).not.toBeInTheDocument()
})
it('revisa sin crear y después muestra la orden pendiente real', async () => {
  const user = mostrar()
  await user.click(screen.getByRole('button', { name: 'Revisar orden' }))
  expect(confirmar).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Crear orden pendiente' }))
  expect(await screen.findByRole('heading', { name: 'Orden registrada' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Ver mi orden' })).toHaveAttribute('href', '/mis-ordenes/orden-1')
  expect(screen.getByText(/crear una orden no confirma citas/i)).toBeInTheDocument()
})
it('un fallo mantiene la revisión disponible para reintentar', async () => {
  confirmar.mockResolvedValueOnce({ exito: false, mensaje: 'Servidor no disponible' })
  const user = mostrar()
  await user.click(screen.getByRole('button', { name: 'Revisar orden' }))
  await user.click(screen.getByRole('button', { name: 'Crear orden pendiente' }))
  expect(await screen.findByText('Servidor no disponible')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Crear orden pendiente' })).toBeEnabled()
})
