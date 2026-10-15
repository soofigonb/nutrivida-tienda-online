import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
} from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import nutricionistas from '../data/nutricionistas'
import planes from '../data/planes'
import formatearPrecio from '../utils/formatearPrecio'
import {
  esFechaHoraFutura,
  obtenerFechaMinima,
} from '../utils/validaciones'

function Agendar() {
  // ========================================
  // 1. ESTADOS Y CONTEXTO
  // ========================================

  const location = useLocation()

  const {
    agregarReserva,
    existeConflictoHorario,
  } = useCarrito()

  const [planId, setPlanId] = useState('')
  const [nutricionistaId, setNutricionistaId] = useState('')
  const [motivo, setMotivo] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')

  const [errores, setErrores] = useState({})
  const [mensajeExito, setMensajeExito] = useState(null)

  // ========================================
  // 2. PRESELECCIÓN DEL PLAN
  // ========================================

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const planParam = params.get('plan')

    if (planParam) {
      const planEncontrado = planes.find(
        (plan) => plan.id === planParam,
      )

      if (planEncontrado) {
        setPlanId(planEncontrado.id)
      }
    }
  }, [location.search])

  const planSeleccionado =
    planes.find((plan) => plan.id === planId) || null

  const precioActual = planSeleccionado
    ? planSeleccionado.precio
    : 0

  // ========================================
  // 3. VALIDACIONES
  // ========================================

  function validarFormulario() {
    const nuevosErrores = {}

    if (!planId) {
      nuevosErrores.planId =
        'Debes seleccionar un plan o servicio.'
    }

    if (!nutricionistaId) {
      nuevosErrores.nutricionistaId =
        'Debes seleccionar un profesional nutricionista.'
    }

    if (!motivo.trim()) {
      nuevosErrores.motivo =
        'El motivo de consulta es obligatorio.'
    } else if (motivo.trim().length < 5) {
      nuevosErrores.motivo =
        'El motivo debe tener al menos 5 caracteres.'
    } else if (motivo.trim().length > 100) {
      nuevosErrores.motivo =
        'El motivo no puede exceder 100 caracteres.'
    }

    if (!fecha) {
      nuevosErrores.fecha =
        'Debes seleccionar una fecha para la consulta.'
    }

    if (!hora) {
      nuevosErrores.hora =
        'Debes seleccionar un horario de atención.'
    }

    if (
      fecha &&
      hora &&
      !esFechaHoraFutura(fecha, hora)
    ) {
      nuevosErrores.fechaHora =
        'La fecha y el horario seleccionados deben ser futuros. No es posible agendar en el pasado.'
    }

    if (
      nutricionistaId &&
      fecha &&
      hora &&
      !nuevosErrores.fechaHora &&
      existeConflictoHorario(nutricionistaId, fecha, hora)
    ) {
      nuevosErrores.conflicto =
        'El nutricionista seleccionado ya tiene una reserva en esa fecha y horario. Por favor elige otro horario u otro profesional.'
    }

    setErrores(nuevosErrores)

    return Object.keys(nuevosErrores).length === 0
  }

  // ========================================
  // 4. AGREGAR RESERVA
  // ========================================

  function handleSubmit(event) {
    event.preventDefault()
    setMensajeExito(null)

    if (!validarFormulario()) {
      return
    }

    const profesionalSeleccionado = nutricionistas.find(
      (nutricionista) =>
        String(nutricionista.id) === String(nutricionistaId),
    )

    const nuevaReserva = {
      planId: planSeleccionado.id,
      servicio: planSeleccionado.nombre,
      precio: precioActual,
      nutricionistaId,
      nutricionistaNombre: profesionalSeleccionado
        ? profesionalSeleccionado.nombre
        : 'Nutricionista',
      fecha,
      hora,
      motivo: motivo.trim(),
    }

    const resultado = agregarReserva(nuevaReserva)

    if (resultado.exito) {
      setMensajeExito({
        servicio: nuevaReserva.servicio,
        profesional: nuevaReserva.nutricionistaNombre,
        fecha: nuevaReserva.fecha,
        hora: nuevaReserva.hora,
        precio: nuevaReserva.precio,
      })

      setMotivo('')
      setFecha('')
      setHora('')
      setErrores({})
    } else {
      setErrores({ conflicto: resultado.mensaje })
    }
  }

  // ========================================
  // 5. INTERFAZ
  // ========================================

  return (
    <main className="agendar-main pagina-gestion">
      <Container>
        <div className="seccion-encabezado">
          <p className="seccion-etiqueta">
            Atención nutricional
          </p>

          <h1
            className="seccion-titulo"
            id="titulo-agendar"
          >
            Agenda tu cita
          </h1>

          <p className="seccion-descripcion">
            Selecciona el plan, el profesional y el horario que
            mejor se adapte a tus necesidades.
          </p>
        </div>

        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8} xl={7}>
            <Card className="gestion-tarjeta">
              <Card.Body className="gestion-tarjeta-cuerpo">
                {/* Confirmación al agregar al carrito */}
                <div aria-live="polite" aria-atomic="true">
                  {mensajeExito && (
                    <Alert
                      variant="success"
                      className="mb-4"
                      dismissible
                      onClose={() => setMensajeExito(null)}
                    >
                      <Alert.Heading className="h5">
                        <i
                          className="bi bi-check-circle-fill me-2"
                          aria-hidden="true"
                        />
                        ¡Consulta agregada al carrito con éxito!
                      </Alert.Heading>

                      <p className="mb-2 small">
                        <strong>Servicio:</strong>{' '}
                        {mensajeExito.servicio}{' '}
                        ({formatearPrecio(mensajeExito.precio)})
                        <br />

                        <strong>Especialista:</strong>{' '}
                        {mensajeExito.profesional}
                        <br />

                        <strong>Fecha y hora:</strong>{' '}
                        {mensajeExito.fecha} a las{' '}
                        {mensajeExito.hora} hrs.
                      </p>

                      <hr />

                      <div className="gestion-acciones">
                        <span className="small">
                          ¿Deseas confirmar tu cita?
                        </span>

                        <Link
                          to="/carrito"
                          className="btn btn-sm btn-success"
                        >
                          <i
                            className="bi bi-cart3 me-1"
                            aria-hidden="true"
                          />
                          Ir al Carrito
                        </Link>
                      </div>
                    </Alert>
                  )}

                  {errores.fechaHora && (
                    <Alert variant="danger">
                      {errores.fechaHora}
                    </Alert>
                  )}

                  {errores.conflicto && (
                    <Alert variant="danger">
                      {errores.conflicto}
                    </Alert>
                  )}
                </div>

                <Form
                  onSubmit={handleSubmit}
                  noValidate
                  id="formulario-agenda"
                >
                  {/* Plan o servicio */}
                  <Form.Group
                    className="mb-4"
                    controlId="plan-cita"
                  >
                    <Form.Label>Plan o servicio</Form.Label>

                    <Form.Select
                      value={planId}
                      aria-required="true"
                      aria-describedby="error-plan-cita"
                      onChange={(event) => {
                        setPlanId(event.target.value)
                        setErrores((actuales) => ({
                          ...actuales,
                          planId: null,
                        }))
                      }}
                      isInvalid={Boolean(errores.planId)}
                    >
                      <option value="">
                        Seleccione un plan
                      </option>

                      {planes.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.nombre} -{' '}
                          {formatearPrecio(plan.precio)}
                        </option>
                      ))}
                    </Form.Select>

                    <Form.Control.Feedback
                      type="invalid"
                      id="error-plan-cita"
                    >
                      {errores.planId}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Información y precio del plan */}
                  {planSeleccionado && (
                    <div className="agenda-plan-resumen">
                      <div className="agenda-plan-informacion">
                        <span className="agenda-plan-etiqueta">
                          {planSeleccionado.etiqueta}
                        </span>

                        <p>{planSeleccionado.descripcion}</p>
                      </div>

                      <div className="agenda-plan-precio">
                        <span>Valor del servicio</span>

                        <strong>
                          {formatearPrecio(precioActual)}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Nutricionista */}
                  <Form.Group
                    className="mb-4"
                    controlId="nutricionista"
                  >
                    <Form.Label>Nutricionista</Form.Label>

                    <Form.Select
                      value={nutricionistaId}
                      aria-required="true"
                      aria-describedby="error-nutricionista"
                      onChange={(event) => {
                        setNutricionistaId(event.target.value)
                        setErrores((actuales) => ({
                          ...actuales,
                          nutricionistaId: null,
                          conflicto: null,
                        }))
                      }}
                      isInvalid={Boolean(errores.nutricionistaId)}
                    >
                      <option value="">
                        Seleccione un nutricionista
                      </option>

                      {nutricionistas.map((nutricionista) => (
                        <option
                          key={nutricionista.id}
                          value={nutricionista.id}
                        >
                          {nutricionista.nombre} (
                          {nutricionista.especialidad}) -{' '}
                          {nutricionista.modalidad}
                        </option>
                      ))}
                    </Form.Select>

                    <Form.Control.Feedback
                      type="invalid"
                      id="error-nutricionista"
                    >
                      {errores.nutricionistaId}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Motivo */}
                  <Form.Group
                    className="mb-4"
                    controlId="motivo"
                  >
                    <Form.Label>
                      Motivo de consulta
                    </Form.Label>

                    <Form.Control
                      type="text"
                      placeholder="Ej: Evaluación nutricional o control de peso"
                      value={motivo}
                      maxLength={100}
                      aria-required="true"
                      aria-describedby="ayuda-motivo error-motivo"
                      onChange={(event) => {
                        setMotivo(event.target.value)
                        setErrores((actuales) => ({
                          ...actuales,
                          motivo: null,
                        }))
                      }}
                      isInvalid={Boolean(errores.motivo)}
                    />

                    <Form.Control.Feedback
                      type="invalid"
                      id="error-motivo"
                    >
                      {errores.motivo}
                    </Form.Control.Feedback>

                    <Form.Text id="ayuda-motivo">
                      Entre 5 y 100 caracteres. ({motivo.length}/100)
                    </Form.Text>
                  </Form.Group>

                  {/* Fecha y horario */}
                  <Row>
                    <Col xs={12} sm={6}>
                      <Form.Group
                        className="mb-4"
                        controlId="fecha-cita"
                      >
                        <Form.Label>Fecha</Form.Label>

                        <Form.Control
                          type="date"
                          min={obtenerFechaMinima()}
                          value={fecha}
                          aria-required="true"
                          aria-describedby="error-fecha-cita"
                          onChange={(event) => {
                            setFecha(event.target.value)
                            setErrores((actuales) => ({
                              ...actuales,
                              fecha: null,
                              fechaHora: null,
                              conflicto: null,
                            }))
                          }}
                          isInvalid={Boolean(errores.fecha)}
                        />

                        <Form.Control.Feedback
                          type="invalid"
                          id="error-fecha-cita"
                        >
                          {errores.fecha}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col xs={12} sm={6}>
                      <Form.Group
                        className="mb-4"
                        controlId="hora-cita"
                      >
                        <Form.Label>Horario</Form.Label>

                        <Form.Select
                          value={hora}
                          aria-required="true"
                          aria-describedby="error-hora-cita"
                          onChange={(event) => {
                            setHora(event.target.value)
                            setErrores((actuales) => ({
                              ...actuales,
                              hora: null,
                              fechaHora: null,
                              conflicto: null,
                            }))
                          }}
                          isInvalid={Boolean(errores.hora)}
                        >
                          <option value="">
                            Seleccione horario
                          </option>
                          <option value="09:00">09:00 horas</option>
                          <option value="11:00">11:00 horas</option>
                          <option value="15:00">15:00 horas</option>
                          <option value="17:00">17:00 horas</option>
                        </Form.Select>

                        <Form.Control.Feedback
                          type="invalid"
                          id="error-hora-cita"
                        >
                          {errores.hora}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button
                    type="submit"
                    variant="success"
                    className="w-100"
                    id="boton-agregar-carrito"
                  >
                    <i
                      className="bi bi-cart-plus me-2"
                      aria-hidden="true"
                    />
                    Agregar al carrito
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  )
}

export default Agendar