import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import {
  render,
  screen,
} from '@testing-library/react'

import userEvent from '@testing-library/user-event'

import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom'

import { AuthContext } from '../context/AuthContext'

import {
  DatosProvider,
  useDatos,
} from '../context/DatosContext'

import RutaAdmin from '../components/RutaAdmin'
import AdminLayout from '../components/AdminLayout'

import AdminHome from './AdminHome'
import AdminPacientes from './AdminPacientes'
import AdminNutricionistas from './AdminNutricionistas'
import AdminFormPaciente from './AdminFormPaciente'
import AdminFormNutricionista from './AdminFormNutricionista'

import fotos from '../data/nutricionistas'

// ========================================
// 1. DATOS DE PRUEBA
// ========================================

const paciente = {
  id: 'p1',
  nombre: 'Ana',
  apellidos: 'Torres',
  run: '123456785',
  rut: '123456785',
  correo: 'ana@duoc.cl',
  telefono: '912345678',
  direccion: 'Calle Ejemplo 123',
  region: 'Región de Valparaíso',
  comuna: 'Quilpué',
  fechaNacimiento: '',
  password: 'clave123',
  contrasena: 'clave123',
  rol: 'paciente',
}

const profesional = {
  id: 'n1',
  nombre: 'Profesional de prueba',
  especialidad: 'Nutrición deportiva',
  experiencia:
    'Atención nutricional personalizada.',
  modalidad: 'Online',
  foto: fotos[0].foto,
}

const administrador = {
  id: 'admin',
  nombre: 'Administrador',
  rol: 'admin',
}

// ========================================
// 2. ENTORNO DE NAVEGACIÓN
// ========================================

