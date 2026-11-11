import { useContext } from 'react'
import { Alert } from 'react-bootstrap'
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { AuthContext } from '../context/AuthContext'
import { useDatos } from '../context/DatosContext'

function AdminLayout() {
  // ========================================
  // 1. CONTEXTOS Y NAVEGACIÓN
  // ========================================

  const { usuario, cerrarSesion, errorSesion } =
    useContext(AuthContext)

  const { errorDatos } = useDatos()

  const { pathname } = useLocation()
  const navigate = useNavigate()
  const esAdmin = usuario?.rol === 'ADMINISTRADOR'
  const tieneEncabezadoPropio = pathname.startsWith('/gestion') || pathname === '/admin/cuentas'
  const nombreRol = esAdmin ? 'Administrador' : 'Vendedor'

  // ========================================
  // 2. IDENTIFICAR LA SECCIÓN ACTUAL
  // ========================================

  const esPaciente =
    pathname.startsWith('/admin/pacientes')

  const esNutricionista =
    pathname.startsWith('/admin/nutricionistas')

  const esListado =
    pathname === '/admin/pacientes' ||
    pathname === '/admin/nutricionistas'

  const titulo = esPaciente
    ? 'Pacientes'
    : esNutricionista
      ? 'Nutricionistas'
      : '¡Hola, Administrador!'

  const etiqueta = esPaciente
    ? 'Gestión de usuarios'
    : esNutricionista
      ? 'Gestión de profesionales'
      : 'Panel de administración'

  const descripcion = esPaciente
    ? 'Revisa, registra, modifica o elimina los pacientes de NutriVida.'
    : esNutricionista
      ? 'Administra los profesionales, sus especialidades y modalidades de atención.'
      : 'Revisa el resumen general y gestiona la información de NutriVida.'

  // ========================================
  // 3. CERRAR SESIÓN
  // ========================================

  function salir() {
    cerrarSesion()

    navigate(esAdmin ? '/login?acceso=admin' : '/login', {
      replace: true,
    })
  }

  return (
    <div className="admin-layout">
      {/* ========================================
          4. MENÚ LATERAL
          ======================================== */}

      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Link to={esAdmin ? '/admin' : '/gestion/ordenes'}>
            <i
              className="bi bi-heart-pulse"
              aria-hidden="true"
            />
            NutriVida
          </Link>

          <span>{esAdmin ? 'Panel administrador' : 'Panel vendedor'}</span>
        </div>

        <nav
          className="admin-nav"
          aria-label={esAdmin ? 'Navegación administrativa' : 'Navegación de gestión'}
        >
          <NavLink to="/gestion/ordenes" className="admin-nav-link">Órdenes</NavLink>
          <NavLink to="/gestion/catalogo" className="admin-nav-link">Catálogo</NavLink>
          {esAdmin && (
            <>
              <NavLink to="/admin/cuentas" className="admin-nav-link">Cuentas de acceso</NavLink>
              <NavLink to="/admin" end className="admin-nav-link">
                <i className="bi bi-grid" aria-hidden="true" />
                Dashboard
              </NavLink>
              <NavLink to="/admin/pacientes" className="admin-nav-link">
                <i className="bi bi-people" aria-hidden="true" />
                Pacientes
              </NavLink>
              <NavLink to="/admin/nutricionistas" className="admin-nav-link">
                <i className="bi bi-person-badge" aria-hidden="true" />
                Nutricionistas
              </NavLink>
            </>
          )}
        </nav>

        {/* Usuario y acciones de la sesión */}
        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <i
              className="bi bi-person-circle admin-user-icono"
              aria-hidden="true"
            />

            <div>
              <strong>
                {usuario?.nombre || nombreRol}
              </strong>

              <span>Sesión activa</span>
            </div>
          </div>

          {esAdmin && <Link to="/" className="admin-nav-link">
            <i
              className="bi bi-box-arrow-left"
              aria-hidden="true"
            />
            Volver al sitio
          </Link>}

          <button
            type="button"
            className="admin-nav-link admin-salir"
            onClick={salir}
          >
            <i
              className="bi bi-power"
              aria-hidden="true"
            />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ========================================
          5. CONTENIDO PRINCIPAL
          ======================================== */}

      <main className="admin-content">
        {!tieneEncabezadoPropio && <header className="admin-topbar">
          <div>
            <p className="admin-bienvenida">
              {etiqueta}
            </p>

            <h1>{titulo}</h1>

            <p className="admin-descripcion">
              {descripcion}
            </p>
          </div>

          {esListado && (
            <Link
              to={`${pathname}/nuevo`}
              className="admin-btn-nuevo"
            >
              <i
                className="bi bi-person-plus"
                aria-hidden="true"
              />

              {esPaciente
                ? 'Nuevo paciente'
                : 'Nuevo nutricionista'}
            </Link>
          )}
        </header>}

        {errorSesion && <Alert variant="warning">{errorSesion}</Alert>}
        {esPaciente && <Alert role="note" variant="info">Las fichas se guardan en Pacientes. Las cuentas de acceso se gestionan en «Cuentas de acceso».</Alert>}

        {esPaciente && errorDatos ? (
          <Alert variant="danger">
            {errorDatos}
          </Alert>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  )
}

export default AdminLayout
