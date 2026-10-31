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
  useLocation,
  useSearchParams,
} from 'react-router-dom'
import {
  afterEach,
  describe,
  expect,
  test,
} from 'vitest'

import Servicios from './Servicios.jsx'
import Ofertas from './Ofertas.jsx'

// ========================================
// 1. ENTORNO DE NAVEGACIÓN
// ========================================

function RutaActual() {
  const { pathname, search } = useLocation()

  return (
    <output aria-label="Ruta actual">
      {pathname}{search}
    </output>
  )
}

function DestinoAgendar() {
  const [parametros] = useSearchParams()

  return (
    <h1>
      Plan recibido: {parametros.get('plan')}
    </h1>
  )
}

function mostrar(ruta = '/servicios') {
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route
          path="/servicios"
          element={<Servicios />}
        />

        <Route
          path="/ofertas"
          element={<Ofertas />}
        />

        <Route
          path="/agendar"
          element={<DestinoAgendar />}
        />
      </Routes>

      <RutaActual />
    </MemoryRouter>,
  )

  return userEvent.setup()
}

afterEach(() => {
  cleanup()
})

// ========================================
// 2. CATÁLOGO Y FILTROS
// ========================================

describe('Catálogo por categorías', () => {
  test('muestra todos los servicios y sus precios', () => {
    mostrar()

    expect(
      screen.getByRole('heading', {
        name: 'Categorías de servicios',
        level: 1,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getAllByRole('article'),
    ).toHaveLength(3)

    expect(
      screen.getByText(/^Servicios encontrados:\s*3$/),
    ).toBeInTheDocument()

    expect(
      screen.getByText('$35.000 CLP'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('$60.000 CLP'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('$50.000 CLP'),
    ).toBeInTheDocument()
  })

  test('filtra una categoría y permite volver a mostrar todos los planes', async () => {
    const user = mostrar()

    const filtro = screen.getByLabelText(
      'Filtrar por categoría',
    )

    await user.selectOptions(
      filtro,
      'Nutrición deportiva',
    )

    expect(
      screen.getAllByRole('article'),
    ).toHaveLength(1)

    expect(
      screen.getByRole('heading', {
        name: 'Plan de nutrición deportiva',
      }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('heading', {
        name: 'Plan nutricional integral',
      }),
    ).not.toBeInTheDocument()

    expect(
      screen.getByText(/^Servicios encontrados:\s*1$/),
    ).toBeInTheDocument()

    const ruta = screen.getByLabelText(
      'Ruta actual',
    ).textContent

    const parametros = new URLSearchParams(
      ruta.split('?')[1],
    )

    expect(
      parametros.get('categoria'),
    ).toBe('Nutrición deportiva')

    await user.selectOptions(filtro, '')

    expect(
      screen.getAllByRole('article'),
    ).toHaveLength(3)

    expect(
      screen.getByText(/^Servicios encontrados:\s*3$/),
    ).toBeInTheDocument()

    expect(
      screen.getByLabelText('Ruta actual'),
    ).toHaveTextContent(/^\/servicios$/)
  })

  test('recupera la categoría indicada en la URL', () => {
    mostrar(
      '/servicios?categoria=Atenci%C3%B3n%20integral',
    )

    expect(
      screen.getByLabelText('Filtrar por categoría'),
    ).toHaveValue('Atención integral')

    expect(
      screen.getAllByRole('article'),
    ).toHaveLength(1)

    expect(
      screen.getByRole('heading', {
        name: 'Plan nutricional integral',
      }),
    ).toBeInTheDocument()
  })

  test('una categoría inexistente muestra un aviso y permite restablecer el catálogo', async () => {
    const user = mostrar(
      '/servicios?categoria=inexistente',
    )

    expect(
      screen.getByRole('alert'),
    ).toHaveTextContent(
      'No hay servicios disponibles para esta categoría.',
    )

    expect(
      screen.queryAllByRole('article'),
    ).toHaveLength(0)

    await user.click(
      screen.getByRole('link', {
        name: 'Ver todos los servicios',
      }),
    )

    expect(
      screen.getAllByRole('article'),
    ).toHaveLength(3)

    expect(
      screen.getByLabelText('Filtrar por categoría'),
    ).toHaveValue('')

    expect(
      screen.getByLabelText('Ruta actual'),
    ).toHaveTextContent(/^\/servicios$/)
  })

  test('agendar desde una categoría transmite el identificador del plan', async () => {
    const user = mostrar()

    await user.selectOptions(
      screen.getByLabelText('Filtrar por categoría'),
      'Nutrición deportiva',
    )

    const tarjeta = screen.getByRole('article')

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

// ========================================
// 3. OFERTAS Y NAVEGACIÓN
// ========================================

describe('Ofertas y beneficios', () => {
  test('muestra el beneficio, las condiciones y el precio original del plan', () => {
    mostrar('/ofertas')

    expect(
      screen.getByRole('heading', {
        name: 'Ofertas y beneficios',
        level: 1,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        name: 'Beneficio en tu primera consulta',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('$35.000 CLP'),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'La medición de composición corporal se realiza presencialmente en la clínica.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'El beneficio no modifica el precio del plan ni corresponde a un descuento monetario.',
      ),
    ).toBeInTheDocument()
  })

  test('la oferta dirige al agendamiento del plan correspondiente', async () => {
    const user = mostrar('/ofertas')

    await user.click(
      screen.getByRole('link', {
        name: 'Agendar primera consulta',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Plan recibido: consulta-inicial',
      }),
    ).toBeInTheDocument()
  })

  test('permite navegar del catálogo a las ofertas y regresar', async () => {
    const user = mostrar()

    await user.click(
      screen.getByRole('link', {
        name: 'Ver ofertas',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Ofertas y beneficios',
      }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('link', {
        name: 'Explorar servicios',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Categorías de servicios',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getAllByRole('article'),
    ).toHaveLength(3)
  })
})