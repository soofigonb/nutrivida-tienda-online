import { useContext, useRef, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Table,
} from 'react-bootstrap'
import { Link } from 'react-router-dom'

import { AuthContext } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import formatearPrecio from '../utils/formatearPrecio'

function Carrito() {
  // ========================================
  // 1. CONTEXTOS Y ESTADOS
  // ========================================

  const {
    reservas,
    errorCarrito,
    eliminarReserva,
    vaciarCarrito,
    confirmarReservas,
    cantidad,
    total,
  } = useCarrito()

  const { usuario } = useContext(AuthContext) || {}

  const [revisando, setRevisando] = useState(false)

  const [datosPaciente, setDatosPaciente] = useState({
    nombre: '',
    correo: '',
  })

  const [erroresDatos, setErroresDatos] = useState({})
  const [simularFallo, setSimularFallo] = useState(false)
  const [errorConfirmacion, setErrorConfirmacion] = useState(null)
  const [confirmacionExitosa, setConfirmacionExitosa] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const confirmacionEnCurso = useRef(false)

  // ========================================
  // 2. REVISAR ANTES DE CONFIRMAR
  // ========================================

  function abrirRevision() {
    if (cantidad === 0) return

    setDatosPaciente((anteriores) => ({
      nombre: usuario?.nombre || anteriores.nombre,
      correo: usuario?.correo || anteriores.correo,
    }))

    setErroresDatos({})
    setErrorConfirmacion(null)
    setRevisando(true)
  }

  function volverAlCarrito() {
    setRevisando(false)
    setErrorConfirmacion(null)
    setErroresDatos({})
  }

  function cambiarDato(event) {
    const { name, value } = event.target

    setDatosPaciente((anteriores) => ({
      ...anteriores,
      [name]: value,
    }))

    setErroresDatos((anteriores) => ({
      ...anteriores,
      [name]: '',
    }))

    setErrorConfirmacion(null)
  }

  function validarDatos() {
    const nombre = datosPaciente.nombre.trim()
    const correo = datosPaciente.correo.trim().toLowerCase()

    const errores = {}

    if (nombre.length < 2 || nombre.length > 100) {
      errores.nombre = 'Ingresa un nombre de entre 2 y 100 caracteres.'
    }

    if (
      correo.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
    ) {
      errores.correo = 'Ingresa un correo electrónico válido.'
    }

    setErroresDatos(errores)

    return {
      valido: Object.keys(errores).length === 0,
      nombre,
      correo,
    }
  }

  // ========================================
  // 3. CONFIRMAR RESERVAS
  // ========================================

  async function handleConfirmar(event) {
    event.preventDefault()

    if (
      !revisando ||
      cantidad === 0 ||
      confirmacionEnCurso.current
    ) {
      return
    }

    const datos = validarDatos()

    if (!datos.valido) return

    confirmacionEnCurso.current = true
    setErrorConfirmacion(null)
    setProcesando(true)

    try {
      // Estos datos se guardan en la cita.
      // No modifican el perfil ni la sesión del paciente.
      const pacienteReserva = {
        ...(usuario || {}),
        nombre: datos.nombre,
        correo: datos.correo,
      }

      const resultado = await confirmarReservas(
        pacienteReserva,
        simularFallo,
      )

      if (resultado.exito) {
        setConfirmacionExitosa(resultado.citasCreadas)
      } else {
        setErrorConfirmacion(resultado.mensaje)
      }
    } catch {
      setErrorConfirmacion(
        'No se pudo completar la confirmación. Revisa el carrito antes de reintentar.',
      )
    } finally {
      confirmacionEnCurso.current = false
      setProcesando(false)
    }
  }

  // ========================================
  // 4. CONFIRMACIÓN EXITOSA
  // ========================================

  if (confirmacionExitosa?.length > 0) {
    const totalConfirmado = confirmacionExitosa.reduce(
      (suma, cita) => suma + Number(cita.precio),
      0,
    )

    return (
      <main className="carrito-main pagina-gestion">
        <Container>
          <div className="seccion-encabezado">
            <p className="seccion-etiqueta">
              Tu atención está reservada
            </p>

            <h1 className="seccion-titulo">
              ¡Agendamiento Confirmado!
            </h1>

            <p className="seccion-descripcion">
              Tus citas quedaron guardadas en este navegador.
            </p>
          </div>

          <Row className="justify-content-center">
            <Col xs={12} lg={9}>
              <Card className="gestion-tarjeta">
                <Card.Body className="gestion-tarjeta-cuerpo">
                  <div className="carrito-estado-icono">
                    <i
                      className="bi bi-check-circle"
                      aria-hidden="true"
                    />
                  </div>

                  <h2 className="gestion-subtitulo text-center mb-4">
                    Resumen de consultas confirmadas
                  </h2>

                  <div className="carrito-confirmaciones">
                    {confirmacionExitosa.map((cita) => (
                      <article
                        key={cita.idCita}
                        className="carrito-confirmacion"
                      >
                        <div className="gestion-acciones mb-3">
                          <h3 className="carrito-servicio-titulo">
                            {cita.servicio}
                          </h3>

                          <Badge bg="success">
                            {formatearPrecio(cita.precio)}
                          </Badge>
                        </div>

                        <p>
                          <strong>Paciente:</strong>{' '}
                          {cita.pacienteNombre}
                        </p>

                        <p>
                          <strong>Correo:</strong>{' '}
                          {cita.pacienteCorreo}
                        </p>

                        <p>
                          <strong>Profesional:</strong>{' '}
                          {cita.nutricionistaNombre}
                        </p>

                        <p>
                          <strong>Fecha y hora:</strong>{' '}
                          {cita.fecha} a las {cita.hora} hrs.
                        </p>

                        <p>
                          <strong>Motivo:</strong>{' '}
                          {cita.motivo}
                        </p>

                        <p className="carrito-codigo">
                          Código de reserva:{' '}
                          <code>{cita.idCita}</code>
                        </p>
                      </article>
                    ))}
                  </div>

                  <div className="carrito-total mt-4">
                    <span>Total confirmado:</span>

                    <strong>
                      {formatearPrecio(totalConfirmado)}
                    </strong>
                  </div>

                  <p className="gestion-ayuda small mt-3">
                    La confirmación es simulada. No se ha realizado
                    ningún cobro ni enviado un correo.
                  </p>

                  <div className="gestion-botones mt-4">
                    <Link
                      to="/agendar"
                      className="btn btn-outline-success"
                    >
                      <i
                        className="bi bi-calendar-plus me-2"
                        aria-hidden="true"
                      />
                      Agendar otra consulta
                    </Link>

                    <Link to="/" className="btn btn-success">
                      <i
                        className="bi bi-house me-2"
                        aria-hidden="true"
                      />
                      Volver al inicio
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    )
  }

  // ========================================
  // 5. CARRITO Y REVISIÓN
  // ========================================

  return (
    <main className="carrito-main pagina-gestion">
      <Container>
        <div className="seccion-encabezado">
          <p className="seccion-etiqueta">
            {revisando ? 'Revisión final' : 'Resumen de compra'}
          </p>

          <h1 className="seccion-titulo">
            {revisando
              ? 'Revisa y confirma tu reserva'
              : 'Mi Carrito de Reservas'}
          </h1>

          <p className="seccion-descripcion">
            {revisando
              ? 'Comprueba los datos del paciente, los servicios y los horarios antes de finalizar.'
              : 'Revisa tus consultas nutricionales y continúa para confirmar el agendamiento.'}
          </p>
        </div>

        {errorCarrito && !errorConfirmacion && (
          <Alert variant="danger" role="alert">
            {errorCarrito}
          </Alert>
        )}

        <div aria-live="polite" aria-atomic="true">
          {errorConfirmacion && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setErrorConfirmacion(null)}
              id="alerta-error-carrito"
              className="mb-4"
            >
              <Alert.Heading className="h6">
                No se pudo completar la confirmación
              </Alert.Heading>

              <p className="mb-0">{errorConfirmacion}</p>
            </Alert>
          )}
        </div>

        {cantidad === 0 ? (
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={7}>
              <Card className="gestion-tarjeta">
                <Card.Body className="gestion-tarjeta-cuerpo text-center">
                  <div className="carrito-estado-icono">
                    <i
                      className="bi bi-cart-x"
                      aria-hidden="true"
                    />
                  </div>

                  <h2 className="gestion-subtitulo">
                    Tu carrito está vacío
                  </h2>

                  <p
                    id="carrito-vacio"
                    className="gestion-ayuda mb-4"
                  >
                    Todavía no has agregado una consulta.
                  </p>

                  <div className="gestion-botones">
                    <Link
                      to="/agendar"
                      className="btn btn-success"
                    >
                      Agendar una cita
                    </Link>

                    <Link
                      to="/#servicios"
                      className="btn btn-outline-success"
                    >
                      Ver planes
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <Row className="g-4 justify-content-center">
            <Col xs={12} lg={8}>
              {/* Datos previos a la confirmación */}
              {revisando && (
                <Card className="gestion-tarjeta mb-4">
                  <Card.Body className="gestion-tarjeta-cuerpo">
                    <h2 className="gestion-subtitulo mb-3">
                      Datos del paciente
                    </h2>

                    <p className="gestion-ayuda">
                      {usuario
                        ? 'Completamos los datos con tu sesión. Puedes corregirlos para esta reserva.'
                        : 'Ingresa los datos de la persona que recibirá la atención.'}
                    </p>

                    <Form
                      id="formulario-confirmacion"
                      noValidate
                      onSubmit={handleConfirmar}
                    >
                      <Row className="g-3">
                        <Col xs={12} md={6}>
                          <Form.Group controlId="reserva-nombre">
                            <Form.Label>
                              Nombre del paciente
                            </Form.Label>

                            <Form.Control
                              name="nombre"
                              type="text"
                              autoComplete="name"
                              required
                              maxLength={100}
                              value={datosPaciente.nombre}
                              onChange={cambiarDato}
                              disabled={procesando}
                              isInvalid={Boolean(erroresDatos.nombre)}
                              aria-describedby={
                                erroresDatos.nombre
                                  ? 'reserva-nombre-error'
                                  : undefined
                              }
                            />

                            <Form.Control.Feedback
                              type="invalid"
                              id="reserva-nombre-error"
                            >
                              {erroresDatos.nombre}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                          <Form.Group controlId="reserva-correo">
                            <Form.Label>
                              Correo del paciente
                            </Form.Label>

                            <Form.Control
                              name="correo"
                              type="email"
                              autoComplete="email"
                              required
                              maxLength={100}
                              value={datosPaciente.correo}
                              onChange={cambiarDato}
                              disabled={procesando}
                              isInvalid={Boolean(erroresDatos.correo)}
                              aria-describedby={
                                erroresDatos.correo
                                  ? 'reserva-correo-error'
                                  : undefined
                              }
                            />

                            <Form.Control.Feedback
                              type="invalid"
                              id="reserva-correo-error"
                            >
                              {erroresDatos.correo}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                    </Form>
                  </Card.Body>
                </Card>
              )}

              {/* Consultas seleccionadas */}
              <Card className="gestion-tarjeta mb-4">
                <Card.Header className="carrito-tarjeta-encabezado">
                  <span>
                    Consultas seleccionadas (
                    <span id="cantidad-carrito">{cantidad}</span>)
                  </span>

                  {!revisando && (
                    <Button
                      variant="link"
                      className="carrito-vaciar"
                      onClick={() => vaciarCarrito()}
                    >
                      <i
                        className="bi bi-trash3 me-1"
                        aria-hidden="true"
                      />
                      Vaciar todo
                    </Button>
                  )}
                </Card.Header>

                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table
                      hover
                      className="align-middle mb-0"
                      id="lista-carrito"
                    >
                      <thead className="table-light">
                        <tr>
                          <th className="ps-4">Servicio</th>
                          <th>Nutricionista</th>
                          <th>Fecha y Hora</th>
                          <th>Precio</th>

                          {!revisando && (
                            <th className="text-end pe-4">
                              Acción
                            </th>
                          )}
                        </tr>
                      </thead>

                      <tbody>
                        {reservas.map((item) => (
                          <tr key={item.id}>
                            <td className="ps-4">
                              <span className="fw-semibold d-block">
                                {item.servicio}
                              </span>

                              {item.motivo && (
                                <small className="text-muted d-block">
                                  Motivo: {item.motivo}
                                </small>
                              )}
                            </td>

                            <td>
                              <span className="small">
                                {item.nutricionistaNombre}
                              </span>
                            </td>

                            <td>
                              <span className="carrito-fecha">
                                {item.fecha}
                                <br />
                                {item.hora} hrs.
                              </span>
                            </td>

                            <td>
                              <span className="carrito-precio">
                                {formatearPrecio(item.precio)}
                              </span>
                            </td>

                            {!revisando && (
                              <td className="text-end pe-4">
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() =>
                                    eliminarReserva(item.id)
                                  }
                                  title="Eliminar consulta"
                                  aria-label={`Eliminar ${item.servicio}`}
                                  className="boton-eliminar-reserva"
                                >
                                  <i
                                    className="bi bi-trash"
                                    aria-hidden="true"
                                  />
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>

              {revisando ? (
                <Button
                  variant="outline-success"
                  onClick={volverAlCarrito}
                  disabled={procesando}
                >
                  <i
                    className="bi bi-arrow-left me-2"
                    aria-hidden="true"
                  />
                  Volver al carrito
                </Button>
              ) : (
                <Link
                  to="/agendar"
                  className="btn btn-outline-success"
                >
                  <i
                    className="bi bi-arrow-left me-2"
                    aria-hidden="true"
                  />
                  Seguir agendando
                </Link>
              )}
            </Col>

            {/* Total y acciones */}
            <Col xs={12} lg={4}>
              <Card className="gestion-tarjeta">
                <Card.Body className="gestion-tarjeta-cuerpo">
                  <h2 className="gestion-subtitulo mb-4">
                    Total de la reserva
                  </h2>

                  <div className="gestion-acciones gestion-ayuda mb-3">
                    <span>Cantidad de consultas:</span>
                    <span>{cantidad}</span>
                  </div>

                  {usuario && (
                    <div className="carrito-paciente">
                      <i
                        className="bi bi-person-check me-2"
                        aria-hidden="true"
                      />
                      Sesión de: <strong>{usuario.nombre}</strong>
                    </div>
                  )}

                  <div className="carrito-total">
                    <span>Total:</span>

                    <strong id="total-carrito">
                      {formatearPrecio(total)}
                    </strong>
                  </div>

                  <p className="gestion-ayuda small">
                    El precio corresponde a los planes seleccionados.
                    No se agrega un cobro adicional por nutricionista.
                  </p>

                  {revisando ? (
                    <>
                      <div className="carrito-simulacion">
                        <Form.Check
                          type="switch"
                          id="check-simular-fallo"
                          label="Simular fallo al confirmar (Prueba técnica)"
                          checked={simularFallo}
                          disabled={procesando}
                          onChange={(event) => {
                            setSimularFallo(event.target.checked)
                            setErrorConfirmacion(null)
                          }}
                        />
                      </div>

                      <Button
                        type="submit"
                        form="formulario-confirmacion"
                        variant="success"
                        className="w-100"
                        id="boton-confirmar-carrito"
                        disabled={procesando || cantidad === 0}
                      >
                        <i
                          className="bi bi-check-circle me-2"
                          aria-hidden="true"
                        />

                        {procesando
                          ? 'Procesando...'
                          : 'Confirmar agendamiento'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="success"
                      className="w-100"
                      onClick={abrirRevision}
                    >
                      Continuar con la reserva
                      <i
                        className="bi bi-arrow-right ms-2"
                        aria-hidden="true"
                      />
                    </Button>
                  )}

                  <p className="gestion-ayuda small text-center mt-3 mb-0">
                    Simulación frontend con persistencia local.
                    No se realizan pagos reales.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </main>
  )
}

export default Carrito