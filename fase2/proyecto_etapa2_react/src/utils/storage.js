/**
 * Utilidades para almacenamiento local (localStorage).
 * Permite persistir y recuperar datos en formato JSON de forma segura.
 */

export function leerDatos(clave, porDefecto = null) {
  try {
    const datos = localStorage.getItem(clave)
    if (datos === null) return porDefecto
    return JSON.parse(datos)
  } catch (error) {
    console.error(`Error al leer "${clave}" desde localStorage:`, error)
    return porDefecto
  }
}

export function guardarDatos(clave, datos) {
  try {
    localStorage.setItem(clave, JSON.stringify(datos))
    return true
  } catch (error) {
    console.error(`Error al guardar "${clave}" en localStorage:`, error)
    return false
  }
}

export function eliminarDatos(clave) {
  try {
    localStorage.removeItem(clave)
    return true
  } catch (error) {
    console.error(`Error al eliminar "${clave}" de localStorage:`, error)
    return false
  }
}
