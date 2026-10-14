/**
 * Funciones de validación comunes para la aplicación NutriVida.
 */

/**
 * Comprueba si una fecha y hora corresponden a un momento futuro.
 * @param {string} fecha - Fecha en formato 'YYYY-MM-DD'
 * @param {string} hora - Hora en formato 'HH:mm'
 * @returns {boolean} true si la fecha y hora corresponden a un momento futuro
 */
export function esFechaHoraFutura(fecha, hora) {
  if (!fecha || !hora) return false

  const [anio, mes, dia] = fecha.split('-').map(Number)
  const [horas, minutos] = hora.split(':').map(Number)

  if (!anio || !mes || !dia || isNaN(horas) || isNaN(minutos)) {
    return false
  }

  // Los meses en JavaScript Date son base 0 (0-11)
  const fechaObjetivo = new Date(anio, mes - 1, dia, horas, minutos, 0, 0)
  const ahora = new Date()

  return fechaObjetivo.getTime() > ahora.getTime()
}

/**
 * Obtiene la fecha actual en formato 'YYYY-MM-DD' para atributos 'min' en inputs de fecha.
 * @returns {string} Fecha actual 'YYYY-MM-DD'
 */
export function obtenerFechaMinima() {
  const hoy = new Date()
  const anio = hoy.getFullYear()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

/**
 * Valida un correo electrónico básico según patrón estándar.
 * @param {string} correo
 * @returns {boolean}
 */
export function validarCorreo(correo) {
  if (!correo) return false
  const regex = /^\S+@\S+\.\S+$/
  return regex.test(correo.trim())
}

/**
 * Valida un RUT chileno con dígito verificador.
 * @param {string} rut
 * @returns {boolean}
 */
export function validarRut(rut) {
  if (!rut) return false
  const limpio = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (limpio.length < 8 || limpio.length > 9) return false

  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)

  let suma = 0
  let multiplo = 2

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo
    multiplo = multiplo < 7 ? multiplo + 1 : 2
  }

  const dvEsperado = 11 - (suma % 11)
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : String(dvEsperado)

  return dv === dvCalculado
}
