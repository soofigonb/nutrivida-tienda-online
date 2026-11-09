import { useEffect, useState } from 'react'
import planesIniciales from '../data/planes'
import { api } from '../services/api'

export function usePlanesCatalogo() {
  const [planes, setPlanes] = useState(planesIniciales)
  useEffect(() => {
    const solicitud = new AbortController()
    api.solicitar('catalogo/planes', { publica: true, signal: solicitud.signal }).then(datos => {
      if (solicitud.signal.aborted || !Array.isArray(datos) ||
          datos.some(plan => !Number.isSafeInteger(plan?.id) || !Number.isFinite(plan.precio) || typeof plan.activo !== 'boolean')) return
      setPlanes(datos.filter(plan => plan.activo).map(plan => {
        const inicial = planesIniciales.find(item => item.id === plan.codigo)
        return {
          ...inicial,
          id: plan.codigo ?? String(plan.id),
          nombre: plan.nombre,
          descripcion: plan.descripcion,
          precio: plan.precio,
          categoria: inicial?.categoria ?? plan.categoria,
          imagen: plan.imagenUrl || inicial?.imagen || planesIniciales[0].imagen,
          textoAlternativo: inicial?.textoAlternativo ?? plan.nombre,
          etiqueta: inicial?.etiqueta ?? plan.categoria,
        }
      }))
    }).catch(() => { /* Mantiene la información pública si el catálogo no responde. */ })
    return () => solicitud.abort()
  }, [])
  return planes
}
