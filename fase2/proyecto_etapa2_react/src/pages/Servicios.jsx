import {
  Alert,
  Card,
  Col,
  Container,
  Form,
  Row,
} from 'react-bootstrap'
import {
  Link,
  useSearchParams,
} from 'react-router-dom'

import planes from '../data/planes.js'
import { TarjetaServicio } from '../components/PlanesServicios.jsx'

const categorias = [
  ...new Set(planes.map((plan) => plan.categoria)),
]

function Servicios() {
  const [parametros, setParametros] = useSearchParams()

  const categoria = parametros.get('categoria') || ''

  const categoriaInvalida =
    categoria !== '' && !categorias.includes(categoria)

  const planesFiltrados = categoria
    ? planes.filter((plan) => plan.categoria === categoria)
    : planes

  function cambiarCategoria(event) {
    const siguiente = new URLSearchParams(parametros)
    const valor = event.target.value

    if (valor) {
      siguiente.set('categoria', valor)
    } else {
      siguiente.delete('categoria')
    }

    setParametros(siguiente)
  }

  return (
    <main className="pagina-gestion">
      <Container>
        <div className="seccion-encabezado">
          <p className="seccion-etiqueta">
            Atención para cada objetivo
          </p>

          <h1 className="seccion-titulo">
            Categorías de servicios
          </h1>

          <p className="seccion-descripcion">
            Explora nuestros planes de evaluación inicial,
            atención integral y nutrición deportiva.
          </p>
        </div>

        <Card className="gestion-tarjeta mb-4">
          <Card.Body className="gestion-tarjeta-cuerpo">
            <Row className="g-3 align-items-end">
              <Col xs={12} md={7} lg={6}>
                <Form.Group controlId="filtro-categoria">
                  <Form.Label>
                    Filtrar por categoría
                  </Form.Label>

                  <Form.Select
                    value={categoria}
                    onChange={cambiarCategoria}
                  >
                    <option value="">
                      Todas las categorías
                    </option>

                    {categoriaInvalida && (
                      <option value={categoria} disabled>
                        Categoría no disponible
                      </option>
                    )}

                    {categorias.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={5} lg={6}>
                <p
                  className="gestion-ayuda mb-0"
                  role="status"
                >
                  Servicios encontrados: {planesFiltrados.length}
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {planesFiltrados.length > 0 ? (
          <div className="servicios-grid">
            {planesFiltrados.map((plan) => (
              <TarjetaServicio key={plan.id} plan={plan} />
            ))}
          </div>
        ) : (
          <Alert variant="info">
            <p>
              No hay servicios disponibles para esta categoría.
            </p>

            <Link
              to="/servicios"
              className="btn btn-outline-success"
            >
              Ver todos los servicios
            </Link>
          </Alert>
        )}

        <div className="gestion-botones mt-4">
          <Link
            to="/ofertas"
            className="btn btn-success"
          >
            Ver ofertas
          </Link>

          <Link
            to="/"
            className="btn btn-outline-success"
          >
            Volver al inicio
          </Link>
        </div>
      </Container>
    </main>
  )
}

export default Servicios