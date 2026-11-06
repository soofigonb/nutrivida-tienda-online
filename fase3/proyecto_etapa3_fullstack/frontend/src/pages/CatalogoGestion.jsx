// Lectura del catálogo real para el vendedor; no presenta acciones administrativas.
import { useState } from 'react'
import { Alert, Button, Container, Table } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { useRecursoApi } from '../hooks/useRecursoApi'
import formatearPrecio from '../utils/formatearPrecio'

export default function CatalogoGestion() {
  const { id } = useParams()
  const [revision, setRevision] = useState(0)
  const { datos, error } = useRecursoApi(id ? `catalogo/planes/${encodeURIComponent(id)}` : 'catalogo/planes', revision, id ? 'detalle' : 'lista')
  return <main className="py-5"><Container><h1>{id ? 'Detalle del catálogo' : 'Catálogo'}</h1>
    {error && <Alert variant="danger">{error}<Button className="ms-3" variant="outline-danger" onClick={() => setRevision(v => v + 1)}>Reintentar</Button></Alert>}
    {!datos && !error && <p role="status">Cargando catálogo…</p>}
    {id && datos && <><h2>{datos.nombre}</h2><p>{datos.descripcion}</p><p>{formatearPrecio(datos.precio)}</p><p>{datos.activo ? 'Disponible' : 'No disponible'}</p><Link to="/gestion/catalogo">Volver al catálogo</Link></>}
    {!id && Array.isArray(datos) && <Table responsive><thead><tr><th>Artículo</th><th>Precio</th><th>Detalle</th></tr></thead><tbody>{datos.map(p => <tr key={p.id}><td>{p.nombre}</td><td>{formatearPrecio(p.precio)}</td><td><Link to={`/gestion/catalogo/${p.id}`}>Ver detalle</Link></td></tr>)}{datos.length === 0 && <tr><td colSpan={3}>No hay artículos publicados.</td></tr>}</tbody></Table>}
  </Container></main>
}
