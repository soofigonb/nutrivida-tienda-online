// Pie de página compartido por las páginas de NutriVida.
function Footer() {
  return (
    <footer className="footer-nutrivida">
      <div className="container">
        {/* Enlaces originales de las redes sociales */}
        <div className="footer-redes">
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir Instagram"
          >
            <i className="bi bi-instagram" aria-hidden="true" />
          </a>

          <a
            href="https://wa.me/56912345678"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir WhatsApp"
          >
            <i className="bi bi-whatsapp" aria-hidden="true" />
          </a>

          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir Facebook"
          >
            <i className="bi bi-facebook" aria-hidden="true" />
          </a>

          <a
            href="https://www.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir YouTube"
          >
            <i className="bi bi-youtube" aria-hidden="true" />
          </a>
        </div>

        {/* Derechos reservados */}
        <p className="footer-derechos">
          Clínica Nutricional NutriVida. Todos los derechos reservados.
        </p>

        {/* Datos de contacto */}
        <address className="footer-datos">
          <span>Calle Manuel Montt 850, Temuco, Chile</span>

          <a href="tel:+56912345678">
            +56 9 1234 5678
          </a>

          <a href="mailto:contacto@nutrividaclinica.cl">
            contacto@nutrividaclinica.cl
          </a>
        </address>
      </div>
    </footer>
  )
}

export default Footer