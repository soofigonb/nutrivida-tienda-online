import { useContext, useRef, useState } from 'react'
import { Alert, Button, Card, Container, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import formatearPrecio from '../utils/formatearPrecio'

export default function Carrito() {
  const { usuario } = useContext(AuthContext)
  const { reservas, cantidad, total, errorCarrito, eliminarReserva, vaciarCarrito, confirmarReservas } = useCarrito()
  const [orden, setOrden] = useState(null)
  const [error, setError] = useState('')
  const [revisando, setRevisando] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const enCurso = useRef(false)

  async function crearOrden() {
    if (enCurso.current) return
    enCurso.current = true; setProcesando(true); setError('')
    try {
      const resultado = await confirmarReservas()
      if (resultado.exito) { setOrden(resultado.orden); setRevisando(false) }
      else setError(resultado.mensaje)
    } catch { setError('No se pudo completar la orden. Puedes reintentar con el mismo carrito.') }
    finally { enCurso.current = false; setProcesando(false) }
  }

  function vaciar() {
    if (!window.confirm('¿Vaciar los borradores del carrito? Las órdenes ya creadas no se cancelan.')) return
    const resultado = vaciarCarrito()
    if (!resultado.exito) setError(resultado.mensaje)
    else { setOrden(null); setRevisando(false) }
  }

  return <main className="pagina-gestion py-5"><Container>
    <h1>Mi carrito de reservas</h1>
    <p>Revisa tus consultas y crea una orden con precios validados por el catálogo.</p>
    <Alert variant="info">Los horarios son borradores. Crear una orden no confirma citas ni realiza cobros.</Alert>
    {(error || errorCarrito) && <Alert variant="danger" role="alert">{error || errorCarrito}</Alert>}
    {orden && <Alert variant="success" role="status">
      <h2 className="h5">Orden registrada</h2>
      <p>Código: <strong>{orden.id}</strong></p>
      <p>Estado: {orden.estado}. Total validado: <strong>{formatearPrecio(orden.total)}</strong>.</p>
      <p>Los borradores se conservaron para completar el agendamiento cuando esté disponible.</p>
      <Link to={`/mis-ordenes/${orden.id}`}>Ver mi orden</Link>
    </Alert>}
    {cantidad === 0 ? <Card body><p>Tu carrito está vacío.</p><Link to="/agendar">Seleccionar una consulta</Link></Card> : <>
      <Table responsive><thead><tr><th>Consulta</th><th>Profesional</th><th>Horario solicitado</th><th>Precio de referencia</th><th>Acción</th></tr></thead><tbody>
        {reservas.map(r => <tr key={r.id}>
          <td>{r.servicio}</td><td>{r.nutricionistaNombre}</td><td>{r.fecha} · {r.hora}</td><td>{formatearPrecio(r.precio)}</td>
          <td><Button variant="outline-danger" size="sm" disabled={procesando} onClick={() => { eliminarReserva(r.id); setOrden(null); setRevisando(false) }}>Eliminar</Button></td>
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
