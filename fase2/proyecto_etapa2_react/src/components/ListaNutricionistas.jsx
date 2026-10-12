import { useState } from 'react'
import nutricionistas from '../data/nutricionistas.js'

// Tarjeta reutilizable: recibe los datos mediante props.
function TarjetaNutricionista({ nutricionista, onVerDetalle }) {
  return (
    <article className="nutricionista-tarjeta">
      <img
        src={nutricionista.foto}
        alt={nutricionista.nombre}
        className="nutricionista-foto"
        loading="lazy"
      />

      <span className="nutricionista-modalidad">
        {nutricionista.modalidad}
      </span>

      <h3>{nutricionista.nombre}</h3>

      <p className="nutricionista-especialidad">
        {nutricionista.especialidad}
      </p>

      <p className="nutricionista-experiencia">
        {nutricionista.experiencia}
      </p>

      <button
        type="button"
        className="nutricionista-boton"
        onClick={() => onVerDetalle(nutricionista)}
        aria-controls="detalle-nutricionista"
      >
        Ver detalle
      </button>
    </article>
  )
}

// Sección que muestra las tarjetas y el detalle seleccionado.
function ListaNutricionistas() {
  const [seleccionado, setSeleccionado] = useState(null)

  return (
    <section id="nutricionistas" className="nutricionistas-seccion">
      <div className="container">
        <div className="seccion-encabezado">
          <p className="seccion-etiqueta">Nuestro equipo</p>

          <h2 className="seccion-titulo">Nuestros nutricionistas</h2>

          <p className="seccion-descripcion">
            Encuentra al profesional adecuado según tus objetivos y
            necesidades nutricionales.
          </p>
        </div>

        <div className="nutricionistas-grid">
          {nutricionistas.map((nutricionista) => (
            <TarjetaNutricionista
              key={nutricionista.id}
              nutricionista={nutricionista}
              onVerDetalle={setSeleccionado}
            />
          ))}
        </div>

        <div
          id="detalle-nutricionista"
          className="nutricionista-detalle"
          aria-live="polite"
          aria-atomic="true"
        >
          {seleccionado && (
            <div className="alert alert-success position-relative">
              <button
                type="button"
                className="btn-close position-absolute top-0 end-0 m-3"
                aria-label="Cerrar detalle"
                onClick={() => setSeleccionado(null)}
              />

              <h3 className="h4 alert-heading pe-4">
                {seleccionado.nombre}
              </h3>

              <p>
                <strong>Especialidad:</strong>{' '}
                {seleccionado.especialidad}
              </p>

              <p>
                <strong>Modalidad:</strong>{' '}
                {seleccionado.modalidad}
              </p>

              <hr />

              <p className="mb-0">{seleccionado.experiencia}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ListaNutricionistas