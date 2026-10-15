import { Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import { useDatos } from '../context/DatosContext'
import { leerDatos } from '../utils/storage'

function AdminHome() {
  // ========================================
  // 1. DATOS DEL RESUMEN
  // ========================================

  const { pacientes, nutricionistas } = useDatos()

  const ahora = new Date()

  const hoy = [
    ahora.getFullYear(),
    String(ahora.getMonth() + 1).padStart(2, '0'),
    String(ahora.getDate()).padStart(2, '0'),
  ].join('-')

  const guardadas = leerDatos(
    'citasNutriVida',
    [],
  )

  const citasHoy = Array.isArray(guardadas)
    ? guardadas.filter(
        (cita) =>
          cita &&
          cita.fecha === hoy &&
          cita.estado !== 'cancelada',
      ).length
    : 0

  const resumen = [
    {
      titulo: 'Pacientes registrados',
      cantidad: pacientes.length,
      icono: 'bi-people',
      clase: 'pacientes',
    },
    {
      titulo: 'Nutricionistas activos',
      cantidad: nutricionistas.length,
      icono: 'bi-person-badge',
      clase: 'nutricionistas',
    },
    {
      titulo: 'Citas agendadas hoy',
      cantidad: citasHoy,
      icono: 'bi-calendar-check',
      clase: 'citas',
    },
  ]

  const accesos = [
    {
      titulo: 'Gestionar pacientes',
      texto:
        'Revisa el listado, registra nuevos pacientes o modifica sus datos.',
      ruta: '/admin/pacientes',
      enlace: 'Ver pacientes',
      icono: 'bi-person-plus',
    },
    {
      titulo: 'Gestionar nutricionistas',
      texto:
        'Consulta el equipo profesional, agrega nutricionistas o edita sus datos.',
      ruta: '/admin/nutricionistas',
      enlace: 'Ver nutricionistas',
      icono: 'bi-person-vcard',
    },
  ]

  return (
    <section aria-label="Resumen general">
      {/* ========================================
          2. TARJETAS DE ESTADÍSTICAS
          ======================================== */}

      <Row className="g-4">
        {resumen.map((item) => (
          <Col xs={12} md={4} key={item.clase}>
            <article className="admin-stat-card">
              <div
                className={`admin-stat-icono admin-icono-${item.clase}`}
              >
                <i
                  className={`bi ${item.icono}`}
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2 className="admin-stat-label">
                  {item.titulo}
                </h2>

                <p className="admin-stat-number">
                  {item.cantidad}
                </p>
              </div>
            </article>
          </Col>
        ))}
      </Row>

      {/* ========================================
          3. ACCESOS RÁPIDOS
          ======================================== */}

      <section
        className="admin-accesos"
        aria-labelledby="admin-accesos-titulo"
      >
        <div className="admin-seccion-encabezado">
          <div>
            <p className="admin-bienvenida">
              Gestión
            </p>

            <h2 id="admin-accesos-titulo">
              Accesos rápidos
            </h2>
          </div>

          <i
            className="bi bi-lightning-charge"
            aria-hidden="true"
          />
        </div>

        <Row className="g-4">
          {accesos.map((item) => (
            <Col xs={12} lg={6} key={item.ruta}>
              <article className="admin-acceso-card">
                <div className="admin-acceso-icono">
                  <i
                    className={`bi ${item.icono}`}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h3>{item.titulo}</h3>

                  <p>{item.texto}</p>

                  <Link
                    to={item.ruta}
                    className="admin-acceso-boton"
                  >
                    {item.enlace}

                    <i
                      className="bi bi-arrow-right ms-2"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </article>
            </Col>
          ))}
        </Row>
      </section>
    </section>
  )
}

export default AdminHome