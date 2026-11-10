// Adapta el carrito a la API.
import { api, ApiError } from './api.js'

export async function crearOrdenDesdeCarrito(reservas, cuenta, cliente = api, storage = sessionStorage) {
  if (!cuenta?.id) throw new ApiError('Inicia sesión para crear tu orden.', 401)
  if (!reservas.length) throw new ApiError('El carrito está vacío.')
  const firma = JSON.stringify({ usuario: cuenta.id, reservas: reservas.map(r => [r.id, r.planId]) })
  let intento
  try { intento = JSON.parse(storage.getItem('nutrivida:orden-intento')) } catch { /* Recupera un intento válido abajo. */ }
  if (intento?.firma === firma && intento?.clave && intento?.unidades) {
    const orden = await cliente.solicitar('ordenes', { method: 'POST', body: {
      claveIdempotencia: intento.clave, detalles: intento.detalles,
    } })
    return { ...orden, unidades: intento.unidades }
  }
  // Obtiene los IDs desde catálogo.
  const catalogo = await cliente.solicitar('catalogo/planes', { publica: true })
  if (!Array.isArray(catalogo)) throw new ApiError('El catálogo no entregó una lista válida.')
  const cantidades = new Map()
  const unidades = reservas.map(reserva => {
    const item = catalogo.find(p => String(p.slug ?? p.codigo ?? p.id) === String(reserva.planId))
    if (!item || !item.activo || !Number.isSafeInteger(item.id) || item.id <= 0) {
      throw new ApiError(`El servicio «${reserva.servicio}» todavía no está disponible en el catálogo.`)
    }
    const unidad = (cantidades.get(item.id) || 0) + 1
    cantidades.set(item.id, unidad)
    return { idItem: item.id, unidad }
  })
  const detalles = [...cantidades].sort(([a], [b]) => a - b).map(([idItem, cantidad]) => ({ idItem, cantidad }))
  intento = { firma, clave: crypto.randomUUID(), detalles, unidades }
  // Conserva el intento antes de enviarlo.
  storage.setItem('nutrivida:orden-intento', JSON.stringify(intento))
  // El backend calcula los precios.
  const orden = await cliente.solicitar('ordenes', { method: 'POST', body: { claveIdempotencia: intento.clave, detalles } })
  return { ...orden, unidades }
}
