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
  const respuesta = await api.solicitar('pacientes')
  if (!Array.isArray(respuesta)) throw new Error('La API no devolvió el listado de pacientes.')
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
  if (paciente?.pacienteId == null) throw new Error('La API no devolvió el identificador del paciente.')
  return aPaciente(paciente)
}

export function darDeBajaPaciente(id) {
  return api.solicitar(`pacientes/${id}`, { method: 'DELETE' })
}

