import {
  cleanup,
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom'
import {
  afterEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import { AuthContext } from '../context/AuthContext.jsx'
import Registro from './Registro.jsx'

// ========================================
// 1. DATOS Y CONFIGURACIÓN
// ========================================

const datosValidos = {
  nombre: 'Sofía',
  apellidos: 'González Pérez',
  rut: '12.345.678-5',
  correo: 'sofia@duoc.cl',
  telefono: '912345678',
  password: 'clave123',
  confirmPassword: 'clave123',
  direccion: 'Avenida Alemania 123',
  fechaNacimiento: '',
}

const etiquetas = {
  nombre: /^Nombre/,
  apellidos: /^Apellidos/,
  rut: /^RUN/,
  correo: /^Correo Electrónico/,
  telefono: /^Teléfono/,
  password: /^Contraseña/,
  confirmPassword: /^Confirmar Contraseña/,
  direccion: /^Dirección/,
  fechaNacimiento: /^Fecha de Nacimiento/,
}

function mostrar(respuesta = { exito: true }) {
  // Aislamos el formulario para controlar la respuesta del contexto.
  const registrarPaciente = vi.fn().mockReturnValue(respuesta)

  render(
    <MemoryRouter initialEntries={['/registro']}>
      <AuthContext.Provider value={{ registrarPaciente }}>
        <Routes>
          <Route
            path="/registro"
            element={<Registro />}
          />

          <Route
            path="/login"
            element={<h1>Destino: iniciar sesión</h1>}
          />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  )

  return {
    user: userEvent.setup(),
    registrarPaciente,
  }
}

// ========================================
// 2. INTERACCIONES DEL FORMULARIO
// ========================================

async function completar(user, cambios = {}) {
  const datos = {
    ...datosValidos,
    ...cambios,
  }

  for (const [campo, valor] of Object.entries(datos)) {
    if (!valor) continue

    const control = screen.getByLabelText(
      etiquetas[campo],
    )

    if (campo === 'fechaNacimiento') {
      await user.type(control, valor)
    } else {
      // Pegar evita escribir todos los datos carácter por carácter,
      // manteniendo los eventos y las validaciones del formulario.
      await user.click(control)
      await user.paste(valor)
    }
  }

  await user.selectOptions(
    screen.getByLabelText(/^Región/),
    'Región de La Araucanía',
  )

  await user.selectOptions(
    screen.getByLabelText(/^Comuna/),
    'Temuco',
  )
}

async function enviar(user) {
  await user.click(
    screen.getByRole('button', {
      name: /Registrar paciente/i,
    }),
  )
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// ========================================
// 3. VALIDACIÓN DE CAMPOS
// ========================================

describe('Interacción del formulario de Registro', () => {
  test('muestra campos obligatorios y no registra un formulario vacío', async () => {
    const { user, registrarPaciente } = mostrar()

    expect(
      screen.getByRole('heading', {
        name: /Registro de Paciente/i,
      }),
    ).toBeInTheDocument()

    await enviar(user)

    expect(
      await screen.findByText('El nombre es obligatorio.'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('El RUN es obligatorio.'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('El correo es obligatorio.'),
    ).toBeInTheDocument()

    expect(registrarPaciente).not.toHaveBeenCalled()
  })

  // Cada fila representa una prueba independiente.
  test.each([
    [
      'nombre',
      'Sofía123',
      'Utiliza solo letras y espacios entre palabras.',
    ],
    [
      'rut',
      '12.345.678-9',
      'RUN inválido. Revisa el formato y el dígito verificador.',
    ],
    [
      'correo',
      'sofia@hotmail.com',
      'Utiliza un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.',
    ],
    [
      'telefono',
      '123456',
      'Ingresa un celular válido: 912345678 o +56912345678.',
    ],
    [
      'password',
      '123',
      'Utiliza al menos 6 caracteres.',
    ],
    [
      'confirmPassword',
      'otraClave',
      'Las contraseñas no coinciden.',
    ],
    [
      'direccion',
      'abc',
      'La dirección debe tener al menos 5 caracteres.',
    ],
    [
      'fechaNacimiento',
      '2999-01-01',
      'La fecha de nacimiento no puede ser futura.',
    ],
  ])(
    'rechaza %s inválido y muestra el mensaje correspondiente',
    async (campo, valor, mensaje) => {
      const { user, registrarPaciente } = mostrar()

      await completar(user, {
        [campo]: valor,
      })

      await enviar(user)

      expect(
        await screen.findByText(mensaje),
      ).toBeInTheDocument()

      expect(registrarPaciente).not.toHaveBeenCalled()

      expect(
        screen.queryByText('Destino: iniciar sesión'),
      ).not.toBeInTheDocument()
    },
  )

  // ========================================
  // 4. SELECCIÓN DE REGIÓN Y COMUNA
  // ========================================

  test('habilita comunas según región y limpia la comuna al cambiarla', async () => {
    const { user } = mostrar()

    const region = screen.getByLabelText(/^Región/)
    const comuna = screen.getByLabelText(/^Comuna/)

    expect(comuna).toBeDisabled()

    await user.selectOptions(
      region,
      'Región de La Araucanía',
    )

    expect(comuna).toBeEnabled()

    await user.selectOptions(comuna, 'Temuco')

    await user.selectOptions(
      region,
      'Región de Valparaíso',
    )

    expect(comuna).toHaveValue('')

    expect(
      within(comuna).queryByRole('option', {
        name: 'Temuco',
      }),
    ).not.toBeInTheDocument()

    expect(
      within(comuna).getByRole('option', {
        name: 'Quilpué',
      }),
    ).toBeInTheDocument()
  })

  // ========================================
  // 5. ENVÍO Y NAVEGACIÓN
  // ========================================

  test.each([
    'duoc.cl',
    'profesor.duoc.cl',
    'gmail.com',
  ])(
    'acepta %s, envía datos normalizados y navega al login',
    async (dominio) => {
      const { user, registrarPaciente } = mostrar()

      await completar(user, {
        correo: `SOFIA@${dominio}`,
      })

      await enviar(user)

      expect(
        await screen.findByRole('heading', {
          name: 'Destino: iniciar sesión',
        }),
      ).toBeInTheDocument()

      expect(registrarPaciente).toHaveBeenCalledTimes(1)

      expect(registrarPaciente).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Sofía',
          apellidos: 'González Pérez',
          run: '123456785',
          correo: `sofia@${dominio}`,
          rol: 'paciente',
          region: 'Región de La Araucanía',
          comuna: 'Temuco',
        }),
      )
    },
  )

  // ========================================
  // 6. ERRORES DEL CONTEXTO
  // ========================================

  test.each([
    [
      'rut',
      'El RUN/RUT ya está registrado',
      /^RUN/,
    ],
    [
      'correo',
      'El correo ya está registrado',
      /^Correo Electrónico/,
    ],
  ])(
    'muestra el error de %s duplicado junto al campo',
    async (campo, mensaje, etiqueta) => {
      const { user } = mostrar({
        exito: false,
        campo,
        mensaje,
      })

      await completar(user)
      await enviar(user)

      expect(
        await screen.findByText(mensaje),
      ).toBeInTheDocument()

      expect(
        screen.getByLabelText(etiqueta),
      ).toHaveClass('is-invalid')

      expect(
        screen.queryByText('Destino: iniciar sesión'),
      ).not.toBeInTheDocument()
    },
  )

  test('conserva el formulario y muestra un fallo de almacenamiento sin navegar', async () => {
    const { user, registrarPaciente } = mostrar({
      exito: false,
      mensaje:
        'No se pudo guardar el registro en el navegador.',
    })

    await completar(user)
    await enviar(user)

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('No se pudo guardar el registro')

    expect(
      screen.getByLabelText(/^Nombre/),
    ).toHaveValue('Sofía')

    expect(registrarPaciente).toHaveBeenCalledTimes(1)

    expect(
      screen.queryByText('Destino: iniciar sesión'),
    ).not.toBeInTheDocument()
  })
})