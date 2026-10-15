import { useContext, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
} from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function Login() {
  // ========================================
  // 1. ESTADOS Y CONTEXTO
  // ========================================

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const { iniciarSesion } = useContext(AuthContext)
  const navigate = useNavigate()

  // ========================================
  // 2. INICIAR SESIÓN
  // ========================================

  function handleSubmit(event) {
    event.preventDefault()
    setErrorMsg('')

    const resultado = iniciarSesion(correo, password)

    if (resultado.exito) {
      if (resultado.usuario.rol === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } else {
      setErrorMsg(
        resultado.mensaje || 'Credenciales incorrectas.',
      )
    }
  }

  // ========================================
  // 3. INTERFAZ
  // ========================================

  return (
    <main className="login-main pagina-gestion">
      <Container>
        <div className="seccion-encabezado">
          <p className="seccion-etiqueta">
            Bienvenido a NutriVida
          </p>

          <h1 className="seccion-titulo">
            Iniciar sesión
          </h1>

          <p className="seccion-descripcion">
            Ingresa a tu cuenta para continuar con tus consultas
            nutricionales.
          </p>
        </div>

        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6} xl={5}>
            <Card className="gestion-tarjeta">
              <Card.Body className="gestion-tarjeta-cuerpo">
                <div aria-live="polite" aria-atomic="true">
                  {errorMsg && (
                    <Alert variant="danger" className="mb-4">
                      {errorMsg}
                    </Alert>
                  )}
                </div>

                <Form
                  onSubmit={handleSubmit}
                  onChange={() => setErrorMsg('')}
                >
                  {/* Correo electrónico */}
                  <Form.Group
                    className="mb-4"
                    controlId="correo"
                  >
                    <Form.Label>
                      Correo electrónico
                    </Form.Label>

                    <Form.Control
                      type="email"
                      placeholder="Ingresa tu correo electrónico"
                      autoComplete="username"
                      value={correo}
                      onChange={(event) =>
                        setCorreo(event.target.value)
                      }
                      required
                    />
                  </Form.Group>

                  {/* Contraseña */}
                  <Form.Group
                    className="mb-4"
                    controlId="password"
                  >
                    <Form.Label>Contraseña</Form.Label>

                    <Form.Control
                      type="password"
                      placeholder="Ingresa tu contraseña"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      required
                    />
                  </Form.Group>

                  <Button
                    variant="success"
                    type="submit"
                    className="w-100"
                  >
                    <i
                      className="bi bi-box-arrow-in-right me-2"
                      aria-hidden="true"
                    />
                    Ingresar
                  </Button>
                </Form>

                <p className="gestion-pie-formulario">
                  ¿Todavía no tienes una cuenta?{' '}
                  <Link to="/registro">Regístrate aquí</Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  )
}

export default Login