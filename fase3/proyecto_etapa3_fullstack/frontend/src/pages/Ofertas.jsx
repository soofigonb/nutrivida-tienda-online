import {
  Badge,
  Card,
  Col,
  Container,
  Row,
} from 'react-bootstrap'
import { Link } from 'react-router-dom'

import planes, {
  promocionPrimeraConsulta,
} from '../data/planes.js'
import formatearPrecio from '../utils/formatearPrecio.js'

function Ofertas() {
  const promocion = promocionPrimeraConsulta

  const plan = planes.find(
    (item) => item.id === promocion.planId,
  )

  return (
    <main className="pagina-gestion">
      <Container>
        <div className="seccion-encabezado">
          <p className="seccion-etiqueta">
            Beneficios NutriVida
          </p>

          <h1 className="seccion-titulo">
            Ofertas y beneficios
          </h1>

          <p className="seccion-descripcion">
            Conoce nuestras promociones y revisa sus condiciones
            antes de reservar.
          </p>
        </div>

        <Row className="justify-content-center">
          <Col xs={12} lg={10}>
            {plan ? (
              <Card className="gestion-tarjeta">
                <Card.Body className="gestion-tarjeta-cuerpo">
                  <Badge bg="success" className="mb-3">
                    Primera consulta
                  </Badge>

                  <h2 className="gestion-subtitulo">
                    {promocion.titulo}
                  </h2>

                  <p className="gestion-ayuda mt-3">
                    {promocion.descripcion}
                  </p>

                  <div className="promocion-mensaje my-4">
                    <p className="fw-semibold mb-2">
                      Servicio incluido en la promoción
                    </p>

                    <h3 className="h5">
                      {plan.nombre}
                    </h3>

                    <p className="servicio-precio mb-2">
                      {formatearPrecio(plan.precio)}
                    </p>

                    <p className="mb-0">
                      La medición se incluye sin costo adicional
                      cuando se cumplen las condiciones del beneficio.
                    </p>
                  </div>

                  <h3 className="h5 mb-3">
                    Condiciones del beneficio
                  </h3>

                  <ul className="gestion-ayuda">
                    {promocion.condiciones.map((condicion) => (
                      <li key={condicion} className="mb-2">
                        {condicion}
                      </li>
                    ))}
                  </ul>

                  <div className="gestion-botones mt-4">
                    <Link
                      to={`/agendar?plan=${plan.id}`}
                      className="btn btn-success"
                    >
                      Agendar primera consulta
                    </Link>

                    <Link
                      to="/servicios"
                      className="btn btn-outline-success"
                    >
                      Explorar servicios
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <Card className="gestion-tarjeta">
                <Card.Body className="gestion-tarjeta-cuerpo">
                  <p role="status">
                    Actualmente no hay ofertas disponibles.
                  </p>

                  <Link
                    to="/servicios"
                    className="btn btn-outline-success"
                  >
                    Explorar servicios
                  </Link>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </main>
  )
}

export default Ofertas