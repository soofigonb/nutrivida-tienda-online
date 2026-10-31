import { useEffect } from 'react'
import { Link } from 'react-router-dom'

function ArticuloBlog({ blog }) {
  // Al abrir un artículo, mostrarlo desde el comienzo.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [blog.id])

  return (
    <main className="blog-detalle-main">
      <div className="container">
        <div className="blog-detalle-navegacion">
          <a href="/#blogs" className="blog-enlace">
            <i className="bi bi-arrow-left me-2" aria-hidden="true" />
            Volver a blogs
          </a>
        </div>

        <article className="blog-detalle-articulo">
          {/* Encabezado del artículo */}
          <header className="blog-detalle-encabezado">
            <span className="blog-etiqueta">{blog.etiqueta}</span>

            <h1 className="blog-detalle-titulo">{blog.titulo}</h1>

            <div className="blog-detalle-informacion">
              <span>
                <i className="bi bi-person-circle me-2" aria-hidden="true" />
                {blog.autor}
              </span>

              <span>
                <i className="bi bi-calendar3 me-2" aria-hidden="true" />
                {blog.fecha}
              </span>

              <span>
                <i className="bi bi-clock me-2" aria-hidden="true" />
                {blog.tiempoLectura}
              </span>
            </div>
          </header>

          {/* Imagen principal */}
          <figure className="blog-detalle-figura">
            <img
              src={blog.imagen}
              alt={blog.textoAlternativo}
              className="blog-detalle-imagen"
            />

            <figcaption>{blog.pieImagen}</figcaption>
          </figure>

          {/* Introducción y contenido */}
          <p className="blog-detalle-introduccion">
            {blog.introduccion}
          </p>

          {blog.secciones.map((seccion) => (
            <section
              key={seccion.titulo}
              className="blog-detalle-seccion"
            >
              <h2>{seccion.titulo}</h2>

              {seccion.texto && <p>{seccion.texto}</p>}

              {seccion.lista && (
                <ul className="blog-detalle-lista">
                  {seccion.lista.map((elemento) => (
                    <li key={elemento.titulo}>
                      <strong>{elemento.titulo}</strong>{' '}
                      {elemento.texto}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {/* Consejo destacado */}
          <aside className="blog-detalle-consejo">
            <i
              className={`bi ${blog.iconoConsejo} blog-consejo-icono`}
              aria-hidden="true"
            />

            <div>
              <h2>Consejo NutriVida</h2>
              <p>{blog.consejo}</p>
            </div>
          </aside>

          {/* Enlace para agendar */}
          <div className="blog-detalle-accion">
            <p>{blog.preguntaFinal}</p>

            <Link to="/agendar" className="inicio-boton-principal">
              Agendar una consulta
            </Link>
          </div>
        </article>
      </div>
    </main>
  )
}

export default ArticuloBlog