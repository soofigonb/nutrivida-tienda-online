import fotos from '../data/nutricionistas'
import { api } from './api.js'

function aNutricionista(datos) {
  const foto = fotos.find(item => `nutricionista-${item.id}` === datos.imagenUrl)?.foto
  return {
    id: datos.profesionalId,
    nombre: datos.nombre,
    especialidad: datos.especialidad,
    experiencia: datos.descripcion || `${datos.experiencia} años de experiencia`,
    aniosExperiencia: datos.experiencia,
    modalidad: datos.modalidad === 'Mixta' ? 'Presencial y online' : datos.modalidad,
    foto: foto || datos.imagenUrl || fotos[0].foto,
  }
}

export async function listarProfesionales() {
  const profesionales = await api.solicitar('profesionales', { publica: true })
  return profesionales.map(aNutricionista)
}

export async function guardarProfesional(datos, id, anterior) {
  const foto = fotos.find(item => item.foto === datos.foto)
  const profesional = await api.solicitar(id ? `profesionales/${id}` : 'profesionales', {
    method: id ? 'PUT' : 'POST',
    body: {
      nombre: datos.nombre,
      especialidad: datos.especialidad,
      experiencia: anterior?.aniosExperiencia ?? 0,
      descripcion: datos.experiencia,
      modalidad: datos.modalidad === 'Presencial y online' ? 'Mixta' : datos.modalidad,
      imagenUrl: foto ? `nutricionista-${foto.id}` : null,
    },
  })
  return aNutricionista(profesional)
}

export function darDeBajaProfesional(id) {
  return api.solicitar(`profesionales/${id}`, { method: 'DELETE' })
}
