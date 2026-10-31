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
  const [expandido, setExpandido] = useState(false)

  const carritoContext = useContext(CarritoContext)

  const { usuario, cerrarSesion } = useContext(AuthContext)

  const navigate = useNavigate()

  const cantidadMostrar =
    cantidadCarrito !== undefined
      ? cantidadCarrito
      : carritoContext?.cantidad || 0

  function handleCerrarSesion() {
    cerrarSesion()
    setExpandido(false)
    navigate('/login')
  }

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
          <NavbarBootstrap.Brand
            as={Link}
            to="/"
            onClick={() => setExpandido(false)}
          >
            NutriVida
          </NavbarBootstrap.Brand>

          <NavbarBootstrap.Toggle
            aria-controls="menu-nutrivida"
            label="Abrir o cerrar menú"
            aria-expanded={expandido}
          />

          <NavbarBootstrap.Collapse id="menu-nutrivida">
            <Nav
              className="ms-auto align-items-center"
              onSelect={() => setExpandido(false)}
            >
              <Nav.Link
                as={Link}
                to="/"
                eventKey="inicio"
              >
                Home
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/#nosotros"
                eventKey="nosotros"
              >
                Nosotros
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/servicios"
                eventKey="servicios"
              >
                Servicios
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/ofertas"
                eventKey="ofertas"
              >
                Ofertas
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/#blogs"
                eventKey="blogs"
              >
                Blogs
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/agendar"
                eventKey="agendar"
              >
                Agendar
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/#contacto"
                eventKey="contacto"
              >
                Contacto
              </Nav.Link>

              {usuario?.rol === 'admin' && (
                <Nav.Link
                  as={Link}
                  to="/admin"
                  eventKey="admin"
                >
                  Administración
                </Nav.Link>
              )}

              {usuario ? (
                <>
                  <NavbarBootstrap.Text className="me-3 fw-bold text-light px-2">
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