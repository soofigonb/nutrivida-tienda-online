import { act, renderHook } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { CarritoProvider, useCarrito } from './CarritoContext'
import { crearOrdenDesdeCarrito } from '../services/ordenes'
import { api } from '../services/api'

vi.mock('../services/ordenes', () => ({ crearOrdenDesdeCarrito: vi.fn() }))
vi.mock('../services/api', () => ({ api: {
  usuarioActual: () => ({ id: 'cuenta-1', rol: 'CLIENTE' }),
  solicitar: vi.fn(),
} }))
const fecha = new Date(); fecha.setFullYear(fecha.getFullYear() + 1)
const reserva = { id: 'r1', planId: 'consulta-inicial', servicio: 'Evaluación y consulta inicial', precio: 35000, nutricionistaId: '1', nutricionistaNombre: 'Profesional', fecha: fecha.toISOString().slice(0, 10), hora: '09:00', motivo: 'Control nutricional' }
const mostrar = () => renderHook(() => useCarrito(), { wrapper: CarritoProvider })
beforeEach(() => {
  localStorage.clear(); vi.resetAllMocks()
  localStorage.setItem('carritoNutriVida', JSON.stringify([reserva]))
  crearOrdenDesdeCarrito.mockResolvedValue({
    id: 'orden-1', estado: 'PENDIENTE', total: 35000, unidades: [{ idItem: 17, unidad: 1 }],
  })
  api.solicitar.mockResolvedValue({ reservaId: 4 })
})
it('crea una orden real y conserva los borradores sin crear citas locales', async () => {
  const { result } = mostrar(); let respuesta
  await act(async () => { respuesta = await result.current.confirmarReservas() })
  expect(respuesta.orden.estado).toBe('PENDIENTE')
  expect(result.current.reservas).toHaveLength(1)
  expect(localStorage.getItem('citasNutriVida')).toBeNull()
})
it('un fallo conserva el carrito y muestra el error', async () => {
  crearOrdenDesdeCarrito.mockRejectedValue(new Error('Catálogo inaccesible'))
  const { result } = mostrar(); let respuesta
  await act(async () => { respuesta = await result.current.confirmarReservas() })
  expect(respuesta.exito).toBe(false)
  expect(result.current.errorCarrito).toBe('Catálogo inaccesible')
  expect(result.current.reservas).toHaveLength(1)
})
it('muestra la cita pendiente y reintenta la misma unidad de la orden', async () => {
  api.solicitar.mockRejectedValueOnce(new Error('Horario ocupado'))
  const { result } = mostrar()
  let respuesta
  await act(async () => { respuesta = await result.current.confirmarReservas() })
  expect(respuesta.pendientes).toEqual([{ id: 'r1', servicio: reserva.servicio, motivo: 'Horario ocupado' }])
  await act(async () => { respuesta = await result.current.confirmarReservas() })
  expect(respuesta.citas).toEqual([{ reservaId: 4 }])
  expect(respuesta.pendientes).toEqual([])
  expect(api.solicitar.mock.calls[0][1].body).toEqual(api.solicitar.mock.calls[1][1].body)
})
it('rechaza un carrito cambiado antes de llamar al backend', async () => {
  const { result } = mostrar()
  localStorage.setItem('carritoNutriVida', '[]')
  let respuesta
  await act(async () => { respuesta = await result.current.confirmarReservas() })
  expect(respuesta.exito).toBe(false)
  expect(crearOrdenDesdeCarrito).not.toHaveBeenCalled()
})
it('actualiza el total al eliminar un borrador', () => {
  const { result } = mostrar()
  act(() => { result.current.eliminarReserva('r1') })
  expect(result.current.total).toBe(0)
  expect(result.current.cantidad).toBe(0)
})
it('no agrega una reserva cuando falla el almacenamiento', () => {
  localStorage.setItem('carritoNutriVida', '[]')
  const { result } = mostrar()
  const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Sin espacio') })
  let respuesta
  act(() => { respuesta = result.current.agregarReserva(reserva) })
  expect(respuesta.exito).toBe(false)
  expect(result.current.reservas).toEqual([])
  spy.mockRestore()
})
