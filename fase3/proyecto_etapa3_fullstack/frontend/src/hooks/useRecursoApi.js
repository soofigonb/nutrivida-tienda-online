// Descarta resultados de rutas anteriores.
import { useEffect, useState } from 'react'
import { api } from '../services/api'

export function useRecursoApi(ruta, revision, tipo) {
  const [resultado, setResultado] = useState(null)
  const clave = `${ruta}:${revision}`
  useEffect(() => {
    const controller = new AbortController()
    api.solicitar(ruta, { signal: controller.signal }).then(datos => {
      if (tipo === 'lista' ? !Array.isArray(datos) : !datos || Array.isArray(datos) || datos.id == null) {
        throw new Error('El servidor entregó una respuesta con formato inesperado.')
      }
      if (!controller.signal.aborted) setResultado({ clave, datos, error: '' })
    }).catch(error => {
      if (!controller.signal.aborted) setResultado({ clave, datos: null, error: error.message })
    })
    return () => controller.abort()
  }, [ruta, clave, tipo])
  return resultado?.clave === clave ? resultado : { datos: null, error: '' }
}
