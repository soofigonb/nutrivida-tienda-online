import { useContext, useState } from 'react'
import {
  Button,
  Container,
  Nav,
  Navbar as NavbarBootstrap,
} from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { CarritoContext } from '../context/CarritoContext'
import { AuthContext } from '../context/AuthContext'

function Navbar({ cantidadCarrito }) {
  // ========================================
  // 1. ESTADOS Y CONTEXTOS
  // ========================================

  const [expandido, setExpandido] = useState(false)

  const carritoContext = useContext(CarritoContext)
  const { usuario, cerrarSesion } = useContext(AuthContext)

  const navigate = useNavigate()

  const cantidadMostrar =
    cantidadCarrito !== undefined
      ? cantidadCarrito
      : carritoContext?.cantidad || 0

  // ========================================
  // 2. CERRAR SESIÓN
  // ========================================

  function handleCerrarSesion() {
    cerrarSesion()
    setExpandido(false)
    navigate('/login')
  }

  // ========================================
  // 3. BARRA DE NAVEGACIÓN
  // ========================================

  return (
    <header>
      <NavbarBootstrap
        expand="xl"
        expanded={expandido}
        onToggle={setExpandido}
        className="navbar-nutrivida"
        data-bs-theme="dark"
      >
        <Container fluid>
          {/* Nombre de la clínica */}
          <NavbarBootstrap.Brand
            as={Link}
            to="/"
            onClick={() => setExpandido(false)}
          >
            NutriVida
          </NavbarBootstrap.Brand>

          {/* Menú para pantallas pequeñas */}
          <NavbarBootstrap.Toggle
            aria-controls="menu-nutrivida"
            aria-label="Abrir o cerrar menú"
          />

          <NavbarBootstrap.Collapse id="menu-nutrivida">
            <Nav
              className="ms-auto align-items-center"
              onSelect={() => setExpandido(false)}
            >
              {/* Inicio */}
              <Nav.Link
                as={Link}
                to="/"
                eventKey="inicio"
              >
                Home
              </Nav.Link>

              {/* Secciones de la página de inicio */}
              <Nav.Link
                as={Link}
                to="/#nosotros"
                eventKey="nosotros"
              >
                Nosotros
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/#servicios"
                eventKey="servicios"
              >
                Servicios
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/#blogs"
                eventKey="blogs"
              >
                Blogs
              </Nav.Link>

              {/* Agendamiento */}
              <Nav.Link
                as={Link}
                to="/agendar"
                eventKey="agendar"
              >
                Agendar
              </Nav.Link>

              {/* Sección de contacto */}
              <Nav.Link
                as={Link}
                to="/#contacto"
                eventKey="contacto"
              >
                Contacto
              </Nav.Link>

              {/* Opciones según la sesión */}
              {usuario ? (
                <>
                  <NavbarBootstrap.Text
                    className="me-3 fw-bold text-light px-2"
                  >
                    Hola, {usuario.nombre}
                  </NavbarBootstrap.Text>

                  <Nav.Item className="my-1 my-xl-0 me-xl-2">
                    <Button
                      variant="outline-light"
                      size="sm"
                      onClick={handleCerrarSesion}
                    >
                      Cerrar sesión
                    </Button>
                  </Nav.Item>
                </>
              ) : (
                <>
                  <Nav.Link
                    as={Link}
                    to="/login"
                    eventKey="login"
                  >
                    Iniciar sesión
                  </Nav.Link>

                  <Nav.Link
                    as={Link}
                    to="/registro"
                    eventKey="registro"
                  >
                    Registrarse
                  </Nav.Link>
                </>
              )}

              {/* Carrito */}
              <Nav.Link
                as={Link}
                to="/carrito"
                eventKey="carrito"
              >
                <i
                  className="bi bi-cart3 me-1"
                  aria-hidden="true"
                />

                Carrito

                <span
                  className="badge rounded-pill bg-warning text-dark ms-2"
                  id="contador-carrito"
                >
                  {cantidadMostrar}
                </span>
              </Nav.Link>
            </Nav>
          </NavbarBootstrap.Collapse>
        </Container>
      </NavbarBootstrap>
    </header>
  )
}

export default Navbar