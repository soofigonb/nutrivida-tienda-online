function Nosotros() {
  return (
    <section id="nosotros" className="nosotros-seccion">
      <div className="container">
        <div className="seccion-encabezado">
          <p className="seccion-etiqueta">Conócenos</p>

          <h2 className="seccion-titulo">Sobre nosotros</h2>

          <p className="seccion-descripcion">
            Promovemos una alimentación saludable mediante una atención
            profesional, cercana y personalizada.
          </p>
        </div>

        <div className="row g-4">
          <div className="col-12 col-md-6">
            <article className="nosotros-tarjeta">
              <div className="nosotros-icono">
                <i className="bi bi-heart-pulse" aria-hidden="true" />
              </div>

              <h3>Nuestra historia</h3>

              <p>
                Clínica Nutricional NutriVida nació en 2016 en Temuco
                con el objetivo de promover hábitos saludables y prevenir
                enfermedades mediante la alimentación.
              </p>
            </article>
          </div>

          <div className="col-12 col-md-6">
            <article className="nosotros-tarjeta">
              <div className="nosotros-icono">
                <i className="bi bi-bullseye" aria-hidden="true" />
              </div>

              <h3>Nuestra misión</h3>

              <p>
                Guiar a nuestros pacientes en la construcción de hábitos
                saludables y sostenibles mediante planes personalizados,
                respaldo científico y acompañamiento profesional.
              </p>
            </article>
          </div>

          <div className="col-12 col-md-6">
            <article className="nosotros-tarjeta">
              <div className="nosotros-icono">
                <i className="bi bi-people" aria-hidden="true" />
              </div>

              <h3>Nuestro equipo</h3>

              <p>
                Contamos con profesionales especializados en nutrición
                clínica, deportiva, enfermedades metabólicas y
                alimentación basada en plantas.
              </p>
            </article>
          </div>

          <div className="col-12 col-md-6">
            <article className="nosotros-tarjeta">
              <div className="nosotros-icono">
                <i
                  className="bi bi-clipboard2-heart"
                  aria-hidden="true"
                />
              </div>

              <h3>Áreas de atención</h3>

              <ul className="nosotros-lista">
                <li>Pérdida de peso y reeducación alimentaria.</li>
                <li>Control de diabetes e hipertensión.</li>
                <li>Nutrición deportiva.</li>
                <li>Alimentación vegetariana y vegana.</li>
              </ul>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Nosotros