import { Link } from 'react-router-dom'
import blogs from '../data/blogs.js'

// Tarjeta reutilizable: recibe los datos del artículo.
function TarjetaBlog({ blog }) {
  return (
    <article className="blog-tarjeta">
      <img
        src={blog.imagen}
        alt={blog.textoAlternativo}
        className="blog-imagen"
        loading="lazy"
      />

      <div className="blog-contenido">
        <span className="blog-etiqueta">{blog.etiqueta}</span>

        <h3>{blog.tituloTarjeta}</h3>

        <p>{blog.descripcion}</p>

        <Link to={blog.ruta} className="blog-enlace">
          Leer artículo
          <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

// Sección de Blogs en la página de inicio.
function ListaBlogs() {
  return (
    <section id="blogs" className="blogs-seccion">
      <div className="container">
        <div className="seccion-encabezado">
          <p className="seccion-etiqueta">Contenido saludable</p>

          <h2 className="seccion-titulo">Blogs y consejos</h2>

          <p className="seccion-descripcion">
            Revisa nuestros consejos para incorporar hábitos saludables
            en tu vida diaria.
          </p>
        </div>

        <div className="blogs-grid">
          {blogs.map((blog) => (
            <TarjetaBlog key={blog.id} blog={blog} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ListaBlogs