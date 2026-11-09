import { api } from './api.js'

export function aPaciente(datos) {
  return {
    id: datos.pacienteId ?? datos.id,
    pacienteId: datos.pacienteId ?? datos.id,
    usuarioId: datos.usuarioId ?? null,
    nombre: datos.nombre,
    apellidos: datos.apellidos,
    run: datos.run || datos.rut,
    rut: datos.run || datos.rut,
    correo: datos.correo || '',
    telefono: datos.telefono || '',
    direccion: datos.direccion || '',
    fechaNacimiento: datos.fechaNacimiento || '',
    region: datos.region || '',
    comuna: datos.comuna || '',
    rol: 'CLIENTE',
  }
}

export async function listarPacientes() {
  if (typeof api.solicitar !== 'function') return null
  const respuesta = await api.solicitar('pacientes')
  if (!Array.isArray(respuesta)) return null
  // Verifica que los elementos correspondan a pacientes (con pacienteId o run)
  if (respuesta.length > 0 && !('pacienteId' in respuesta[0]) && !('run' in respuesta[0])) {
    return null
  }
  return respuesta.map(aPaciente)
}

export async function guardarPacienteRemoto(datos, id) {
  const paciente = await api.solicitar(id ? `pacientes/${id}` : 'pacientes', {
    method: id ? 'PUT' : 'POST',
    body: {
      nombre: datos.nombre,
      apellidos: datos.apellidos,
      run: datos.run,
      correo: datos.correo,
      telefono: datos.telefono,
      direccion: datos.direccion,
      fechaNacimiento: datos.fechaNacimiento || null,
      region: datos.region,
      comuna: datos.comuna,
    },
  })
  return aPaciente({ ...datos, ...paciente, pacienteId: paciente?.pacienteId ?? id })
}

export function darDeBajaPaciente(id) {
  return api.solicitar(`pacientes/${id}`, { method: 'DELETE' })
}

