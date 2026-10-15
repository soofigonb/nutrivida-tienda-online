// ========================================
// 1. FORMATO Y VALIDACIÓN DEL RUN
// ========================================

export function limpiarRun(valor = '') {
  return String(valor)
    .replace(/[.\s-]/g, '')
    .toUpperCase()
}

export function validarRun(valor) {
  const run = limpiarRun(valor)

  if (!/^[1-9]\d{6,7}[\dK]$/.test(run)) {
    return false
  }

  let suma = 0
  let factor = 2

  for (let i = run.length - 2; i >= 0; i--) {
    suma += Number(run[i]) * factor
    factor = factor === 7 ? 2 : factor + 1
  }

  const resto = 11 - (suma % 11)

  const dv =
    resto === 11
      ? '0'
      : resto === 10
        ? 'K'
        : String(resto)

  return run.at(-1) === dv
}

// ========================================
// 2. EXPRESIONES REGULARES
// ========================================

export const correoPermitido =
  /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i

export const soloLetras =
  /^\p{L}+(?:\s+\p{L}+)*$/u

export const telefonoChileno =
  /^(?:\+56)?9\d{8}$/

// ========================================
// 3. FECHA DE NACIMIENTO
// ========================================

export function fechaNacimientoValida(valor) {
  if (!valor) return true

  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false
  }

  const [anio, mes, dia] = valor.split('-').map(Number)
  const fecha = new Date(anio, mes - 1, dia)

  const hoy = new Date()
  hoy.setHours(23, 59, 59, 999)

  return (
    anio >= 1900 &&
    fecha.getFullYear() === anio &&
    fecha.getMonth() === mes - 1 &&
    fecha.getDate() === dia &&
    fecha <= hoy
  )
}