function mostrar(
  ruta,
  usuario = administrador,
) {
  return render(
    <AuthContext.Provider
      value={{
        usuario,
        cerrarSesion: vi.fn(),
      }}
    >
      <MemoryRouter initialEntries={[ruta]}>
        <DatosProvider>
          <Routes>
            <Route
              path="/"
              element={<p>Inicio público</p>}
            />

            <Route
              path="/login"
              element={<p>Acceso a la cuenta</p>}
            />

            <Route element={<RutaAdmin />}>
              <Route
                path="/admin"
                element={<AdminLayout />}
              >
                <Route
                  index
                  element={<AdminHome />}
                />

                <Route
                  path="pacientes"
                  element={<AdminPacientes />}
                />

                <Route
                  path="pacientes/nuevo"
                  element={<AdminFormPaciente />}
                />

                <Route
                  path="pacientes/:id/editar"
                  element={<AdminFormPaciente />}
                />

                <Route
                  path="nutricionistas"
                  element={<AdminNutricionistas />}
                />

                <Route
                  path="nutricionistas/nuevo"
                  element={<AdminFormNutricionista />}
                />

                <Route
                  path="nutricionistas/:id/editar"
                  element={<AdminFormNutricionista />}
                />
              </Route>
            </Route>
          </Routes>
        </DatosProvider>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

// ========================================
// 3. PREPARACIÓN Y LIMPIEZA
// ========================================

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ========================================
// 4. PRUEBAS ADMINISTRATIVAS
// ========================================

describe('Administración de NutriVida', () => {
  test(
    'redirige a login cuando no existe sesión',
    () => {
      mostrar('/admin', null)

      expect(
        screen.getByText('Acceso a la cuenta'),
      ).toBeInTheDocument()

      expect(
        screen.queryByRole('heading', {
          name: '¡Hola, Administrador!',
        }),
      ).not.toBeInTheDocument()
    },
  )

  test(
    'impide el acceso administrativo a un paciente',
    () => {
      mostrar('/admin', paciente)

      expect(
        screen.getByText('Inicio público'),
      ).toBeInTheDocument()
    },
  )

  test(
    'muestra el resumen al administrador',
    () => {
      localStorage.setItem(
        'pacientesNutriVida',
        JSON.stringify([paciente]),
      )

      mostrar('/admin')

      expect(
        screen.getByText('Pacientes registrados'),
      ).toBeInTheDocument()

      expect(
        screen.getByText('1'),
      ).toBeInTheDocument()
    },
  )

  test(
    'filtra pacientes por correo',
    async () => {
      const user = userEvent.setup()

      localStorage.setItem(
        'pacientesNutriVida',
        JSON.stringify([paciente]),
      )

      mostrar('/admin/pacientes')

      expect(
        screen.getByText('ana@duoc.cl'),
      ).toBeInTheDocument()

      await user.type(
        screen.getByRole('searchbox'),
        'noexiste',
      )

      expect(
        screen.queryByText('ana@duoc.cl'),
      ).not.toBeInTheDocument()

      expect(
        screen.getByText(
          'No se encontraron registros.',
        ),
      ).toBeInTheDocument()
    },
  )

  test(
    'elimina un paciente sin citas después de confirmar',
    async () => {
      const user = userEvent.setup()

      localStorage.setItem(
        'pacientesNutriVida',
        JSON.stringify([paciente]),
      )

      mostrar('/admin/pacientes')

      await user.click(
        screen.getByRole('button', {
          name: 'Eliminar Ana',
        }),
      )

      await user.click(
        screen.getByRole('button', {
          name: 'Eliminar',
          exact: true,
        }),
      )

      const guardados = JSON.parse(
        localStorage.getItem(
          'pacientesNutriVida',
        ),
      )

      expect(guardados).toEqual([])
    },
  )

  test(
    'conserva un paciente con citas asociadas',
    async () => {
      const user = userEvent.setup()

      localStorage.setItem(
        'pacientesNutriVida',
        JSON.stringify([paciente]),
      )

      localStorage.setItem(
        'citasNutriVida',
        JSON.stringify([
          {
            pacienteId: 'p1',
          },
        ]),
      )

      mostrar('/admin/pacientes')

      await user.click(
        screen.getByRole('button', {
          name: 'Eliminar Ana',
        }),
      )

      await user.click(
        screen.getByRole('button', {
          name: 'Eliminar',
          exact: true,
        }),
      )

      expect(
        screen.getByText(/No se puede eliminar/),
      ).toBeInTheDocument()

      const guardados = JSON.parse(
        localStorage.getItem(
          'pacientesNutriVida',
        ),
      )

      expect(guardados).toHaveLength(1)
    },
  )

  test(
    'muestra los errores de los campos obligatorios',
    async () => {
      const user = userEvent.setup()

      mostrar('/admin/pacientes/nuevo')

      await user.click(
        screen.getByRole('button', {
          name: 'Guardar cambios',
        }),
      )

      expect(
        await screen.findByText(
          'Ingresa el RUN.',
        ),
      ).toBeInTheDocument()

      expect(
        screen.getByText(
          'Ingresa la contraseña.',
        ),
      ).toBeInTheDocument()

      expect(
        localStorage.getItem(
          'pacientesNutriVida',
        ),
      ).toBeNull()
    },
  )

  test(
    'edita un paciente conservando la contraseña cuando se deja vacía',
    async () => {
      const user = userEvent.setup()

      localStorage.setItem(
        'pacientesNutriVida',
        JSON.stringify([paciente]),
      )

      mostrar('/admin/pacientes/p1/editar')

      const nombre =
        screen.getByLabelText(/^Nombre/)

      await user.clear(nombre)
      await user.type(nombre, 'Anita')

      await user.click(
        screen.getByRole('button', {
          name: 'Guardar cambios',
        }),
      )

      await screen.findByText(
        'Registro actualizado correctamente.',
      )

      const guardado = JSON.parse(
        localStorage.getItem(
          'pacientesNutriVida',
        ),
      )[0]

      expect(guardado.nombre).toBe('Anita')

      expect(guardado.password).toBe(
        'clave123',
      )
    },
  )

  test(
    'crea y persiste un nutricionista desde el formulario',
    async () => {
      const user = userEvent.setup()

      mostrar('/admin/nutricionistas/nuevo')

      expect(
        screen.queryByLabelText(
          /Precio de consulta/,
        ),
      ).not.toBeInTheDocument()

      await user.type(
        screen.getByLabelText(
          /Nombre profesional/,
        ),
        'Lic. Profesional Nuevo',
      )

      await user.type(
        screen.getByLabelText(
          /^Especialidad/,
        ),
        'Nutrición clínica',
      )

      await user.type(
        screen.getByLabelText(
          /Experiencia y descripción/,
        ),
        'Atención personalizada para pacientes adultos.',
      )

      await user.selectOptions(
        screen.getByLabelText(/^Modalidad/),
        'Online',
      )

      await user.selectOptions(
        screen.getByLabelText(
          /Fotografía del catálogo/,
        ),
        fotos[0].foto,
      )

      await user.click(
        screen.getByRole('button', {
          name: 'Guardar cambios',
        }),
      )

      await screen.findByText(
        'Registro creado correctamente.',
      )

      const guardados = JSON.parse(
        localStorage.getItem(
          'nutricionistasNutriVida',
        ),
      )

      const creado = guardados.at(-1)

      expect(creado.nombre).toBe(
        'Lic. Profesional Nuevo',
      )

      expect(creado.modalidad).toBe('Online')

      expect(creado).not.toHaveProperty(
        'precioConsulta',
      )
    },
  )

  test(
    'no anuncia éxito ni altera los pacientes si falla el almacenamiento',
    async () => {
      const user = userEvent.setup()

      localStorage.setItem(
        'pacientesNutriVida',
        JSON.stringify([paciente]),
      )

      mostrar('/admin/pacientes/p1/editar')

      vi.spyOn(
        Storage.prototype,
        'setItem',
      ).mockImplementation(() => {
        throw new Error('Espacio agotado')
      })

      await user.click(
        screen.getByRole('button', {
          name: 'Guardar cambios',
        }),
      )

      expect(
        await screen.findByText(
          /No se pudo guardar el paciente/,
        ),
      ).toBeInTheDocument()

      expect(
        screen.queryByText(
          'Registro actualizado correctamente.',
        ),
      ).not.toBeInTheDocument()

      const guardados = JSON.parse(
        localStorage.getItem(
          'pacientesNutriVida',
        ),
      )

      expect(guardados[0].nombre).toBe('Ana')
    },
  )

  test(
    'un cambio de profesional actualiza la fuente compartida',
    async () => {
      function Editor() {
        const {
          nutricionistas,
          guardarNutricionista,
        } = useDatos()

        function actualizar() {
          guardarNutricionista(
            {
              ...profesional,
              nombre: 'Nombre actualizado',
            },
            'n1',
          )
        }

        return (
          <>
            <p>
              {nutricionistas[0]?.nombre}
            </p>

            <button
              type="button"
              onClick={actualizar}
            >
              Actualizar
            </button>
          </>
        )
      }

      const user = userEvent.setup()

      localStorage.setItem(
        'nutricionistasNutriVida',
        JSON.stringify([profesional]),
      )

      render(
        <DatosProvider>
          <Editor />
        </DatosProvider>,
      )

      await user.click(
        screen.getByRole('button', {
          name: 'Actualizar',
        }),
      )

      expect(
        screen.getByText(
          'Nombre actualizado',
        ),
      ).toBeInTheDocument()

      const guardados = JSON.parse(
        localStorage.getItem(
          'nutricionistasNutriVida',
        ),
      )

      expect(guardados[0].nombre).toBe(
        'Nombre actualizado',
      )
    },
  )
})