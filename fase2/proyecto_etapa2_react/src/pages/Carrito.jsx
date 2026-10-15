import { useContext, useState } from 'react'
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
    eliminarReserva,
    vaciarCarrito,
    confirmarReservas,
    cantidad,
    total,
  } = useCarrito()

  const { usuario } = useContext(AuthContext) || {}

  const [simularFallo, setSimularFallo] = useState(false)
  const [errorConfirmacion, setErrorConfirmacion] = useState(null)
  const [confirmacionExitosa, setConfirmacionExitosa] = useState(null)
  const [procesando, setProcesando] = useState(false)

  // ========================================
  // 2. CONFIRMAR RESERVAS
  // ========================================

  function handleConfirmar() {
    setErrorConfirmacion(null)
    setProcesando(true)

    const resultado = confirmarReservas(
      usuario || null,
      simularFallo,
    )

    setProcesando(false)

    if (resultado.exito) {
      setConfirmacionExitosa(resultado.citasCreadas)
    } else {
      setErrorConfirmacion(resultado.mensaje)
    }
  }

  // ========================================
  // 3. RESUMEN DE CONFIRMACIÓN
  // ========================================

  if (confirmacionExitosa && confirmacionExitosa.length > 0) {
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
              Tus citas han sido reservadas y guardadas exitosamente
              en tu historial.
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
                          <strong>Profesional:</strong>{' '}
                          {cita.nutricionistaNombre}
                        </p>

                        <p>
                          <strong>Fecha y hora:</strong>{' '}
                          {cita.fecha} a las {cita.hora} hrs.
                        </p>

                        <p>
                          <strong>Motivo:</strong> {cita.motivo}
                        </p>

                        <p className="carrito-codigo">
                          Código de reserva:{' '}
                          <code>{cita.idCita}</code>
                        </p>
                      </article>
                    ))}
                  </div>

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

                    <Link
                      to="/"
                      className="btn btn-success"
                    >
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
  // 4. CARRITO Y TOTAL
  // ========================================

  return (
    <main className="carrito-main pagina-gestion">
      <Container>
        <div className="seccion-encabezado">
          <p className="seccion-etiqueta">
            Resumen de compra
          </p>

          <h1 className="seccion-titulo">
            Mi Carrito de Reservas
          </h1>

          <p className="seccion-descripcion">
            Revisa los detalles de tus consultas nutricionales
            antes de confirmar el agendamiento.
          </p>
        </div>

        {/* Errores de confirmación */}
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

              <p className="mb-0">
                {errorConfirmacion}
              </p>
            </Alert>
          )}
        </div>

        {cantidad === 0 ? (
          /* Carrito vacío */
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
                      <i
                        className="bi bi-calendar-plus me-2"
                        aria-hidden="true"
                      />
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
            {/* Listado de consultas */}
            <Col xs={12} lg={8}>
              <Card className="gestion-tarjeta mb-4">
                <Card.Header className="carrito-tarjeta-encabezado">
                  <span>
                    Consultas seleccionadas (
                    <span id="cantidad-carrito">
                      {cantidad}
                    </span>
                    )
                  </span>

                  <Button
                    variant="link"
                    className="carrito-vaciar"
                    onClick={vaciarCarrito}
                  >
                    <i
                      className="bi bi-trash3 me-1"
                      aria-hidden="true"
                    />
                    Vaciar todo
                  </Button>
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
                          <th className="text-end pe-4">
                            Acción
                          </th>
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
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>

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
            </Col>

            {/* Total y confirmación */}
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
                      Paciente:{' '}
                      <strong>{usuario.nombre}</strong>
                    </div>
                  )}

                  <div className="carrito-total">
                    <span>Total:</span>

                    <strong id="total-carrito">
                      {formatearPrecio(total)}
                    </strong>
                  </div>

                  {/* Control de simulación existente */}
                  <div className="carrito-simulacion">
                    <Form.Check
                      type="switch"
                      id="check-simular-fallo"
                      label="Simular fallo al confirmar (Prueba técnica)"
                      checked={simularFallo}
                      onChange={(event) =>
                        setSimularFallo(event.target.checked)
                      }
                    />
                  </div>

                  <Button
                    variant="success"
                    className="w-100"
                    id="boton-confirmar-carrito"
                    onClick={handleConfirmar}
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

                  <p className="gestion-ayuda small text-center mt-3 mb-0">
                    Simulación frontend con persistencia local.
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