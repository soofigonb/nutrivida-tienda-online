import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import {
  leerDatos,
  guardarDatos,
  eliminarDatos,
} from './storage.js'

import {
  esFechaHoraFutura,
  obtenerFechaMinima,
  validarCorreo,
  validarRut,
} from './validaciones.js'

import {
  limpiarRun,
  validarRun,
  fechaNacimientoValida,
  correoPermitido,
  soloLetras,
  telefonoChileno,
} from './validacionesAdmin.js'

import formatearPrecio from './formatearPrecio.js'

// ========================================
// 1. PREPARACIÓN Y LIMPIEZA
// ========================================

beforeEach(() => {
  localStorage.clear()

  vi.spyOn(console, 'error')
    .mockImplementation(() => {})
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  localStorage.clear()
})

// ========================================
// 2. PERSISTENCIA Y MANEJO DE ERRORES
// ========================================

describe('Persistencia JSON y errores del navegador', () => {
  test('recupera el valor por defecto cuando la clave no existe', () => {
    expect(
      leerDatos('ausente', []),
    ).toEqual([])

    expect(
      leerDatos('ausente'),
    ).toBeNull()
  })

  test('guarda y recupera objetos sin perder sus datos', () => {
    const datos = [
      { id: 1, nombre: 'Ana' },
    ]

    expect(
      guardarDatos('prueba', datos),
    ).toBe(true)

    expect(
      leerDatos('prueba'),
    ).toEqual(datos)
  })

  test('un JSON dañado devuelve la alternativa sin modificar el original', () => {
    localStorage.setItem('prueba', '{dañado')

    expect(
      leerDatos('prueba', []),
    ).toEqual([])

    expect(
      localStorage.getItem('prueba'),
    ).toBe('{dañado')
  })

  test('una lectura bloqueada devuelve la alternativa', () => {
    vi.spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('Bloqueado')
      })

    expect(
      leerDatos('prueba', []),
    ).toEqual([])
  })

  test('un fallo de escritura conserva el valor anterior', () => {
    localStorage.setItem(
      'prueba',
      '"original"',
    )

    vi.spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Sin espacio')
      })

    expect(
      guardarDatos('prueba', 'nuevo'),
    ).toBe(false)

    expect(
      localStorage.getItem('prueba'),
    ).toBe('"original"')
  })

  test('elimina una clave sin afectar las demás', () => {
    localStorage.setItem('prueba', '1')
    localStorage.setItem('otra', '2')

    expect(
      eliminarDatos('prueba'),
    ).toBe(true)

    expect(
      localStorage.getItem('prueba'),
    ).toBeNull()

    expect(
      localStorage.getItem('otra'),
    ).toBe('2')
  })

  test('una eliminación bloqueada informa el fallo y conserva los datos', () => {
    localStorage.setItem('prueba', '1')

    vi.spyOn(Storage.prototype, 'removeItem')
      .mockImplementation(() => {
        throw new Error('Bloqueado')
      })

    expect(
      eliminarDatos('prueba'),
    ).toBe(false)

    expect(
      localStorage.getItem('prueba'),
    ).toBe('1')
  })
})

// ========================================
// 3. FECHAS Y HORARIOS
// ========================================

describe('Fechas y horarios', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    vi.setSystemTime(
      new Date(2026, 9, 15, 12, 0, 0),
    )
  })

  test('produce la fecha local para los formularios', () => {
    expect(
      obtenerFechaMinima(),
    ).toBe('2026-10-15')
  })

  test.each([
    ['2026-10-15', '13:00', true],
    ['2026-10-15', '11:00', false],
    ['2026-10-15', '12:00', false],
    ['', '13:00', false],
    ['2026-10-16', '', false],
    ['no-es-fecha', '13:00', false],
    ['2026-10-16', 'xx:00', false],
  ])(
    'fecha %s y hora %s: futuro = %s',
    (fecha, hora, esperado) => {
      expect(
        esFechaHoraFutura(fecha, hora),
      ).toBe(esperado)
    },
  )

  test.each([
    ['', true],
    ['2000-02-29', true],
    ['2001-02-29', false],
    ['1899-12-31', false],
    ['2027-01-01', false],
    ['15/10/2000', false],
    ['2026-10-15', true],
  ])(
    'fecha de nacimiento %s: válida = %s',
    (fecha, esperado) => {
      expect(
        fechaNacimientoValida(fecha),
      ).toBe(esperado)
    },
  )
})

// ========================================
// 4. RUN, CORREOS Y FORMATOS
// ========================================

describe('RUN, correo y formatos', () => {
  test('limpia puntos, guion y espacios del RUN', () => {
    expect(
      limpiarRun(' 12.345.678-5 '),
    ).toBe('123456785')

    expect(
      limpiarRun(),
    ).toBe('')
  })

  test.each([
    ['12.345.678-5', true],
    ['11.111.111-1', true],
    ['12.345.678-9', false],
    ['', false],
    ['123', false],
  ])(
    'verifica el RUN %s con ambos validadores',
    (run, esperado) => {
      expect(
        validarRut(run),
      ).toBe(esperado)

      expect(
        validarRun(run),
      ).toBe(esperado)
    },
  )

  test.each([
    ['ana@gmail.com', true],
    [' ana@duoc.cl ', true],
    ['sin-arroba.cl', false],
    ['ana @duoc.cl', false],
    ['', false],
  ])(
    'valida el formato del correo %s',
    (correo, esperado) => {
      expect(
        validarCorreo(correo),
      ).toBe(esperado)
    },
  )

  test('aplica los dominios, nombres y teléfonos permitidos', () => {
    expect(
      correoPermitido.test('ana@profesor.duoc.cl'),
    ).toBe(true)

    expect(
      correoPermitido.test('ana@hotmail.com'),
    ).toBe(false)

    expect(
      soloLetras.test('Sofía González'),
    ).toBe(true)

    expect(
      soloLetras.test('Sofía123'),
    ).toBe(false)

    expect(
      telefonoChileno.test('+56912345678'),
    ).toBe(true)

    expect(
      telefonoChileno.test('12345'),
    ).toBe(false)
  })

  test('formatea precios en pesos chilenos', () => {
    expect(
      formatearPrecio(35000),
    ).toBe('$35.000 CLP')

    expect(
      formatearPrecio(0),
    ).toBe('$0 CLP')
  })
})