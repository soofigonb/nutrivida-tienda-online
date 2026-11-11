import { useContext, useRef, useState } from 'react'
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import formatearPrecio from '../utils/formatearPrecio'

export default function Carrito() {
  const { usuario } = useContext(AuthContext)
  const { reservas, cantidad, total, errorCarrito, eliminarReserva, vaciarCarrito,
    confirmarReservas, ajustarHorarioPendiente } = useCarrito()
  const [orden, setOrden] = useState(null)
  const [citasRegistradas, setCitasRegistradas] = useState([])
  const [pendientes, setPendientes] = useState([])
  const [avisoHorario, setAvisoHorario] = useState('')
  const [error, setError] = useState('')
  const [revisando, setRevisando] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const enCurso = useRef(false)

  async function crearOrden() {
    if (enCurso.current) return
    enCurso.current = true; setProcesando(true); setError('')
    setAvisoHorario('')
    try {
      const resultado = await confirmarReservas()
      if (resultado.exito) {
        setOrden(resultado.orden)
        setCitasRegistradas(resultado.citas || [])
        setPendientes(resultado.pendientes || [])
        setRevisando(false)
      } else setError(resultado.mensaje)
    } catch { setError('No se pudo completar la orden. Puedes reintentar con el mismo carrito.') }
    finally { enCurso.current = false; setProcesando(false) }
  }

  function vaciar() {
    if (!window.confirm('¿Vaciar los borradores del carrito? Las órdenes ya creadas no se cancelan.')) return
    const resultado = vaciarCarrito()
    if (!resultado.exito) setError(resultado.mensaje)
    else { setOrden(null); setCitasRegistradas([]); setPendientes([]); setRevisando(false) }
  }

  function cambiarHorario(evento, id) {
    evento.preventDefault()
    const { fecha, hora } = Object.fromEntries(new FormData(evento.currentTarget))
    if (ajustarHorarioPendiente(id, fecha, hora).exito) {
      setAvisoHorario('Horario actualizado. Pulsa «Reintentar citas» para solicitarlo.')
    }
  }

  return <main className="pagina-gestion py-5"><Container>
    <header className="seccion-encabezado">
      <p className="seccion-etiqueta">Reservas NutriVida</p>
      <h1 className="seccion-titulo">Mi carrito de reservas</h1>
      <p className="seccion-descripcion">Revisa tus consultas y crea una orden con precios validados por el catálogo.</p>
    </header>
    <Alert variant="info">La orden aparecerá en Mis órdenes cuando se registren todas las citas. El proceso no realiza cobros.</Alert>
    {(error || errorCarrito) && <Alert variant="danger" role="alert">{error || errorCarrito}</Alert>}
    {orden && <Alert variant={pendientes.length ? 'warning' : 'success'} role="status">
      <h2 className="gestion-subtitulo">{pendientes.length ? 'Solicitud de reserva pendiente' : 'Orden registrada'}</h2>
      {pendientes.length === 0 && <>
        <p>Código: <strong>{orden.id}</strong></p>
        <p>Estado: {orden.estado}. Total validado: <strong>{formatearPrecio(orden.total)}</strong>.</p>
      </>}
      {citasRegistradas.length > 0 && (
        <div className="mt-2 pt-2 border-top">
          <p className="mb-1 text-success fw-bold">✓ Cita registrada en PostgreSQL (Agendamiento):</p>
          <ul className="mb-2 ps-3">
            {citasRegistradas.map(c => (
              <li key={c.reservaId || c.id}>
                Reserva N° <strong>{c.reservaId || c.id}</strong> — Profesional: {c.nutricionistaNombre} ({c.fecha} · {c.hora}) — Estado: <strong>{c.estado || 'CONFIRMADA'}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
      {pendientes.length === 0 && <Button as={Link} variant="success" to={`/mis-ordenes/${orden.id}`}>Ver mi orden</Button>}
      {pendientes.length > 0 && <>
        <p className="mt-2 mb-1">Quedaron citas pendientes:</p>
        {pendientes.map(cita => (
          <Card key={cita.id} className="gestion-tarjeta my-3">
            <Card.Body>
              <h3 className="gestion-subtitulo">{cita.servicio}</h3>
              <p className="gestion-ayuda">{cita.motivo}</p>
              <Form onSubmit={evento => cambiarHorario(evento, cita.id)}>
                <Row className="g-3 align-items-end">
                  <Form.Group as={Col} xs={12} sm={6} lg={4} controlId={`pendiente-fecha-${cita.id}`}>
                    <Form.Label>Nueva fecha</Form.Label>
                    <Form.Control name="fecha" type="date" required disabled={procesando} />
                  </Form.Group>
                  <Form.Group as={Col} xs={12} sm={6} lg={4} controlId={`pendiente-hora-${cita.id}`}>
                    <Form.Label>Nuevo horario</Form.Label>
                    <Form.Select name="hora" disabled={procesando}>
                      {['09:00', '11:00', '15:00', '17:00'].map(hora => <option key={hora}>{hora}</option>)}
                    </Form.Select>
                  </Form.Group>
                  <Col xs={12} lg="auto">
                    <Button type="submit" variant="outline-success" disabled={procesando}>Guardar horario</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        ))}
        {avisoHorario && <p role="status">{avisoHorario}</p>}
        <Button variant="success" disabled={procesando} onClick={crearOrden}>Reintentar citas</Button>
      </>}
    </Alert>}
    {cantidad === 0 ? (
      <Card className="gestion-tarjeta">
        <Card.Body className="gestion-tarjeta-cuerpo">
          <h2 className="gestion-subtitulo">Tu carrito está vacío.</h2>
          <Button as={Link} variant="success" to="/agendar">Seleccionar una consulta</Button>
        </Card.Body>
      </Card>
    ) : (
      <Row className="g-4">
        <Col xs={12} lg={7}>
          <h2 className="gestion-subtitulo mb-3">Consultas seleccionadas</h2>
          <div className="d-grid gap-3">
            {reservas.map(reserva => (
              <Card key={reserva.id} className="gestion-tarjeta">
                <Card.Body className="gestion-tarjeta-cuerpo">
                  <h3 className="gestion-subtitulo">{reserva.servicio}</h3>
                  <p className="gestion-ayuda mb-3">
                    {reserva.nutricionistaNombre} · {reserva.fecha} a las {reserva.hora}
                  </p>
                  <div className="gestion-acciones">
                    <strong className="text-success">{formatearPrecio(reserva.precio)}</strong>
                    <Button variant="outline-success" size="sm" disabled={procesando || Boolean(orden)} onClick={() => { eliminarReserva(reserva.id); setRevisando(false) }}>Eliminar</Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </Col>
        <Col xs={12} lg={5}>
          <Card className="gestion-tarjeta">
            <Card.Body className="gestion-tarjeta-cuerpo">
              <h2 className="gestion-subtitulo">{revisando ? 'Confirmación de orden' : 'Resumen de la orden'}</h2>
              <p className="mb-1">Total de referencia: <strong className="text-success">{formatearPrecio(total)}</strong></p>
              <p className="gestion-ayuda">El precio definitivo lo calcula el servidor.</p>
              {!usuario && <Alert variant="warning"><Link className="link-success" to="/login">Inicia sesión</Link> para crear tu orden.</Alert>}
              {revisando && usuario && <>
                <p className="text-break">La orden se asociará a tu cuenta: {usuario.correo}.</p>
                <p className="gestion-ayuda">Si ya enviaste esta misma solicitud, se recuperará su orden sin duplicarla.</p>
              </>}
              <div className="d-flex flex-wrap gap-2 pt-3 border-top">
                {usuario && !revisando && !orden && <Button variant="success" onClick={() => setRevisando(true)}>Confirmar orden</Button>}
                {usuario && revisando && <>
                  <Button disabled={procesando} variant="success" onClick={crearOrden}>{procesando ? 'Registrando…' : 'Registrar orden'}</Button>
                  <Button disabled={procesando} variant="outline-success" onClick={() => setRevisando(false)}>Volver al carrito</Button>
                </>}
                <Button variant="outline-success" disabled={procesando} onClick={vaciar}>Vaciar carrito</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    )}
  </Container></main>
}
