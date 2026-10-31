import { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { useDatos } from '../context/DatosContext'

// ========================================
// 1. TARJETA REUTILIZABLE
// ========================================

function TarjetaNutricionista({
  nutricionista,
  onVerDetalle,
}) {
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
        aria-haspopup="dialog"
        aria-label={`Ver detalle de ${nutricionista.nombre}`}
      >
        Ver detalle
      </button>
    </article>
  )
}

// ========================================
// 2. LISTADO Y NUTRICIONISTA SELECCIONADO
// ========================================

function ListaNutricionistas() {
  const { nutricionistas } = useDatos()

  const [seleccionado, setSeleccionado] =
    useState(null)

  function cerrarDetalle() {
    setSeleccionado(null)
  }

  return (
    <section
      id="nutricionistas"
      className="nutricionistas-seccion"
    >
      <div className="container">
        {/* Encabezado */}
        <div className="seccion-encabezado">
          <p className="seccion-etiqueta">
            Nuestro equipo
          </p>

          <h2 className="seccion-titulo">
            Nuestros nutricionistas
          </h2>

          <p className="seccion-descripcion">
            Encuentra al profesional adecuado según tus
            objetivos y necesidades nutricionales.
          </p>
        </div>

        {/* Tarjetas */}
        <div className="nutricionistas-grid">
          {nutricionistas.map((nutricionista) => (
            <TarjetaNutricionista
              key={nutricionista.id}
              nutricionista={nutricionista}
              onVerDetalle={setSeleccionado}
            />
          ))}
        </div>
      </div>

      {/* ========================================
          3. DETALLE EN VENTANA MODAL
          ======================================== */}

      <Modal
        show={Boolean(seleccionado)}
        onHide={cerrarDetalle}
        centered
        scrollable
        aria-labelledby="titulo-detalle-nutricionista"
        aria-describedby="descripcion-detalle-nutricionista"
      >
        <Modal.Header
          closeButton
          closeLabel="Cerrar detalle"
        >
          <Modal.Title
            id="titulo-detalle-nutricionista"
            className="nutricionista-modal-titulo"
          >
            {seleccionado?.nombre}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {seleccionado && (
            <>
              <p>
                <strong>Especialidad:</strong>{' '}
                {seleccionado.especialidad}
              </p>

              <p>
                <strong>Modalidad:</strong>{' '}
                {seleccionado.modalidad}
              </p>

              <hr />

              <p
                id="descripcion-detalle-nutricionista"
                className="mb-0"
              >
                {seleccionado.experiencia}
              </p>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-success"
            onClick={cerrarDetalle}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  )
}

export default ListaNutricionistas