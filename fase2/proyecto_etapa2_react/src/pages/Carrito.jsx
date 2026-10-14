import { useContext, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import formatearPrecio from '../utils/formatearPrecio'

function Carrito() {
  const { reservas, eliminarReserva, vaciarCarrito, confirmarReservas, cantidad, total } =
    useCarrito()
  const { usuario } = useContext(AuthContext) || {}

  // Estados de control para la confirmación
  const [simularFallo, setSimularFallo] = useState(false)
  const [errorConfirmacion, setErrorConfirmacion] = useState(null)
  const [confirmacionExitosa, setConfirmacionExitosa] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const handleConfirmar = () => {
    setErrorConfirmacion(null)
    setProcesando(true)

    // Llamada a la confirmación en el contexto
    const resultado = confirmarReservas(usuario || null, simularFallo)

    setProcesando(false)

    if (resultado.exito) {
      setConfirmacionExitosa(resultado.citasCreadas)
    } else {
      // Si la confirmación falla, se muestra el error y se conserva el carrito intacto (Criterio 3)
      setErrorConfirmacion(resultado.mensaje)
    }
  }

  // Pantalla de resumen cuando la confirmación fue exitosa
  if (confirmacionExitosa && confirmacionExitosa.length > 0) {
    return (
      <main className="carrito-main py-5">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8}>
              <Card className="shadow border-0 rounded-4 text-center p-4 p-md-5">
                <div className="mb-3 text-success">
                  <i className="bi bi-check-circle-fill" style={{ fontSize: '3.5rem' }} />
                </div>
                <h1 className="h3 fw-bold text-success mb-2">
                  ¡Agendamiento Confirmado!
                </h1>
                <p className="text-muted mb-4">
                  Tus citas han sido reservadas y guardadas exitosamente en tu historial.
                </p>

                <div className="text-start mb-4">
                  <h2 className="h5 fw-semibold mb-3">Resumen de consultas confirmadas:</h2>
                  <div className="list-group">
                    {confirmacionExitosa.map((cita) => (
                      <div
                        key={cita.idCita}
                        className="list-group-item list-group-item-action p-3 rounded-3 mb-2 border"
                      >
                        <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                          <h3 className="h6 fw-bold text-primary mb-0">{cita.servicio}</h3>
                          <Badge bg="success">{formatearPrecio(cita.precio)}</Badge>
                        </div>
                        <p className="mb-1 small text-secondary">
                          <strong>Profesional:</strong> {cita.nutricionistaNombre}
                          <br />
                          <strong>Fecha y hora:</strong> {cita.fecha} a las {cita.hora} hrs.
                          <br />
                          <strong>Motivo:</strong> {cita.motivo}
                        </p>
                        <small className="text-muted">
                          Código de reserva: <code className="text-dark">{cita.idCita}</code>
                        </small>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <Link to="/agendar" className="btn btn-outline-success">
                    <i className="bi bi-calendar-plus me-1" />
                    Agendar otra consulta
                  </Link>
                  <Link to="/" className="btn btn-success">
                    <i className="bi bi-house me-1" />
                    Volver al inicio
                  </Link>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    )
  }

  return (
    <main className="carrito-main py-5">
      <Container>
        {/* Encabezado */}
        <div className="seccion-encabezado text-center mb-4">
          <p className="seccion-etiqueta">Resumen de compra</p>
          <h1 className="seccion-titulo">Mi Carrito de Reservas</h1>
          <p className="seccion-descripcion">
            Revisa los detalles de tus consultas nutricionales antes de confirmar el agendamiento.
          </p>
        </div>

        {/* Mensaje de error al fallar la confirmación (conserva el carrito) */}
        {errorConfirmacion && (
          <Row className="justify-content-center mb-3">
            <Col xs={12} lg={10}>
              <Alert
                variant="danger"
                dismissible
                onClose={() => setErrorConfirmacion(null)}
                id="alerta-error-carrito"
              >
                <Alert.Heading className="h6 mb-1">
                  <i className="bi bi-x-octagon-fill me-2" />
                  No se pudo completar la confirmación
                </Alert.Heading>
                <p className="mb-0 small">{errorConfirmacion}</p>
              </Alert>
            </Col>
          </Row>
        )}

        {/* ESTADO VACÍO */}
        {cantidad === 0 ? (
          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={6}>
              <Card className="text-center p-5 shadow-sm border-0 rounded-4">
                <div className="text-muted mb-3">
                  <i className="bi bi-cart-x" style={{ fontSize: '4rem' }} />
                </div>
                <h2 className="h4 fw-bold mb-2">Tu carrito está vacío</h2>
                <p id="carrito-vacio" className="text-muted mb-4">
                  Todavía no has agregado una consulta.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <Link to="/agendar" className="btn btn-success px-4">
                    <i className="bi bi-calendar-plus me-2" />
                    Agendar una cita
                  </Link>
                  <Link to="/#servicios" className="btn btn-outline-secondary px-4">
                    Ver planes
                  </Link>
                </div>
              </Card>
            </Col>
          </Row>
        ) : (
          /* LISTADO DE RESERVAS Y RESUMEN */
          <Row className="g-4 justify-content-center">
            <Col xs={12} lg={8}>
              <Card className="shadow-sm border-0 rounded-4 mb-4">
                <Card.Header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                  <span className="fw-bold">
                    Consultas seleccionadas (
                    <span id="cantidad-carrito">{cantidad}</span>)
                  </span>
                  <Button
                    variant="link"
                    className="text-danger p-0 text-decoration-none small"
                    onClick={vaciarCarrito}
                  >
                    <i className="bi bi-trash3 me-1" />
                    Vaciar todo
                  </Button>
                </Card.Header>

                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0" id="lista-carrito">
                      <thead className="table-light">
                        <tr>
                          <th className="ps-4">Servicio</th>
                          <th>Nutricionista</th>
                          <th>Fecha y Hora</th>
                          <th>Precio</th>
                          <th className="text-end pe-4">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservas.map((item) => (
                          <tr key={item.id}>
                            <td className="ps-4">
                              <span className="fw-semibold text-dark d-block">
                                {item.servicio}
                              </span>
                              {item.motivo && (
                                <small className="text-muted d-block">
                                  Motivo: {item.motivo}
                                </small>
                              )}
                            </td>
                            <td>
                              <span className="text-secondary small">
                                {item.nutricionistaNombre}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {item.fecha} - {item.hora} hrs
                              </span>
                            </td>
                            <td>
                              <span className="fw-bold text-success">
                                {formatearPrecio(item.precio)}
                              </span>
                            </td>
                            <td className="text-end pe-4">
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => eliminarReserva(item.id)}
                                title="Eliminar consulta"
                                aria-label={`Eliminar ${item.servicio}`}
                                className="boton-eliminar-reserva"
                              >
                                <i className="bi bi-trash" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>

              <div className="d-flex justify-content-between align-items-center">
                <Link to="/agendar" className="btn btn-outline-success">
                  <i className="bi bi-arrow-left me-1" />
                  Seguir agendando
                </Link>
              </div>
            </Col>

            {/* PANEL LATERAL DE TOTAL Y CONFIRMACIÓN */}
            <Col xs={12} lg={4}>
              <Card className="shadow-sm border-0 rounded-4 p-3 p-md-4">
                <h2 className="h5 fw-bold mb-3 border-bottom pb-2">Total de la reserva</h2>

                <div className="d-flex justify-content-between mb-2 text-muted">
                  <span>Cantidad de consultas:</span>
                  <span>{cantidad}</span>
                </div>

                {usuario && (
                  <div className="p-2 mb-3 bg-light rounded small text-secondary">
                    <i className="bi bi-person-check me-1 text-success" />
                    Paciente: <strong>{usuario.nombre}</strong>
                  </div>
                )}

                <hr />

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fs-5 fw-bold text-dark">Total:</span>
                  <strong className="fs-4 text-success" id="total-carrito">
                    {formatearPrecio(total)}
                  </strong>
                </div>

                {/* Opción de simulación de fallo para pruebas (requerida en la guía) */}
                <div className="mb-3 p-2 bg-light border rounded">
                  <Form.Check
                    type="switch"
                    id="check-simular-fallo"
                    label={
                      <small className="text-muted">
                        Simular fallo al confirmar (Prueba técnica)
                      </small>
                    }
                    checked={simularFallo}
                    onChange={(e) => setSimularFallo(e.target.checked)}
                  />
                </div>

                <Button
                  variant="success"
                  size="lg"
                  className="w-100 fw-bold d-flex justify-content-center align-items-center gap-2"
                  id="boton-confirmar-carrito"
                  onClick={handleConfirmar}
                  disabled={procesando || cantidad === 0}
                >
                  <i className="bi bi-check-circle" />
                  {procesando ? 'Procesando...' : 'Confirmar agendamiento'}
                </Button>

                <p className="text-muted small text-center mt-3 mb-0">
                  <i className="bi bi-shield-check me-1" />
                  Simulación frontend con persistencia local.
                </p>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </main>
  )
}

export default Carrito
