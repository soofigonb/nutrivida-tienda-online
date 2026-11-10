import { beforeEach, expect, it, vi } from 'vitest'
import { crearOrdenDesdeCarrito } from './ordenes'

const carrito = [{ planId: 'consulta-inicial', servicio: 'Consulta' }, { planId: 'consulta-inicial', servicio: 'Consulta' }]
const cuenta = { id: 'cuenta-1' }
const catalogo = [{ id: 17, slug: 'consulta-inicial', activo: true, precio: 35000 }]
beforeEach(() => sessionStorage.clear())

it('resuelve el id del catálogo, agrupa cantidades y no envía precios', async () => {
  const cliente = { solicitar: vi.fn().mockResolvedValueOnce(catalogo).mockResolvedValueOnce({ id: 'orden-1' }) }
  await crearOrdenDesdeCarrito(carrito, cuenta, cliente)
  const body = cliente.solicitar.mock.calls[1][1].body
  expect(body.detalles).toEqual([{ idItem: 17, cantidad: 2 }])
  expect(body).not.toHaveProperty('precio')
  expect(body).not.toHaveProperty('idUsuario')
})
it('conserva la clave si la red falla después del envío', async () => {
  const cliente = { solicitar: vi.fn().mockResolvedValueOnce(catalogo).mockRejectedValueOnce(new Error('red')).mockResolvedValueOnce({ id: 'orden-1' }) }
  await expect(crearOrdenDesdeCarrito(carrito, cuenta, cliente)).rejects.toThrow('red')
  await crearOrdenDesdeCarrito(carrito, cuenta, cliente)
  expect(cliente.solicitar.mock.calls[1][1].body.claveIdempotencia).toBe(cliente.solicitar.mock.calls[2][1].body.claveIdempotencia)
})
it('no crea una orden cuando no existe correspondencia con el catálogo', async () => {
  const cliente = { solicitar: vi.fn().mockResolvedValue([]) }
  await expect(crearOrdenDesdeCarrito(carrito, cuenta, cliente)).rejects.toThrow('todavía no está disponible')
  expect(cliente.solicitar).toHaveBeenCalledTimes(1)
})
it('rechaza pedidos sin sesión antes de consultar servicios', async () => {
  const cliente = { solicitar: vi.fn() }
  await expect(crearOrdenDesdeCarrito(carrito, null, cliente)).rejects.toMatchObject({ status: 401 })
  expect(cliente.solicitar).not.toHaveBeenCalled()
})
it('si no puede conservar la clave no envía la orden', async () => {
  const cliente = { solicitar: vi.fn().mockResolvedValue(catalogo) }
  const storage = { getItem: () => null, setItem: () => { throw new Error('almacenamiento') } }
  await expect(crearOrdenDesdeCarrito(carrito, cuenta, cliente, storage)).rejects.toThrow('almacenamiento')
  expect(cliente.solicitar).toHaveBeenCalledTimes(1)
})
