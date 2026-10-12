import { Link } from 'react-router-dom'
import heroImagen from '../assets/hero-nutrivida.png'

function Hero() {
  return (
    <section id="inicio" className="inicio-hero">
      <div className="container">
        <div className="row align-items-center g-4">
          <div className="col-12 col-lg-6">
            <div className="inicio-hero-contenido">
              <p className="inicio-etiqueta">
                Atención nutricional en Temuco
              </p>

              <h1 className="inicio-titulo">
                Un cambio de hábitos cambia tu vida
              </h1>

              <p className="inicio-descripcion">
                Atención personalizada en nutrición clínica, deportiva,
                metabólica y vegetariana. Más de 8 años acompañando la
                salud de nuestros pacientes en la Región de La Araucanía.
              </p>

              <div className="inicio-acciones">
                <a
                  className="inicio-boton-principal"
                  href="#nutricionistas"
                >
                  Ver nutricionistas
                </a>

                <Link
                  className="inicio-boton-secundario"
                  to="/agendar"
                >
                  Agendar una cita
                </Link>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="inicio-hero-imagen">
              <img
                src={heroImagen}
                alt="Atención nutricional personalizada en NutriVida"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero