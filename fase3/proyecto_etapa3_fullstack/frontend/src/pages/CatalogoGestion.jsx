import { useContext, useState } from 'react'
import { Alert, Button, Container, Form, Table } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useRecursoApi } from '../hooks/useRecursoApi'
import { api } from '../services/api'
import formatearPrecio from '../utils/formatearPrecio'

function EditarProducto({ producto, alGuardar }) {
  const { datos: categorias, error: errorCategorias } = useRecursoApi('catalogo/categorias', 0, 'lista')
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const navigate = useNavigate()

  async function guardar(evento) {
    evento.preventDefault()
    const campos = Object.fromEntries(new FormData(evento.currentTarget))
    setOcupado(true)
    setError('')
    try {
      const ruta = producto ? `catalogo/${producto.id}` : 'catalogo'
      await api.solicitar(ruta, {
        method: producto ? 'PUT' : 'POST',
        body: { ...campos, precio: Number(campos.precio), stock: Number(campos.stock) },
      })
      alGuardar()
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setOcupado(false)
    }
  }

  async function darDeBaja() {
    if (!window.confirm(`¿Dar de baja «${producto.nombre}»?`)) return
    setOcupado(true)
    setError('')
    try {
      await api.solicitar(`catalogo/${producto.id}`, { method: 'DELETE' })
      navigate('/gestion/catalogo')
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setOcupado(false)
    }
  }

  return <Form className="my-4" onSubmit={guardar}>
    <h2>{producto ? 'Editar producto' : 'Nuevo producto'}</h2>
    {(error || errorCategorias) && <Alert variant="danger">{error || errorCategorias}</Alert>}
    <Form.Group controlId="producto-nombre">
      <Form.Label>Nombre</Form.Label>
      <Form.Control name="nombre" defaultValue={producto?.nombre} minLength={3} maxLength={100} required />
    </Form.Group>
    <Form.Group controlId="producto-descripcion">
      <Form.Label>Descripción</Form.Label>
      <Form.Control name="descripcion" as="textarea" defaultValue={producto?.descripcion} maxLength={500} />
    </Form.Group>
    <Form.Group controlId="producto-precio">
      <Form.Label>Precio en CLP</Form.Label>
      <Form.Control name="precio" type="number" min="1" max="99999999" step="1" defaultValue={producto?.precio} required />
    </Form.Group>
    <Form.Group controlId="producto-stock">
      <Form.Label>Stock</Form.Label>
      <Form.Control name="stock" type="number" min="0" max="2147483647" step="1" defaultValue={producto?.stock} required />
    </Form.Group>
    <Form.Group controlId="producto-imagen">
      <Form.Label>URL de la imagen</Form.Label>
      <Form.Control name="imagenUrl" defaultValue={producto?.imagenUrl} maxLength={255} />
    </Form.Group>
    <Form.Group controlId="producto-categoria">
      <Form.Label>Categoría</Form.Label>
      {categorias && <Form.Select name="idCategoria" defaultValue={producto?.idCategoria || ''} required>
        <option value="">Selecciona una categoría</option>
        {categorias.filter(categoria => categoria.activo).map(categoria => (
          <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
        ))}
      </Form.Select>}
    </Form.Group>
    <Button className="mt-3" type="submit" disabled={ocupado || !categorias?.length}>Guardar producto</Button>
    {producto && <Button className="mt-3 ms-2" variant="outline-danger" disabled={ocupado} onClick={darDeBaja}>Dar de baja</Button>}
  </Form>
}

export default function CatalogoGestion() {
  const { id } = useParams()
  const { usuario } = useContext(AuthContext)
  const [revision, setRevision] = useState(0)
  const actualizar = () => setRevision(v => v + 1)
  const { datos, error } = useRecursoApi(id ? `catalogo/${encodeURIComponent(id)}` : 'catalogo', revision, id ? 'detalle' : 'lista')
  return <main className="py-5"><Container><h1>{id ? 'Detalle del catálogo' : 'Catálogo'}</h1>
    {error && <Alert variant="danger">{error}<Button className="ms-3" variant="outline-danger" onClick={() => setRevision(v => v + 1)}>Reintentar</Button></Alert>}
    {!datos && !error && <p role="status">Cargando catálogo…</p>}
    {id && datos && <>
      <h2>{datos.nombre}</h2>
      <p>{datos.descripcion}</p>
      <p>{formatearPrecio(datos.precio)}</p>
      <p>{datos.activo && datos.stock > 0 ? 'Disponible' : 'No disponible'}</p>
      <Link to="/gestion/catalogo">Volver al catálogo</Link>
    </>}
    {!id && Array.isArray(datos) && <Table responsive><thead><tr><th>Artículo</th><th>Precio</th><th>Detalle</th></tr></thead><tbody>{datos.map(p => <tr key={p.id}><td>{p.nombre}</td><td>{formatearPrecio(p.precio)}</td><td><Link to={`/gestion/catalogo/${p.id}`}>Ver detalle</Link></td></tr>)}{datos.length === 0 && <tr><td colSpan={3}>No hay artículos publicados.</td></tr>}</tbody></Table>}
    {usuario?.rol === 'ADMINISTRADOR' && datos && <EditarProducto key={`${id ?? 'nuevo'}:${revision}`} producto={id ? datos : null} alGuardar={actualizar} />}
  </Container></main>
}
