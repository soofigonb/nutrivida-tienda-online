import {
  cleanup,
  render,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import ScrollNavegacion from './ScrollNavegacion.jsx'

// ========================================
// 1. CONFIGURACIÓN DE LAS API DEL NAVEGADOR
// ========================================

let animacion

function mostrar(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <ScrollNavegacion />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      animacion = callback
      return 123
    })

  vi.spyOn(window, 'cancelAnimationFrame')
    .mockImplementation(() => {})

  vi.spyOn(window, 'scrollTo')
    .mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// ========================================
// 2. DESPLAZAMIENTO Y LIMPIEZA
// ========================================

describe('ScrollNavegacion', () => {
  test('una ruta sin sección comienza desde arriba', () => {
    mostrar('/registro')

    animacion(0)

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'auto',
    })
  })

  test('un hash existente desplaza a la sección correspondiente', () => {
    const seccion = document.createElement('section')

    seccion.id = 'contacto'
    seccion.scrollIntoView = vi.fn()

    document.body.appendChild(seccion)

    try {
      mostrar('/#contacto')

      animacion(0)

      expect(
        seccion.scrollIntoView,
      ).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'start',
      })

      expect(
        window.scrollTo,
      ).not.toHaveBeenCalled()
    } finally {
      seccion.remove()
    }
  })

  test('un hash inexistente vuelve al inicio sin lanzar errores', () => {
    mostrar('/#seccion-inexistente')

    animacion(0)

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'auto',
    })
  })

  test('cancela la animación pendiente al desmontarse', () => {
    const { unmount } = mostrar('/')

    unmount()

    expect(
      window.cancelAnimationFrame,
    ).toHaveBeenCalledWith(123)

    expect(
      window.scrollTo,
    ).not.toHaveBeenCalled()
  })
})