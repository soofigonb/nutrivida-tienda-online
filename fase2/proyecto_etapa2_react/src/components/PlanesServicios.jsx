import { useState } from 'react'
import { Link } from 'react-router-dom'
import planes from '../data/planes.js'
import formatearPrecio from '../utils/formatearPrecio.js'

// Tarjeta reutilizable de un servicio.
function TarjetaServicio({ plan }) {
  return (
    <article className="servicio-tarjeta">
      <img
        src={plan.imagen}
        alt={plan.textoAlternativo}
        className="servicio-imagen"
        loading="lazy"
      />

      <div className="servicio-contenido">
        <span className="servicio-etiqueta">
          {plan.etiqueta}
        </span>

        <h3>{plan.nombre}</h3>

        <p className="servicio-descripcion">
          {plan.descripcion}
        </p>

        <p className="servicio-precio">
          {formatearPrecio(plan.precio)}
        </p>

        <Link
          to={`/agendar?plan=${plan.id}`}
          className="servicio-boton"
        >
          Agendar servicio
        </Link>
      </div>
    </article>
  )
}

// Sección de servicios y promoción.
function PlanesServicios() {
  const [mostrarPromocion, setMostrarPromocion] = useState(false)

  return (
    <section id="servicios" className="servicios-seccion">
      <div className="container">
        <div className="servicios-encabezado">
          <div>
            <p className="seccion-etiqueta">Elige tu atención</p>

            <h2 className="seccion-titulo">Planes y servicios</h2>
          </div>

          <button
            type="button"
            className="promocion-boton"
            onClick={() => setMostrarPromocion((actual) => !actual)}
            aria-expanded={mostrarPromocion}
            aria-controls="promocion-servicios"
          >
            {mostrarPromocion
              ? 'Ocultar promoción'
              : 'Mostrar promoción'}
          </button>
        </div>

        <div id="promocion-servicios" aria-live="polite">
          {mostrarPromocion && (
            <p className="promocion-mensaje">
              <strong>Beneficio en tu primera consulta:</strong>{' '}
              Durante este mes, al agendar tu primera consulta online,
              recibirás una medición de composición corporal sin costo
              adicional.
            </p>
          )}
        </div>

        <div className="servicios-grid">
          {planes.map((plan) => (
            <TarjetaServicio key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default PlanesServicios