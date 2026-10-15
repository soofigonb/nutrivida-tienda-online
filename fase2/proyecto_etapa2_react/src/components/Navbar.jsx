import { useContext, useState } from 'react'
import { Container, Nav, Navbar as NavbarBootstrap, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { CarritoContext } from '../context/CarritoContext'
import { AuthContext } from '../context/AuthContext' // Importamos el AuthContext

function Navbar({ cantidadCarrito }) {
  const [expandido, setExpandido] = useState(false)
  const carritoContext = useContext(CarritoContext)
  const { usuario, cerrarSesion } = useContext(AuthContext) // Consumimos el usuario y la función para cerrar sesión
  const navigate = useNavigate()

  const cantidadMostrar =
    cantidadCarrito !== undefined ? cantidadCarrito : carritoContext?.cantidad || 0

  const handleCerrarSesion = () => {
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
            aria-label="Abrir o cerrar menú"
          />

          <NavbarBootstrap.Collapse id="menu-nutrivida">
            <Nav
              className="ms-auto align-items-center"
              onSelect={() => setExpandido(false)}
            >
              <Nav.Link as={Link} to="/" eventKey="inicio">
                Home
              </Nav.Link>

              <Nav.Link href="/#nosotros" eventKey="nosotros">
                Nosotros
              </Nav.Link>

              <Nav.Link href="/#servicios" eventKey="servicios">
                Servicios
              </Nav.Link>

              <Nav.Link href="/#blogs" eventKey="blogs">
                Blogs
              </Nav.Link>

              <Nav.Link as={Link} to="/agendar" eventKey="agendar">
                Agendar
              </Nav.Link>

              <Nav.Link href="/#contacto" eventKey="contacto">
                Contacto
              </Nav.Link>

              {/* CONEXIÓN DE SESIÓN EN EL MENÚ */}
              {usuario ? (
                // Muestra el nombre y botón de cerrar sesión si hay usuario
                <>
                  <Navbar.Text className="me-3 fw-bold text-light px-2">
                    Hola, {usuario.nombre}
                  </Navbar.Text>

                  <Nav.Item className="my-1 my-xl-0 me-xl-2">
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={handleCerrarSesion}
                    >
                      Cerrar sesión
                    </Button>
                  </Nav.Item>
                </>
              ) : (
                // Muestra Iniciar sesión y Registrarse si NO hay usuario
                <>
                  <Nav.Link as={Link} to="/login" eventKey="login">
                    Iniciar sesión
                  </Nav.Link>

                  <Nav.Link as={Link} to="/registro" eventKey="registro">
                    Registrarse
                  </Nav.Link>
                </>
              )}

              <Nav.Link as={Link} to="/carrito" eventKey="carrito">
                <i className="bi bi-cart3 me-1" aria-hidden="true" />
                Carrito
                <span className="badge rounded-pill bg-warning text-dark ms-2" id="contador-carrito">
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