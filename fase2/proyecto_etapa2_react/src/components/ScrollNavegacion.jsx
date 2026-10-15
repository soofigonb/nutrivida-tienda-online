import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollNavegacion() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    // Esperar a que la página de destino esté renderizada.
    const animacion = window.requestAnimationFrame(() => {
      if (hash) {
        const id = hash.slice(1)
        const seccion = document.getElementById(id)

        if (seccion) {
          seccion.scrollIntoView({
            behavior: 'auto',
            block: 'start',
          })

          return
        }
      }

      // Las rutas sin una sección comienzan desde arriba.
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      })
    })

    return () => window.cancelAnimationFrame(animacion)
  }, [pathname, hash, key])

  return null
}

export default ScrollNavegacion