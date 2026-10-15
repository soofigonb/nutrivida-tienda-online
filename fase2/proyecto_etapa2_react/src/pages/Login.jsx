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
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function Login() {
  // ========================================
  // 1. ESTADOS Y CONTEXTO
  // ========================================

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const { iniciarSesion } =
    useContext(AuthContext)

  // ========================================
  // 2. NAVEGACIÓN Y TIPO DE ACCESO
  // ========================================

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const accesoAdministrador =
    searchParams.get('acceso') === 'admin'

  // ========================================
  // 3. LIMPIAR EL FORMULARIO
  // ========================================

  function limpiarFormulario() {
    setCorreo('')
    setPassword('')
    setErrorMsg('')
  }

  // ========================================
  // 4. INICIAR SESIÓN
  // ========================================

  function handleSubmit(event) {
    event.preventDefault()
    setErrorMsg('')

    const resultado = iniciarSesion(
      correo.trim(),
      password,
      accesoAdministrador,
    )

    if (!resultado.exito) {
      setErrorMsg(
        resultado.mensaje ||
          'Credenciales incorrectas.',
      )

      return
    }

    if (resultado.usuario.rol === 'admin') {
      navigate('/admin', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }

  // ========================================
  // 5. INTERFAZ
  // ========================================

  return (
    <main className="login-main pagina-gestion">
      <Container>
        {/* Encabezado según el tipo de acceso */}
        <div className="seccion-encabezado">
          <p className="seccion-etiqueta">
            {accesoAdministrador
              ? 'Administración de NutriVida'
              : 'Bienvenido a NutriVida'}
          </p>

          <h1 className="seccion-titulo">
            {accesoAdministrador
              ? 'Iniciar sesión como administrador'
              : 'Iniciar sesión'}
          </h1>

          <p className="seccion-descripcion">
            {accesoAdministrador
              ? 'Ingresa con tu cuenta administrativa para gestionar pacientes y nutricionistas.'
              : 'Ingresa a tu cuenta para continuar con tus consultas nutricionales.'}
          </p>
        </div>

        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6} xl={5}>
            <Card className="gestion-tarjeta">
              <Card.Body className="gestion-tarjeta-cuerpo">
                {/* Mensajes de error */}
                <div
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {errorMsg && (
                    <Alert
                      variant="danger"
                      className="mb-4"
                    >
                      {errorMsg}
                    </Alert>
                  )}
                </div>

                {/* Formulario de ingreso */}
                <Form
                  onSubmit={handleSubmit}
                  onChange={() => setErrorMsg('')}
                >
                  {/* Correo electrónico */}
                  <Form.Group
                    className="mb-4"
                    controlId="correo-login"
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
                    controlId="password-login"
                  >
                    <Form.Label>
                      Contraseña
                    </Form.Label>

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

                  {/* Botón para iniciar sesión */}
                  <Button
                    variant="success"
                    type="submit"
                    className="w-100"
                  >
                    <i
                      className={`bi ${
                        accesoAdministrador
                          ? 'bi-shield-lock'
                          : 'bi-box-arrow-in-right'
                      } me-2`}
                      aria-hidden="true"
                    />

                    {accesoAdministrador
                      ? 'Ingresar al panel'
                      : 'Ingresar'}
                  </Button>
                </Form>

                {/* Registro de pacientes */}
                {!accesoAdministrador && (
                  <p className="gestion-pie-formulario">
                    ¿Todavía no tienes una cuenta?{' '}
                    <Link to="/registro">
                      Regístrate aquí
                    </Link>
                  </p>
                )}

                {/* Cambiar el tipo de acceso */}
                <div className="border-top mt-4 pt-4">
                  <Button
                    as={Link}
                    to={
                      accesoAdministrador
                        ? '/login'
                        : '/login?acceso=admin'
                    }
                    variant="outline-success"
                    className="w-100"
                    onClick={limpiarFormulario}
                  >
                    <i
                      className={`bi ${
                        accesoAdministrador
                          ? 'bi-person'
                          : 'bi-shield-lock'
                      } me-2`}
                      aria-hidden="true"
                    />

                    {accesoAdministrador
                      ? 'Volver al acceso para pacientes'
                      : 'Acceso para administradores'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  )
}

export default Login