import imagenConsulta from '../assets/blog1.png'
import imagenIntegral from '../assets/blog2.png'
import imagenDeportiva from '../assets/nutricion-deportiva.png'

const planes = [
  {
    id: 'consulta-inicial',
    nombre: 'Evaluación y consulta inicial',
    categoria: 'Evaluación inicial',
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
    categoria: 'Atención integral',
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
    categoria: 'Nutrición deportiva',
    descripcion:
      'Estrategias de alimentación, suplementación personalizada y análisis del rendimiento.',
    precio: 50000,
    etiqueta: 'Deporte y rendimiento',
    imagen: imagenDeportiva,
    textoAlternativo: 'Plan de nutrición deportiva',
  },
]

// Beneficio adicional: no modifica el precio del plan.
export const promocionPrimeraConsulta = {
  id: 'beneficio-primera-consulta',
  titulo: 'Beneficio en tu primera consulta',
  planId: 'consulta-inicial',
  descripcion:
    'Al reservar tu primera evaluación y consulta inicial a través del sitio, puedes acceder a una medición de composición corporal sin costo adicional.',
  condiciones: [
    'Disponible para pacientes que realizan su primera consulta.',
    'Aplica al servicio Evaluación y consulta inicial.',
    'La reserva debe realizarse a través del sitio web.',
    'La medición de composición corporal se realiza presencialmente en la clínica.',
    'El beneficio no modifica el precio del plan ni corresponde a un descuento monetario.',
  ],
}

export default planes