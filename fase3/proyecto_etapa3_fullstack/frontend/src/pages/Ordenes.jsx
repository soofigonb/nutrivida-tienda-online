import { useContext, useState } from 'react'
import { Alert, Button, Card, Container } from 'react-bootstrap'
import { Link, useLocation, useParams } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { api } from '../services/api'
import { useRecursoApi } from '../hooks/useRecursoApi'
import formatearPrecio from '../utils/formatearPrecio'

export default function Ordenes() {
  const { usuario } = useContext(AuthContext)
  const { id } = useParams()
  const { pathname } = useLocation()
  const esGestion = pathname.startsWith('/gestion')
  const base = esGestion ? '/gestion/ordenes' : '/mis-ordenes'
  const Contenido = esGestion ? 'section' : 'main'
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
      if (estado === 'CANCELADA') await api.solicitar(`ordenes/${id}`, { method: 'DELETE' })
      else await api.solicitar(`ordenes/${id}`, { method: 'PUT', body: { estado } })
      setRevision(v => v + 1)
    } catch (e) { setError(e.message) } finally { setActualizando(false) }
  }

  return <Contenido className={esGestion ? 'pagina-gestion pagina-gestion-panel' : 'pagina-gestion py-5'}>
    <Container fluid={esGestion} className={esGestion ? 'px-0' : undefined}>
    <h1 className="seccion-titulo">{id ? 'Detalle de orden' : usuario.rol === 'CLIENTE' ? 'Mis órdenes' : 'Órdenes'}</h1>
    {errorVisible && <Alert variant="danger">{errorVisible}<div><Button className="mt-2" variant="outline-success" onClick={() => { setError(''); setRevision(v => v + 1) }}>Reintentar</Button></div></Alert>}
    {!datos && !errorVisible && <p role="status">Cargando órdenes…</p>}
    {id && datos && <Card body className="gestion-tarjeta mb-3">
      <h2 className="gestion-subtitulo">Resumen de la orden</h2>
      <p className="text-break"><strong>Código:</strong> {datos.id}</p>
      <p><strong>Estado:</strong> {datos.estado}</p>
      <h3 className="gestion-subtitulo">Artículos</h3>
      <ul className="ps-3">
        {datos.detalles.map((detalle, indice) => (
          <li className="mb-2" key={detalle.idItem ?? detalle.idPlan ?? indice}>
            <strong>{detalle.nombreItem ?? detalle.nombrePlan}</strong>
            <div>Cantidad: {detalle.cantidad} · Precio unitario: {formatearPrecio(detalle.precioUnitario)}</div>
          </li>
        ))}
      </ul>
      <p><strong>Total:</strong> {formatearPrecio(datos.total)}</p>
      <Alert variant="info">Esta orden no acredita un pago ni una reserva de horario clínico.</Alert>
      <div className="d-flex flex-wrap gap-2">
        {datos.estado === 'PENDIENTE' && ['ADMINISTRADOR', 'CLIENTE'].includes(usuario.rol) && <Button disabled={actualizando} variant="outline-success" onClick={() => cambiar('CANCELADA')}>Cancelar orden</Button>}
        {datos.estado === 'PENDIENTE' && usuario.rol === 'ADMINISTRADOR' && <Button variant="success" disabled={actualizando} onClick={() => cambiar('CONFIRMADA')}>Confirmar orden</Button>}
      </div>
    </Card>}
    {id && <Button as={Link} variant="outline-success" to={base}>Volver a las órdenes</Button>}
    {!id && Array.isArray(datos) && <>
      {datos.length === 0 && <p>No hay órdenes registradas.</p>}
      {datos.map(orden => <Card key={orden.id} body className="gestion-tarjeta mb-3">
        <h2 className="gestion-subtitulo">Orden del {new Date(orden.creadoEn).toLocaleDateString('es-CL')}</h2>
        <p className="text-break"><strong>Código:</strong> {orden.id}</p>
        <p><strong>Estado:</strong> {orden.estado} · <strong>Total:</strong> {formatearPrecio(orden.total)}</p>
        <Button as={Link} variant="outline-success" to={`${base}/${orden.id}`}>Ver detalle</Button>
      </Card>)}
    </>}
    </Container>
  </Contenido>
}
