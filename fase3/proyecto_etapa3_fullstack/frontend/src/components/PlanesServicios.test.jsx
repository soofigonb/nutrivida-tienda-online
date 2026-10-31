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
  useSearchParams,
} from 'react-router-dom'
import {
  afterEach,
  describe,
  expect,
  test,
} from 'vitest'

import PlanesServicios from './PlanesServicios.jsx'

// ========================================
// 1. ENTORNO DE NAVEGACIÓN
// ========================================

// Esta vista de prueba permite comprobar el parámetro
// recibido después de seleccionar un servicio.
function DestinoAgendar() {
  const [parametros] = useSearchParams()

  return (
    <h1>
      Plan recibido: {parametros.get('plan')}
    </h1>
  )
}

function mostrar() {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path="/"
          element={<PlanesServicios />}
        />

        <Route
          path="/agendar"
          element={<DestinoAgendar />}
        />
      </Routes>
    </MemoryRouter>,
  )

  return userEvent.setup()
}

afterEach(() => {
  cleanup()
})

// ========================================
// 2. TARJETAS Y DATOS
// ========================================

describe('PlanesServicios', () => {
  test('muestra los tres planes con sus precios y enlaces correspondientes', () => {
    mostrar()

    const esperados = [
      [
        'Evaluación y consulta inicial',
        '$35.000 CLP',
        'consulta-inicial',
      ],
      [
        'Plan nutricional integral',
        '$60.000 CLP',
        'plan-integral',
      ],
      [
        'Plan de nutrición deportiva',
        '$50.000 CLP',
        'nutricion-deportiva',
      ],
    ]

    expect(
      screen.getAllByRole('article'),
    ).toHaveLength(3)

    for (const [nombre, precio, id] of esperados) {
      const tarjeta = screen.getByRole('heading', {
        name: nombre,
      }).closest('article')

      expect(
        within(tarjeta).getByText(precio),
      ).toBeInTheDocument()

      expect(
        within(tarjeta).getByRole('link', {
          name: 'Agendar servicio',
        }),
      ).toHaveAttribute(
        'href',
        `/agendar?plan=${id}`,
      )
    }
  })

  // ========================================
  // 3. ESTADO DE LA PROMOCIÓN
  // ========================================

  test('muestra y oculta la promoción actualizando el botón y aria-expanded', async () => {
    const user = mostrar()

    const boton = screen.getByRole('button', {
      name: 'Mostrar promoción',
    })

    expect(boton).toHaveAttribute(
      'aria-expanded',
      'false',
    )

    expect(
      screen.queryByText(
        'Beneficio en tu primera consulta:',
      ),
    ).not.toBeInTheDocument()

    await user.click(boton)

    expect(
      screen.getByText(
        'Beneficio en tu primera consulta:',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Ocultar promoción',
      }),
    ).toHaveAttribute('aria-expanded', 'true')

    await user.click(
      screen.getByRole('button', {
        name: 'Ocultar promoción',
      }),
    )

    expect(
      screen.queryByText(
        'Beneficio en tu primera consulta:',
      ),
    ).not.toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Mostrar promoción',
      }),
    ).toHaveAttribute('aria-expanded', 'false')
  })

  // ========================================
  // 4. NAVEGACIÓN HACIA AGENDAR
  // ========================================

  test('el enlace del servicio deportivo navega con el identificador del plan', async () => {
    const user = mostrar()

    const tarjeta = screen.getByRole('heading', {
      name: 'Plan de nutrición deportiva',
    }).closest('article')

    await user.click(
      within(tarjeta).getByRole('link', {
        name: 'Agendar servicio',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Plan recibido: nutricion-deportiva',
      }),
    ).toBeInTheDocument()
  })
})