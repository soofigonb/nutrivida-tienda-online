import {
  cleanup,
  render,
  screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterEach,
  describe,
  expect,
  test,
} from 'vitest'

import FormularioContacto from './FormularioContacto.jsx'

// ========================================
// 1. CONFIGURACIÓN E INTERACCIONES
// ========================================

function mostrar() {
  render(<FormularioContacto />)

  return userEvent.setup()
}

async function completar(user, cambios = {}) {
  const datos = {
    nombre: 'Ana',
    correo: 'ana@gmail.com',
    mensaje: 'Quiero conocer los planes.',
    ...cambios,
  }

  await user.type(
    screen.getByLabelText(/^Nombre$/),
    datos.nombre,
  )

  await user.type(
    screen.getByLabelText(/^Correo electrónico$/i),
    datos.correo,
  )

  await user.type(
    screen.getByLabelText(/^Mensaje$/),
    datos.mensaje,
  )
}

async function enviar(user) {
  await user.click(
    screen.getByRole('button', {
      name: /Enviar mensaje/i,
    }),
  )
}

afterEach(() => {
  cleanup()
})

// ========================================
// 2. VALIDACIONES
// ========================================

describe('Interacción de FormularioContacto', () => {
  test('muestra errores en los campos al enviar vacío', async () => {
    const user = mostrar()

    await enviar(user)

    expect(
      await screen.findByText('Ingresa tu nombre.'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Ingresa tu correo electrónico.'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Escribe tu mensaje.'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('alert'),
    ).toHaveTextContent('Revisa los campos marcados')

    expect(
      screen.getByLabelText(/^Nombre$/),
    ).toHaveAttribute('aria-invalid', 'true')
  })

  test('rechaza un correo inválido y conserva el contenido ingresado', async () => {
    const user = mostrar()

    await completar(user, {
      correo: 'correo-invalido',
    })

    await enviar(user)

    expect(
      await screen.findByText(
        /Ingresa un correo válido, por ejemplo/,
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByLabelText(/^Mensaje$/),
    ).toHaveValue('Quiero conocer los planes.')

    expect(
      screen.queryByText(/Formulario validado correctamente/),
    ).not.toBeInTheDocument()
  })

  test('rechaza nombre y mensaje compuestos solo por espacios', async () => {
    const user = mostrar()

    await completar(user, {
      nombre: '   ',
      mensaje: '   ',
    })

    await enviar(user)

    expect(
      await screen.findByText(
        'El nombre debe tener al menos 2 caracteres.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'El mensaje debe tener al menos 2 caracteres.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.queryByText(/Formulario validado correctamente/),
    ).not.toBeInTheDocument()
  })

  // ========================================
  // 3. RESULTADO Y CAMBIOS DE ESTADO
  // ========================================

  test('un envío válido muestra la simulación y limpia todos los campos', async () => {
    const user = mostrar()

    await completar(user)
    await enviar(user)

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/Formulario validado correctamente/)

    expect(
      screen.getByRole('alert'),
    ).toHaveTextContent(/no se ha enviado un correo/)

    expect(
      screen.getByLabelText(/^Nombre$/),
    ).toHaveValue('')

    expect(
      screen.getByLabelText(/^Correo electrónico$/i),
    ).toHaveValue('')

    expect(
      screen.getByLabelText(/^Mensaje$/),
    ).toHaveValue('')

    expect(
      screen.getByLabelText(/^Nombre$/),
    ).toHaveAttribute('aria-invalid', 'false')
  })

  test('oculta el resultado anterior cuando el usuario vuelve a escribir', async () => {
    const user = mostrar()

    await completar(user)
    await enviar(user)

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/Formulario validado correctamente/)

    await user.type(
      screen.getByLabelText(/^Nombre$/),
      'Otra persona',
    )

    expect(
      screen.queryByRole('alert'),
    ).not.toBeInTheDocument()
  })
})