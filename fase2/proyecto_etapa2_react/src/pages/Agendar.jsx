import { useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import nutricionistas from '../data/nutricionistas'
import planes from '../data/planes'
import formatearPrecio from '../utils/formatearPrecio'
import { esFechaHoraFutura, obtenerFechaMinima } from '../utils/validaciones'

function Agendar() {
  const location = useLocation()
  const { agregarReserva, existeConflictoHorario } = useCarrito()

  // Estados del formulario
  const [planId, setPlanId] = useState('')
  const [nutricionistaId, setNutricionistaId] = useState('')
  const [motivo, setMotivo] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')

  // Estados de retroalimentación
  const [errores, setErrores] = useState({})
  const [mensajeExito, setMensajeExito] = useState(null)

  // 1. Leer el parámetro ?plan= desde la URL y preseleccionar el plan
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const planParam = params.get('plan')

    if (planParam) {
      const planEncontrado = planes.find((p) => p.id === planParam)
      if (planEncontrado) {
        setPlanId(planEncontrado.id)
      }
    }
  }, [location.search])

  // Obtener el plan seleccionado para derivar el precio de forma segura
  const planSeleccionado = planes.find((p) => p.id === planId) || null
  const precioActual = planSeleccionado ? planSeleccionado.precio : 0

  // Validaciones del formulario
  const validarFormulario = () => {
    const nuevosErrores = {}

    if (!planId) {
      nuevosErrores.planId = 'Debes seleccionar un plan o servicio.'
    }

    if (!nutricionistaId) {
      nuevosErrores.nutricionistaId = 'Debes seleccionar un profesional nutricionista.'
    }

    if (!motivo.trim()) {
      nuevosErrores.motivo = 'El motivo de consulta es obligatorio.'
    } else if (motivo.trim().length < 5) {
      nuevosErrores.motivo = 'El motivo debe tener al menos 5 caracteres.'
    } else if (motivo.trim().length > 100) {
      nuevosErrores.motivo = 'El motivo no puede exceder 100 caracteres.'
    }

    if (!fecha) {
      nuevosErrores.fecha = 'Debes seleccionar una fecha para la consulta.'
    }

    if (!hora) {
      nuevosErrores.hora = 'Debes seleccionar un horario de atención.'
    }

    // Validación de fecha y hora futura combinadas (Criterio 1: Fecha u hora pasada bloquea agendamiento)
    if (fecha && hora && !esFechaHoraFutura(fecha, hora)) {
      nuevosErrores.fechaHora =
        'La fecha y el horario seleccionados deben ser futuros. No es posible agendar en el pasado.'
    }

    // Validación de horario duplicado para el mismo nutricionista
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

  const handleSubmit = (e) => {
    e.preventDefault()
    setMensajeExito(null)

    if (!validarFormulario()) {
      return
    }

    const profeSeleccionado = nutricionistas.find(
      (n) => String(n.id) === String(nutricionistaId)
    )

    const nuevaReserva = {
      planId: planSeleccionado.id,
      servicio: planSeleccionado.nombre,
      precio: precioActual, // Obtenido directamente de planes.js
      nutricionistaId,
      nutricionistaNombre: profeSeleccionado ? profeSeleccionado.nombre : 'Nutricionista',
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

      // Limpiar campos para permitir otra reserva
      setMotivo('')
      setFecha('')
      setHora('')
      setErrores({})
    } else {
      setErrores({ conflicto: resultado.mensaje })
    }
  }

  return (
    <main className="agendar-main py-5">
      <Container>
        {/* Encabezado */}
        <div className="seccion-encabezado text-center mb-4">
          <p className="seccion-etiqueta">Atención Nutricional</p>
          <h1 className="seccion-titulo" id="titulo-agendar">
            Agenda tu cita
          </h1>
          <p className="seccion-descripcion">
            Selecciona el plan, el profesional y el horario que mejor se adapte a tus necesidades.
          </p>
        </div>

        <Row className="justify-content-center">
          <Col xs={12} md={9} lg={7}>
            <Card className="shadow-sm border-0 rounded-3">
              <Card.Body className="p-4 p-md-5">
                {/* Alerta de exito al agregar al carrito */}
                {mensajeExito && (
                  <Alert variant="success" className="mb-4" dismissible onClose={() => setMensajeExito(null)}>
                    <Alert.Heading className="h5 mb-2">
                      <i className="bi bi-check-circle-fill me-2" />
                      ¡Consulta agregada al carrito con éxito!
                    </Alert.Heading>
                    <p className="mb-2 small">
                      <strong>Servicio:</strong> {mensajeExito.servicio} (
                      {formatearPrecio(mensajeExito.precio)})
                      <br />
                      <strong>Especialista:</strong> {mensajeExito.profesional}
                      <br />
                      <strong>Fecha y hora:</strong> {mensajeExito.fecha} a las {mensajeExito.hora} hrs.
                    </p>
                    <hr />
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="small text-muted">¿Deseas confirmar tu cita?</span>
                      <Link to="/carrito" className="btn btn-sm btn-success">
                        <i className="bi bi-cart3 me-1" />
                        Ir al Carrito
                      </Link>
                    </div>
                  </Alert>
                )}

                {/* Errores globales (fecha pasada o conflicto de reserva) */}
                {errores.fechaHora && (
                  <Alert variant="danger" className="mb-3">
                    <i className="bi bi-exclamation-triangle-fill me-2" />
                    {errores.fechaHora}
                  </Alert>
                )}

                {errores.conflicto && (
                  <Alert variant="danger" className="mb-3">
                    <i className="bi bi-exclamation-circle-fill me-2" />
                    {errores.conflicto}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit} noValidate id="formulario-agenda">
                  {/* Campo: Plan o Servicio */}
                  <Form.Group className="mb-3" controlId="plan-cita">
                    <Form.Label className="fw-semibold">Plan o servicio</Form.Label>
                    <Form.Select
                      value={planId}
                      onChange={(e) => {
                        setPlanId(e.target.value)
                        setErrores((prev) => ({ ...prev, planId: null }))
                      }}
                      isInvalid={!!errores.planId}
                    >
                      <option value="">Seleccione un plan</option>
                      {planes.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.nombre} - {formatearPrecio(plan.precio)}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errores.planId}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Precio calculado automáticamente */}
                  {planSeleccionado && (
                    <div className="p-3 mb-3 bg-light rounded border border-success-subtle d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-success-subtle text-success me-2">
                          {planSeleccionado.etiqueta}
                        </span>
                        <small className="text-muted d-block mt-1">
                          {planSeleccionado.descripcion}
                        </small>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block">Valor del servicio:</small>
                        <strong className="text-success fs-5">
                          {formatearPrecio(precioActual)}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Campo: Nutricionista */}
                  <Form.Group className="mb-3" controlId="nutricionista">
                    <Form.Label className="fw-semibold">Nutricionista</Form.Label>
                    <Form.Select
                      value={nutricionistaId}
                      onChange={(e) => {
                        setNutricionistaId(e.target.value)
                        setErrores((prev) => ({ ...prev, nutricionistaId: null, conflicto: null }))
                      }}
                      isInvalid={!!errores.nutricionistaId}
                    >
                      <option value="">Seleccione un nutricionista</option>
                      {nutricionistas.map((nutri) => (
                        <option key={nutri.id} value={nutri.id}>
                          {nutri.nombre} ({nutri.especialidad}) - {nutri.modalidad}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errores.nutricionistaId}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Campo: Motivo de consulta */}
                  <Form.Group className="mb-3" controlId="motivo">
                    <Form.Label className="fw-semibold">Motivo de consulta</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ej: Evaluación antropométrica, control de peso, cambio de hábitos..."
                      value={motivo}
                      onChange={(e) => {
                        setMotivo(e.target.value)
                        setErrores((prev) => ({ ...prev, motivo: null }))
                      }}
                      maxLength={100}
                      isInvalid={!!errores.motivo}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errores.motivo}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Entre 5 y 100 caracteres. ({motivo.length}/100)
                    </Form.Text>
                  </Form.Group>

                  {/* Campos Fecha y Horario en dos columnas responsivas */}
                  <Row>
                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-3" controlId="fecha-cita">
                        <Form.Label className="fw-semibold">Fecha</Form.Label>
                        <Form.Control
                          type="date"
                          min={obtenerFechaMinima()}
                          value={fecha}
                          onChange={(e) => {
                            setFecha(e.target.value)
                            setErrores((prev) => ({
                              ...prev,
                              fecha: null,
                              fechaHora: null,
                              conflicto: null,
                            }))
                          }}
                          isInvalid={!!errores.fecha}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errores.fecha}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-3" controlId="hora-cita">
                        <Form.Label className="fw-semibold">Horario</Form.Label>
                        <Form.Select
                          value={hora}
                          onChange={(e) => {
                            setHora(e.target.value)
                            setErrores((prev) => ({
                              ...prev,
                              hora: null,
                              fechaHora: null,
                              conflicto: null,
                            }))
                          }}
                          isInvalid={!!errores.hora}
                        >
                          <option value="">Seleccione horario</option>
                          <option value="09:00">09:00 horas</option>
                          <option value="11:00">11:00 horas</option>
                          <option value="15:00">15:00 horas</option>
                          <option value="17:00">17:00 horas</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errores.hora}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Botón para Enviar */}
                  <Button
                    type="submit"
                    variant="success"
                    size="lg"
                    className="w-100 mt-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                    id="boton-agregar-carrito"
                  >
                    <i className="bi bi-cart-plus fs-5" />
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
