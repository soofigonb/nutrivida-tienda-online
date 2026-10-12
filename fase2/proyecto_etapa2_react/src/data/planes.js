import imagenConsulta from '../assets/blog1.png'
import imagenIntegral from '../assets/blog2.png'
import imagenDeportiva from '../assets/nutricion-deportiva.png'

const planes = [
  {
    id: 'consulta-inicial',
    nombre: 'Evaluación y consulta inicial',
    descripcion:
      'Evaluación antropométrica, diagnóstico nutricional y pauta de alimentación personalizada.',
    precio: 35000,
    etiqueta: 'Presencial u online',
    imagen: imagenConsulta,
    textoAlternativo: 'Evaluación nutricional inicial',
  },
  {
    id: 'plan-integral',
    nombre: 'Plan nutricional integral',
    descripcion:
      'Incluye dos controles mensuales, ajuste de minuta, seguimiento y guía de compras.',
    precio: 60000,
    etiqueta: 'Plan mensual',
    imagen: imagenIntegral,
    textoAlternativo: 'Plan nutricional mensual',
  },
  {
    id: 'nutricion-deportiva',
    nombre: 'Plan de nutrición deportiva',
    descripcion:
      'Estrategias de alimentación, suplementación personalizada y análisis del rendimiento.',
    precio: 50000,
    etiqueta: 'Deporte y rendimiento',
    imagen: imagenDeportiva,
    textoAlternativo: 'Plan de nutrición deportiva',
  },
]

export default planes