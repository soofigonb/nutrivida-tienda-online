import {
  cleanup,
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import { AuthProvider } from './context/AuthContext.jsx'
import App from './App.jsx'

// ========================================
// 1. ENTORNO DE NAVEGACIÓN
// ========================================

// App ya contiene BrowserRouter.
// No debemos envolverlo en otro Router.
function mostrar(ruta = '/', usuario = null) {
  window.history.replaceState({}, '', ruta)

  if (usuario) {
    localStorage.setItem(
      'sesionNutriVida',
      JSON.stringify(usuario),
    )
  }

  render(
    <AuthProvider>
      <App />
    </AuthProvider>,
  )

  return userEvent.setup()
}

beforeEach(() => {
  localStorage.clear()

  vi.spyOn(window, 'scrollTo')
    .mockImplementation(() => {})

  // El desplazamiento se comprueba en su propio archivo.
  vi.spyOn(window, 'requestAnimationFrame')
    .mockReturnValue(1)

  vi.spyOn(window, 'cancelAnimationFrame')
    .mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  localStorage.clear()
  window.history.replaceState({}, '', '/')
})

// ========================================
// 2. RUTAS PÚBLICAS
// ========================================

describe('Rutas y layouts de App', () => {
  test('compone el inicio y permite abrir un artículo y volver', async () => {
    const user = mostrar()

    expect(
      await screen.findByRole('heading', {
        name: 'Un cambio de hábitos cambia tu vida',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        name: 'Sobre nosotros',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('contentinfo'),
    ).toHaveTextContent(
      'Clínica Nutricional NutriVida',
    )

    await user.click(
      screen.getAllByRole('link', {
        name: /Leer artículo/,
      })[0],
    )

    expect(
      await screen.findByRole('heading', {
        name:
          'Guía de alimentación antiinflamatoria para el día a día',
      }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('link', {
        name: 'NutriVida',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Un cambio de hábitos cambia tu vida',
      }),
    ).toBeInTheDocument()
  })

  test.each([
    ['/registro', /Registro de Paciente/i],
    ['/login', /^Iniciar sesión$/],
    ['/agendar', /Agenda tu cita/i],
    ['/carrito', /Carrito/i],
    [
      '/blogs/hidratacion-deportiva',
      'Estrategias de hidratación y rendimiento en el deporte',
    ],
  ])(
    'abre directamente %s con el layout público',
    async (ruta, titulo) => {
      mostrar(ruta)

      expect(
        await screen.findByRole('heading', {
          name: titulo,
          level: 1,
        }),
      ).toBeInTheDocument()

      expect(
        screen.getByRole('link', {
          name: 'NutriVida',
        }),
      ).toBeInTheDocument()

      expect(
        screen.getByRole('contentinfo'),
      ).toBeInTheDocument()
    },
  )

  test('una ruta inexistente muestra el error y permite volver al inicio', async () => {
    const user = mostrar('/no-existe')

    expect(
      await screen.findByRole('heading', {
        name: 'Página no encontrada',
      }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('link', {
        name: 'Volver al inicio',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Un cambio de hábitos cambia tu vida',
      }),
    ).toBeInTheDocument()
  })

  // ========================================
  // 3. ACCESO ADMINISTRATIVO
  // ========================================

  test('redirige al login cuando se abre una ruta administrativa sin sesión', async () => {
    mostrar('/admin/pacientes')

    expect(
      await screen.findByRole('heading', {
        name: /^Iniciar sesión$/,
      }),
    ).toBeInTheDocument()

    expect(window.location.pathname).toBe('/login')
  })

  test('un paciente no puede abrir el panel administrativo', async () => {
    mostrar('/admin', {
      id: 'paciente',
      nombre: 'Ana',
      rol: 'paciente',
    })

    expect(
      await screen.findByRole('heading', {
        name: 'Un cambio de hábitos cambia tu vida',
      }),
    ).toBeInTheDocument()

    expect(window.location.pathname).toBe('/')
  })

  test('un administrador accede al layout propio y navega a pacientes', async () => {
    const user = mostrar('/admin', {
      id: 'admin',
      nombre: 'Administrador',
      rol: 'admin',
    })

    expect(
      await screen.findByRole('heading', {
        name: '¡Hola, Administrador!',
      }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('contentinfo'),
    ).not.toBeInTheDocument()

    const menu = screen.getByRole('navigation', {
      name: 'Navegación administrativa',
    })

    await user.click(
      within(menu).getByRole('link', {
        name: 'Pacientes',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Pacientes',
        level: 1,
      }),
    ).toBeInTheDocument()

    expect(window.location.pathname).toBe(
      '/admin/pacientes',
    )
  })
})