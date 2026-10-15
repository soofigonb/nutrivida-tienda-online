import {
  cleanup,
  render,
  screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import { AuthProvider } from '../context/AuthContext.jsx'
import Login from './Login.jsx'

// ========================================
// 1. DATOS Y ENTORNO
// ========================================

const paciente = {
  id: 'paciente-login',
  nombre: 'Ana',
  run: '123456785',
  correo: 'ana@duoc.cl',
  contrasena: 'clave123',
  rol: 'paciente',
}

function mostrar(ruta = '/login') {
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/"
            element={<h1>Destino: inicio público</h1>}
          />

          <Route
            path="/admin"
            element={<h1>Destino: panel administrativo</h1>}
          />

          <Route
            path="/registro"
            element={<h1>Destino: registro</h1>}
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )

  return userEvent.setup()
}

async function completar(
  user,
  correo = 'ana@duoc.cl',
  password = 'clave123',
) {
  await user.type(
    screen.getByLabelText(/^Correo electrónico$/i),
    correo,
  )

  await user.type(
    screen.getByLabelText(/^Contraseña$/),
    password,
  )
}

beforeEach(() => {
  localStorage.clear()

  localStorage.setItem(
    'pacientesNutriVida',
    JSON.stringify([paciente]),
  )
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// ========================================
// 2. VALIDACIÓN E INICIO DE SESIÓN
// ========================================

describe('Interacción de Login', () => {
  test('bloquea campos vacíos sin crear sesión', async () => {
    const user = mostrar()

    await user.click(
      screen.getByRole('button', {
        name: /^Ingresar$/,
      }),
    )

    expect(
      screen.getByLabelText(/^Correo electrónico$/i),
    ).toBeInvalid()

    expect(
      screen.getByLabelText(/^Contraseña$/),
    ).toBeInvalid()

    expect(
      localStorage.getItem('sesionNutriVida'),
    ).toBeNull()

    expect(
      screen.getByRole('heading', {
        name: /^Iniciar sesión$/,
      }),
    ).toBeInTheDocument()
  })

  test('muestra credenciales incorrectas y limpia el mensaje al editar', async () => {
    const user = mostrar()

    await completar(user, 'ana@duoc.cl', 'incorrecta')

    await user.click(
      screen.getByRole('button', {
        name: /^Ingresar$/,
      }),
    )

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('Credenciales incorrectas.')

    expect(
      localStorage.getItem('sesionNutriVida'),
    ).toBeNull()

    await user.type(
      screen.getByLabelText(/^Contraseña$/),
      '1',
    )

    expect(
      screen.queryByRole('alert'),
    ).not.toBeInTheDocument()
  })

  test('inicia sesión como paciente y navega al inicio', async () => {
    const user = mostrar()

    await completar(user)

    await user.click(
      screen.getByRole('button', {
        name: /^Ingresar$/,
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Destino: inicio público',
      }),
    ).toBeInTheDocument()

    expect(
      JSON.parse(
        localStorage.getItem('sesionNutriVida'),
      ),
    ).toMatchObject({
      id: paciente.id,
      rol: 'paciente',
    })
  })

  test('inicia sesión administrativa y navega al panel', async () => {
    const user = mostrar('/login?acceso=admin')

    await completar(
      user,
      'admin@nutrivida.cl',
      'admin123',
    )

    await user.click(
      screen.getByRole('button', {
        name: /Ingresar al panel/,
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Destino: panel administrativo',
      }),
    ).toBeInTheDocument()

    const sesion = JSON.parse(
      localStorage.getItem('sesionNutriVida'),
    )

    expect(sesion.rol).toBe('admin')
  })

  test('rechaza al paciente en el acceso administrativo sin crear sesión', async () => {
    const user = mostrar('/login?acceso=admin')

    await completar(user)

    await user.click(
      screen.getByRole('button', {
        name: /Ingresar al panel/,
      }),
    )

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(
      /no tiene permisos de administrador/i,
    )

    expect(
      localStorage.getItem('sesionNutriVida'),
    ).toBeNull()

    expect(
      screen.queryByText('Destino: panel administrativo'),
    ).not.toBeInTheDocument()
  })

  // ========================================
  // 3. CAMBIO DE ACCESO Y ENLACES
  // ========================================

  test('cambia entre accesos, limpia los campos y ajusta el enlace de registro', async () => {
    const user = mostrar()

    await completar(user)

    await user.click(
      screen.getByRole('button', {
        name: /Acceso para administradores/,
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: /Iniciar sesión como administrador/,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByLabelText(/^Correo electrónico$/i),
    ).toHaveValue('')

    expect(
      screen.getByLabelText(/^Contraseña$/),
    ).toHaveValue('')

    expect(
      screen.queryByRole('link', {
        name: /Regístrate aquí/,
      }),
    ).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: /Volver al acceso para pacientes/,
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: /^Iniciar sesión$/,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: /Regístrate aquí/,
      }),
    ).toBeInTheDocument()
  })

  test('el enlace de registro abre la ruta correspondiente', async () => {
    const user = mostrar()

    await user.click(
      screen.getByRole('link', {
        name: /Regístrate aquí/,
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Destino: registro',
      }),
    ).toBeInTheDocument()
  })

  // ========================================
  // 4. FALLO DE PERSISTENCIA
  // ========================================

  test('muestra el fallo al guardar la sesión y no navega', async () => {
    const user = mostrar()

    await completar(user)

    vi.spyOn(console, 'error')
      .mockImplementation(() => {})

    vi.spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Almacenamiento bloqueado')
      })

    await user.click(
      screen.getByRole('button', {
        name: /^Ingresar$/,
      }),
    )

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/No se pudo guardar la sesión/i)

    expect(
      localStorage.getItem('sesionNutriVida'),
    ).toBeNull()

    expect(
      screen.queryByText('Destino: inicio público'),
    ).not.toBeInTheDocument()
  })
})