// Convierte el carrito de NutriVida al contrato comercial del servicio de órdenes.
import { api, ApiError } from './api.js'

export async function crearOrdenDesdeCarrito(reservas, cuenta, cliente = api, storage = sessionStorage) {
  if (!cuenta?.id) throw new ApiError('Inicia sesión para crear tu orden.', 401)
  if (!reservas.length) throw new ApiError('El carrito está vacío.')
  // El catálogo real resuelve los identificadores; no se suponen números fijos.
  const catalogo = await cliente.solicitar('catalogo/planes', { publica: true })
  if (!Array.isArray(catalogo)) throw new ApiError('El catálogo no entregó una lista válida.')
  const cantidades = new Map()
  for (const reserva of reservas) {
    const item = catalogo.find(p => String(p.slug ?? p.codigo ?? p.id) === String(reserva.planId))
    if (!item || !item.activo || !Number.isSafeInteger(item.id) || item.id <= 0) {
      throw new ApiError(`El servicio «${reserva.servicio}» todavía no está disponible en el catálogo.`)
    }
    cantidades.set(item.id, (cantidades.get(item.id) || 0) + 1)
  }
  const detalles = [...cantidades].sort(([a], [b]) => a - b).map(([idItem, cantidad]) => ({ idItem, cantidad }))
  const firma = JSON.stringify({ usuario: cuenta.id, detalles })
  let intento
  try { intento = JSON.parse(storage.getItem('nutrivida:orden-intento')) } catch { /* Un registro inválido se reemplaza antes de enviar. */ }
  if (intento?.firma !== firma || !intento?.clave) {
    intento = { firma, clave: crypto.randomUUID() }
    // Si no se puede conservar la clave, no se envía una compra imposible de reintentar con seguridad.
    storage.setItem('nutrivida:orden-intento', JSON.stringify(intento))
  }
  // El backend resuelve de nuevo los precios; el navegador solo envía referencias y cantidades.
  return cliente.solicitar('ordenes', { method: 'POST', body: { claveIdempotencia: intento.clave, detalles } })
}
