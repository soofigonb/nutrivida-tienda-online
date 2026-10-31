function Nosotros() {
  return (
    <section id="nosotros" className="nosotros-seccion">
      <div className="container">
        {/* ========================================
            1. ENCABEZADO
            ======================================== */}

        <div className="seccion-encabezado">
          <p className="seccion-etiqueta">Conócenos</p>

          <h2 className="seccion-titulo">Sobre nosotros</h2>

          <p className="seccion-descripcion">
            Promovemos una alimentación saludable mediante una atención
            profesional, cercana y personalizada.
          </p>
        </div>

        {/* ========================================
            2. INFORMACIÓN DE LA CLÍNICA
            ======================================== */}

        <div className="row g-4">
          <div className="col-12 col-md-6">
            <article className="nosotros-tarjeta">
              <div className="nosotros-icono">
                <i
                  className="bi bi-heart-pulse"
                  aria-hidden="true"
                />
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
                <i
                  className="bi bi-bullseye"
                  aria-hidden="true"
                />
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
                <i
                  className="bi bi-people"
                  aria-hidden="true"
                />
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

        {/* ========================================
            3. VIDEO EDUCATIVO
            ======================================== */}

        <div className="row justify-content-center mt-5">
          <div className="col-12 col-lg-10">
            <article
              className="nosotros-tarjeta nosotros-video"
              aria-labelledby="nosotros-video-titulo"
            >
              <div className="nosotros-icono mx-auto">
                <i
                  className="bi bi-play-circle"
                  aria-hidden="true"
                />
              </div>

              <h3 id="nosotros-video-titulo">
                Alimentación saludable para tu día a día
              </h3>

              <p className="nosotros-video-descripcion">
                Conoce consejos prácticos para elegir alimentos
                nutritivos y adoptar hábitos saludables.
              </p>

              <div className="ratio ratio-16x9 nosotros-video-reproductor">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/NmJkp-nRjms"
                  title="Alimentación saludable y elección de alimentos nutritivos de bajo costo — OPS/OMS"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              <p className="nosotros-video-fuente">
                Fuente: Organización Panamericana de la Salud
                (OPS/OMS), canal PAHO TV.
              </p>

              <a
                href="https://www.youtube.com/watch?v=NmJkp-nRjms"
                target="_blank"
                rel="noopener noreferrer"
                className="nosotros-video-enlace"
              >
                Ver video en YouTube
                <i
                  className="bi bi-box-arrow-up-right ms-2"
                  aria-hidden="true"
                />
              </a>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Nosotros