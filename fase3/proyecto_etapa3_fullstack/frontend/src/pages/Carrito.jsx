import { useContext, useRef, useState } from 'react'
import { Alert, Button, Card, Container, Form, Table } from 'react-bootstrap'
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
    <h1>Mi carrito de reservas</h1>
    <p>Revisa tus consultas y crea una orden con precios validados por el catálogo.</p>
    <Alert variant="info">Se registra la orden y luego se solicitan las citas. El proceso no realiza cobros.</Alert>
    {(error || errorCarrito) && <Alert variant="danger" role="alert">{error || errorCarrito}</Alert>}
    {orden && <Alert variant={pendientes.length ? 'warning' : 'success'} role="status">
      <h2 className="h5">Orden registrada</h2>
      <p>Código: <strong>{orden.id}</strong></p>
      <p>Estado: {orden.estado}. Total validado: <strong>{formatearPrecio(orden.total)}</strong>.</p>
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
      <Link to={`/mis-ordenes/${orden.id}`}>Ver mi orden</Link>
      {pendientes.length > 0 && <>
        <p className="mt-2 mb-1">Quedaron citas pendientes:</p>
        <ul>{pendientes.map(cita => <li className="mb-3" key={cita.id}>
          {cita.servicio}. {cita.motivo}
          <Form className="d-flex flex-wrap align-items-end gap-2" onSubmit={evento => cambiarHorario(evento, cita.id)}>
            <Form.Group controlId={`pendiente-fecha-${cita.id}`}>
              <Form.Label>Nueva fecha</Form.Label>
              <Form.Control name="fecha" type="date" required disabled={procesando} />
            </Form.Group>
            <Form.Group controlId={`pendiente-hora-${cita.id}`}>
              <Form.Label>Nuevo horario</Form.Label>
              <Form.Select name="hora" disabled={procesando}>
                {['09:00', '11:00', '15:00', '17:00'].map(hora => <option key={hora}>{hora}</option>)}
              </Form.Select>
            </Form.Group>
            <Button type="submit" variant="outline-primary" disabled={procesando}>Guardar horario</Button>
          </Form>
        </li>)}</ul>
        {avisoHorario && <p>{avisoHorario}</p>}
        <Button disabled={procesando} onClick={crearOrden}>Reintentar citas</Button>
      </>}
    </Alert>}
    {cantidad === 0 ? <Card body><p>Tu carrito está vacío.</p><Link to="/agendar">Seleccionar una consulta</Link></Card> : <>
      <Table responsive><thead><tr><th>Consulta</th><th>Profesional</th><th>Horario solicitado</th><th>Precio de referencia</th><th>Acción</th></tr></thead><tbody>
        {reservas.map(r => <tr key={r.id}>
          <td>{r.servicio}</td><td>{r.nutricionistaNombre}</td><td>{r.fecha} · {r.hora}</td><td>{formatearPrecio(r.precio)}</td>
          <td><Button variant="outline-danger" size="sm" disabled={procesando || Boolean(orden)} onClick={() => { eliminarReserva(r.id); setRevisando(false) }}>Eliminar</Button></td>
        </tr>)}
      </tbody></Table>
      <p>Total de referencia: <strong>{formatearPrecio(total)}</strong>. El precio definitivo lo calcula el servidor.</p>
      {!usuario ? <Alert variant="warning"><Link to="/login">Inicia sesión</Link> para crear tu orden.</Alert> : <>
        {!revisando && !orden && <Button variant="success" onClick={() => setRevisando(true)}>Revisar orden</Button>}
        {revisando && <Card body className="mb-3">
          <h2 className="h5">Revisión de orden</h2><p>La orden se asociará a tu cuenta: {usuario.correo}.</p>
          <p>Si ya enviaste esta misma solicitud, se recuperará su orden sin duplicarla.</p>
          <Button disabled={procesando} variant="success" onClick={crearOrden}>{procesando ? 'Registrando…' : 'Crear orden pendiente'}</Button>
          <Button disabled={procesando} className="ms-2" variant="outline-secondary" onClick={() => setRevisando(false)}>Volver al carrito</Button>
        </Card>}
      </>}
      <Button className="ms-2" variant="outline-danger" disabled={procesando} onClick={vaciar}>Vaciar carrito</Button>
    </>}
  </Container></main>
}
