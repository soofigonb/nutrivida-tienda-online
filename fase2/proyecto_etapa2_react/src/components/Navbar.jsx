import { useContext, useState } from 'react'
import { Container, Nav, Navbar as NavbarBootstrap } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { CarritoContext } from '../context/CarritoContext'

function Navbar({ cantidadCarrito }) {
  const [expandido, setExpandido] = useState(false)
  const carritoContext = useContext(CarritoContext)

  const cantidadMostrar =
    cantidadCarrito !== undefined ? cantidadCarrito : carritoContext?.cantidad || 0

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
              className="ms-auto"
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

              <Nav.Link as={Link} to="/login" eventKey="login">
                Iniciar sesión
              </Nav.Link>

              <Nav.Link as={Link} to="/registro" eventKey="registro">
                Registrarse
              </Nav.Link>

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