import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest'

import { DatosProvider } from '../context/DatosContext.jsx'
import ListaNutricionistas from './ListaNutricionistas.jsx'

// ========================================
// 1. DATOS DE PRUEBA
// ========================================

// Usamos datos distintos a los iniciales para comprobar
// que las tarjetas muestran la información recibida.
const profesionales = [
  {
    id: 'prueba-1',
    nombre: 'Camila de prueba',
    especialidad: 'Nutrición clínica',
    experiencia:
      'Atención personalizada para mejorar hábitos alimentarios.',
    modalidad: 'Presencial',
    foto: '/camila-prueba.png',
  },
  {
    id: 'prueba-2',
    nombre: 'Mateo de prueba',
    especialidad: 'Nutrición deportiva',
    experiencia:
      'Acompañamiento nutricional para deportistas.',
    modalidad: 'Online',
    foto: '/mateo-prueba.png',
  },
]

// ========================================
// 2. CONFIGURACIÓN E INTERACCIONES
// ========================================

function mostrar() {
  render(
    <DatosProvider>
      <ListaNutricionistas />
    </DatosProvider>,
  )

  return userEvent.setup()
}

async function abrir(
  user,
  nombre = 'Camila de prueba',
) {
  await user.click(
    screen.getByRole('button', {
      name: `Ver detalle de ${nombre}`,
    }),
  )

  return screen.findByRole('dialog', {
    name: nombre,
  })
}

async function esperarCierre() {
  // El modal tiene una transición al cerrarse.
  await waitFor(() => {
    expect(
      screen.queryByRole('dialog'),
    ).not.toBeInTheDocument()
  })
}

beforeEach(() => {
  localStorage.clear()

  localStorage.setItem(
    'nutricionistasNutriVida',
    JSON.stringify(profesionales),
  )
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

// ========================================
// 3. TARJETAS Y DETALLE
// ========================================

describe('ListaNutricionistas', () => {
  test('renderiza los profesionales guardados con sus datos e imágenes', () => {
    mostrar()

    expect(
      screen.getAllByRole('article'),
    ).toHaveLength(2)

    for (const profesional of profesionales) {
      const tarjeta = screen.getByRole('heading', {
        name: profesional.nombre,
      }).closest('article')

      expect(
        within(tarjeta).getByText(
          profesional.especialidad,
        ),
      ).toBeInTheDocument()

      expect(
        within(tarjeta).getByText(
          profesional.experiencia,
        ),
      ).toBeInTheDocument()

      expect(
        within(tarjeta).getByRole('img', {
          name: profesional.nombre,
        }),
      ).toHaveAttribute('src', profesional.foto)
    }

    expect(
      screen.queryByRole('dialog'),
    ).not.toBeInTheDocument()
  })

  test('abre el detalle seleccionado, lo cierra y permite elegir otro profesional', async () => {
    const user = mostrar()

    let dialogo = await abrir(user)

    expect(
      within(dialogo).getByText('Nutrición clínica'),
    ).toBeInTheDocument()

    expect(
      within(dialogo).getByText(
        profesionales[0].experiencia,
      ),
    ).toBeInTheDocument()

    await user.click(
      within(dialogo).getByRole('button', {
        name: /^Cerrar$/,
      }),
    )

    await esperarCierre()

    dialogo = await abrir(user, 'Mateo de prueba')

    expect(
      within(dialogo).getByText('Nutrición deportiva'),
    ).toBeInTheDocument()

    expect(
      within(dialogo).getByText('Online'),
    ).toBeInTheDocument()

    expect(
      within(dialogo).queryByText(
        profesionales[0].experiencia,
      ),
    ).not.toBeInTheDocument()
  })

  // ========================================
  // 4. CIERRE DEL MODAL
  // ========================================

  test('cierra el detalle mediante el botón superior', async () => {
    const user = mostrar()

    const dialogo = await abrir(user)

    await user.click(
      within(dialogo).getByRole('button', {
        name: 'Cerrar detalle',
      }),
    )

    await esperarCierre()
  })

  test('cierra el detalle al presionar Escape', async () => {
    const user = mostrar()

    await abrir(user)
    await user.keyboard('{Escape}')

    await esperarCierre()
  })
})