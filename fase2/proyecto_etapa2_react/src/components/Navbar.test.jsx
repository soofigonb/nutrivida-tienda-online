import {
  cleanup,
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  useLocation,
} from 'react-router-dom'
import {
  afterEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import { AuthContext } from '../context/AuthContext.jsx'
import { CarritoContext } from '../context/CarritoContext.jsx'
import Navbar from './Navbar.jsx'

// ========================================
// 1. CONFIGURACIÓN
// ========================================

function Ubicacion() {
  const { pathname, hash } = useLocation()

  return (
    <output aria-label="Ruta actual">
      {pathname}{hash}
    </output>
  )
}

function mostrar({
  usuario = null,
  carrito = { cantidad: 3 },
  cantidadCarrito,
} = {}) {
  const cerrarSesion = vi.fn()

  render(
    <MemoryRouter initialEntries={['/agendar']}>
      <AuthContext.Provider
        value={{ usuario, cerrarSesion }}
      >
        <CarritoContext.Provider value={carrito}>
          <Navbar cantidadCarrito={cantidadCarrito} />
          <Ubicacion />
        </CarritoContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>,
  )

  return {
    user: userEvent.setup(),
    cerrarSesion,
  }
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// ========================================
// 2. OPCIONES SEGÚN LA SESIÓN
// ========================================

describe('Navbar según sesión y navegación', () => {
  test('un visitante ve login y registro sin opciones administrativas', () => {
    mostrar()

    expect(
      screen.getByRole('link', {
        name: 'Iniciar sesión',
      }),
    ).toHaveAttribute('href', '/login')

    expect(
      screen.getByRole('link', {
        name: 'Registrarse',
      }),
    ).toHaveAttribute('href', '/registro')

    expect(
      screen.queryByRole('link', {
        name: 'Administración',
      }),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByRole('button', {
        name: 'Cerrar sesión',
      }),
    ).not.toBeInTheDocument()
  })

  test('un paciente ve su nombre y cierre de sesión sin acceso administrativo', () => {
    mostrar({
      usuario: {
        nombre: 'Ana',
        rol: 'paciente',
      },
    })

    expect(
      screen.getByText('Hola, Ana'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Cerrar sesión',
      }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('link', {
        name: 'Registrarse',
      }),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByRole('link', {
        name: 'Administración',
      }),
    ).not.toBeInTheDocument()
  })

  test('el administrador ve el enlace al panel', () => {
    mostrar({
      usuario: {
        nombre: 'Administrador',
        rol: 'admin',
      },
    })

    expect(
      screen.getByRole('link', {
        name: 'Administración',
      }),
    ).toHaveAttribute('href', '/admin')
  })

  // ========================================
  // 3. CONTADOR Y CIERRE DE SESIÓN
  // ========================================

  test.each([
    [
      { carrito: { cantidad: 3 } },
      '3',
    ],
    [
      {
        carrito: { cantidad: 3 },
        cantidadCarrito: 0,
      },
      '0',
    ],
    [
      { carrito: null },
      '0',
    ],
  ])(
    'muestra el contador correcto: %j',
    (opciones, esperado) => {
      mostrar(opciones)

      const enlace = screen.getByRole('link', {
        name: /Carrito/,
      })

      expect(
        within(enlace).getByText(esperado),
      ).toBeInTheDocument()
    },
  )

  test('cerrar sesión ejecuta la operación y navega a login', async () => {
    const { user, cerrarSesion } = mostrar({
      usuario: {
        nombre: 'Ana',
        rol: 'paciente',
      },
    })

    await user.click(
      screen.getByRole('button', {
        name: 'Cerrar sesión',
      }),
    )

    expect(cerrarSesion).toHaveBeenCalledTimes(1)

    expect(
      screen.getByLabelText('Ruta actual'),
    ).toHaveTextContent('/login')
  })

  // ========================================
  // 4. MENÚ Y NAVEGACIÓN
  // ========================================

  test('el menú se expande y se cierra al seleccionar Contacto', async () => {
    const { user } = mostrar()

    const boton = screen.getByRole('button', {
      name: 'Abrir o cerrar menú',
    })

    expect(boton).toHaveAttribute(
      'aria-expanded',
      'false',
    )

    await user.click(boton)

    expect(boton).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await user.click(
      screen.getByRole('link', {
        name: 'Contacto',
      }),
    )

    expect(
      screen.getByLabelText('Ruta actual'),
    ).toHaveTextContent('/#contacto')

    expect(boton).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  test('el nombre de la clínica vuelve al inicio y cierra el menú', async () => {
    const { user } = mostrar()

    const boton = screen.getByRole('button', {
      name: 'Abrir o cerrar menú',
    })

    await user.click(boton)

    await user.click(
      screen.getByRole('link', {
        name: 'NutriVida',
      }),
    )

    expect(
      screen.getByLabelText('Ruta actual'),
    ).toHaveTextContent(/^\/$/)

    expect(boton).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })
})