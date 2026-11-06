// El vendedor solo dispone de catálogo y órdenes en este panel.
import { useContext } from 'react'
import { Alert, Button, Container, Nav, Navbar } from 'react-bootstrap'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function GestionLayout() {
  const { usuario, cerrarSesion, errorSesion } = useContext(AuthContext)
  const navigate = useNavigate()
  async function salir() { await cerrarSesion(); navigate('/login', { replace: true }) }
  return <>
    <Navbar bg="dark" data-bs-theme="dark" expand="sm">
      <Container>
        <Navbar.Brand>NutriVida · Gestión</Navbar.Brand>
        <Navbar.Toggle aria-controls="menu-gestion" />
        <Navbar.Collapse id="menu-gestion"><Nav className="me-auto">
          <Nav.Link as={Link} to="/gestion/catalogo">Catálogo</Nav.Link>
          <Nav.Link as={Link} to="/gestion/ordenes">Órdenes</Nav.Link>
          {usuario.rol === 'ADMINISTRADOR' && <Nav.Link as={Link} to="/admin">Administración</Nav.Link>}
        </Nav><Button variant="outline-light" onClick={salir}>Cerrar sesión</Button></Navbar.Collapse>
      </Container>
    </Navbar>
    {errorSesion && <Container className="mt-3"><Alert variant="warning">{errorSesion}</Alert></Container>}
    <Outlet />
  </>
}
