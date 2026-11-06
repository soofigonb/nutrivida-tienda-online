// Consulta órdenes reales; el backend determina cuáles puede ver cada usuario.
import { useContext, useState } from 'react'
import { Alert, Button, Container, Table } from 'react-bootstrap'
import { Link, useLocation, useParams } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { api } from '../services/api'
import { useRecursoApi } from '../hooks/useRecursoApi'
import formatearPrecio from '../utils/formatearPrecio'

export default function Ordenes() {
  const { usuario } = useContext(AuthContext)
  const { id } = useParams()
  const { pathname } = useLocation()
  const base = pathname.startsWith('/gestion') ? '/gestion/ordenes' : '/mis-ordenes'
  const [error, setError] = useState('')
  const [actualizando, setActualizando] = useState(false)
  const [revision, setRevision] = useState(0)
  const recurso = useRecursoApi(id ? `ordenes/${encodeURIComponent(id)}` : 'ordenes', revision, id ? 'detalle' : 'lista')
  const { datos } = recurso
  const errorVisible = error || recurso.error

  async function cambiar(estado) {
    if (!window.confirm(estado === 'CANCELADA' ? '¿Cancelar esta orden pendiente?' : '¿Confirmar esta orden? Esta acción no reserva un horario clínico.')) return
    setActualizando(true); setError('')
    try {
      // El vendedor no tiene controles de escritura y tampoco permiso en la API.
      if (estado === 'CANCELADA') await api.solicitar(`ordenes/${id}`, { method: 'DELETE' })
      else await api.solicitar(`ordenes/${id}`, { method: 'PUT', body: { estado } })
      setRevision(v => v + 1)
    } catch (e) { setError(e.message) } finally { setActualizando(false) }
  }

  return <main className="py-5"><Container>
    <h1>{id ? 'Detalle de orden' : usuario.rol === 'CLIENTE' ? 'Mis órdenes' : 'Órdenes'}</h1>
    {errorVisible && <Alert variant="danger">{errorVisible}<div><Button className="mt-2" variant="outline-danger" onClick={() => { setError(''); setRevision(v => v + 1) }}>Reintentar</Button></div></Alert>}
    {!datos && !errorVisible && <p role="status">Cargando órdenes…</p>}
    {id && datos && <>
      <p><strong>Código:</strong> {datos.id}</p><p><strong>Estado:</strong> {datos.estado}</p>
      <Table responsive><thead><tr><th>Artículo</th><th>Cantidad</th><th>Precio unitario</th></tr></thead><tbody>
        {datos.detalles.map((d, i) => <tr key={d.idItem ?? d.idPlan ?? i}><td>{d.nombreItem ?? d.nombrePlan}</td><td>{d.cantidad}</td><td>{formatearPrecio(d.precioUnitario)}</td></tr>)}
      </tbody></Table>
      <p><strong>Total:</strong> {formatearPrecio(datos.total)}</p>
      <Alert variant="info">Esta orden no acredita un pago ni una reserva de horario clínico.</Alert>
      {datos.estado === 'PENDIENTE' && ['ADMINISTRADOR', 'CLIENTE'].includes(usuario.rol) && <Button disabled={actualizando} variant="outline-danger" onClick={() => cambiar('CANCELADA')}>Cancelar orden</Button>}
      {datos.estado === 'PENDIENTE' && usuario.rol === 'ADMINISTRADOR' && <Button className="ms-2" disabled={actualizando} onClick={() => cambiar('CONFIRMADA')}>Confirmar orden</Button>}
      <p className="mt-3"><Link to={base}>Volver a las órdenes</Link></p>
    </>}
    {!id && Array.isArray(datos) && <Table responsive><thead><tr><th>Código</th><th>Fecha</th><th>Estado</th><th>Total</th><th>Detalle</th></tr></thead><tbody>
      {datos.map(o => <tr key={o.id}><td>{o.id}</td><td>{new Date(o.creadoEn).toLocaleString('es-CL')}</td><td>{o.estado}</td><td>{formatearPrecio(o.total)}</td><td><Link to={`${base}/${o.id}`}>Ver detalle</Link></td></tr>)}
      {datos.length === 0 && <tr><td colSpan={5}>No hay órdenes registradas.</td></tr>}
    </tbody></Table>}
  </Container></main>
}
