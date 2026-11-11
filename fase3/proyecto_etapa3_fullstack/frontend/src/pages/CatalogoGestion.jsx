import { useContext, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Form, Row } from 'react-bootstrap'
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

  const categoriasActivas = categorias?.filter(categoria => categoria.activo) ?? []

  return <Card id="formulario-producto" className="gestion-tarjeta mt-4">
    <Card.Body className="admin-panel-cuerpo">
      <div className="d-flex gap-3 align-items-start mb-4">
        <span className="admin-listado-icono"><i className="bi bi-pencil-square" aria-hidden="true" /></span>
        <div>
          <h2 className="gestion-subtitulo mb-1">{producto ? 'Editar producto' : 'Nuevo producto'}</h2>
          <p className="gestion-ayuda mb-0">Completa la ficha, el precio y el stock del producto.</p>
        </div>
      </div>
      {(error || errorCategorias) && <Alert variant="danger">{error || errorCategorias}</Alert>}
      <Form onSubmit={guardar}>
        <Row className="g-3">
          <Form.Group as={Col} xs={12} md={7} controlId="producto-nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control name="nombre" defaultValue={producto?.nombre} minLength={3} maxLength={100} required />
          </Form.Group>
          <Form.Group as={Col} xs={12} md={5} controlId="producto-categoria">
            <Form.Label>Categoría</Form.Label>
            <Form.Select key={Boolean(categorias)} name="idCategoria" defaultValue={producto?.idCategoria || ''} disabled={!categoriasActivas.length} required>
              <option value="">{categoriasActivas.length ? 'Selecciona una categoría' : categorias ? 'Sin categorías activas' : 'Cargando categorías…'}</option>
              {categoriasActivas.map(categoria => (
                <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group as={Col} xs={12} controlId="producto-descripcion">
            <Form.Label>Descripción</Form.Label>
            <Form.Control name="descripcion" as="textarea" defaultValue={producto?.descripcion} maxLength={500} />
          </Form.Group>
          <Form.Group as={Col} xs={12} sm={6} controlId="producto-precio">
            <Form.Label>Precio en CLP</Form.Label>
            <Form.Control name="precio" type="number" min="1" max="99999999" step="1" defaultValue={producto?.precio} required />
          </Form.Group>
          <Form.Group as={Col} xs={12} sm={6} controlId="producto-stock">
            <Form.Label>Stock</Form.Label>
            <Form.Control name="stock" type="number" min="0" max="2147483647" step="1" defaultValue={producto?.stock} required />
          </Form.Group>
          <Form.Group as={Col} xs={12} controlId="producto-imagen">
            <Form.Label>URL de la imagen <span className="gestion-ayuda fw-normal">(opcional)</span></Form.Label>
            <Form.Control name="imagenUrl" defaultValue={producto?.imagenUrl} maxLength={255} />
          </Form.Group>
        </Row>
        <div className="d-flex flex-wrap gap-2 mt-4 pt-3 border-top">
          <Button variant="success" type="submit" disabled={ocupado || !categoriasActivas.length}>Guardar producto</Button>
          {producto && <Button variant="outline-success" disabled={ocupado} onClick={darDeBaja}>Dar de baja</Button>}
        </div>
      </Form>
    </Card.Body>
  </Card>
}

export default function CatalogoGestion() {
  const { id } = useParams()
  const { usuario } = useContext(AuthContext)
  const [revision, setRevision] = useState(0)
  const actualizar = () => setRevision(v => v + 1)
  const { datos, error } = useRecursoApi(id ? `catalogo/${encodeURIComponent(id)}` : 'catalogo', revision, id ? 'detalle' : 'lista')
  const puedeEditar = usuario?.rol === 'ADMINISTRADOR'
  return <section className="pagina-gestion pagina-gestion-panel">
    <header className="admin-topbar">
      <div>
        <p className="admin-bienvenida">Gestión de productos</p>
        <h1 className="seccion-titulo">{id ? 'Detalle del catálogo' : 'Catálogo'}</h1>
        <p className="admin-descripcion">Consulta los artículos, sus precios y su disponibilidad.</p>
      </div>
      {!id && puedeEditar && datos && (
        <a href="#formulario-producto" className="admin-btn-nuevo">
          <i className="bi bi-plus-lg" aria-hidden="true" /> Nuevo producto
        </a>
      )}
    </header>
    {error && <Alert variant="danger">{error}<Button className="ms-3" variant="outline-success" onClick={() => setRevision(v => v + 1)}>Reintentar</Button></Alert>}
    {!datos && !error && <p role="status">Cargando catálogo…</p>}
    {id && datos && <Card className="gestion-tarjeta">
      <Card.Body className="admin-panel-cuerpo">
        <div className="d-flex flex-wrap gap-3 justify-content-between align-items-start">
          <h2 className="gestion-subtitulo">{datos.nombre}</h2>
          {datos.activo && datos.stock > 0
            ? <Badge bg="success" pill>Disponible</Badge>
            : <Badge bg="secondary" pill>No disponible</Badge>}
        </div>
        {datos.descripcion && <p className="gestion-ayuda">{datos.descripcion}</p>}
        <p className="catalogo-panel-precio">{formatearPrecio(datos.precio)}</p>
        <Button as={Link} variant="outline-success" to="/gestion/catalogo">Volver al catálogo</Button>
      </Card.Body>
    </Card>}
    {!id && Array.isArray(datos) && <>
      <h2 className="gestion-subtitulo mb-3">Artículos publicados</h2>
      {datos.length === 0 && <Card body className="gestion-tarjeta">No hay artículos publicados.</Card>}
      <Row className="g-3">
        {datos.map(producto => (
          <Col key={producto.id} xs={12} md={6} xl={4}>
            <Card className="gestion-tarjeta h-100">
              <Card.Body className="admin-panel-cuerpo d-flex flex-column align-items-start">
                <span className="admin-listado-icono mb-3"><i className="bi bi-box-seam" aria-hidden="true" /></span>
                <h3 className="gestion-subtitulo">{producto.nombre}</h3>
                <p className="catalogo-panel-precio">{formatearPrecio(producto.precio)}</p>
                <Button as={Link} className="mt-auto" size="sm" variant="outline-success" to={`/gestion/catalogo/${producto.id}`}>Ver detalle</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>}
    {puedeEditar && datos && <EditarProducto key={`${id ?? 'nuevo'}:${revision}`} producto={id ? datos : null} alGuardar={actualizar} />}
  </section>
}
