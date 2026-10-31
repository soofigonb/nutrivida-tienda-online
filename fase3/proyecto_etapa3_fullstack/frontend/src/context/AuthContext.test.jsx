import { useContext } from 'react'
import {
  act,
  cleanup,
  renderHook,
} from '@testing-library/react'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import { AuthContext, AuthProvider } from './AuthContext.jsx'

// ========================================
// 1. DATOS DE PRUEBA
// ========================================

const CLAVE = 'pacientesNutriVida'

const paciente = {
  id: 'paciente-1',
  nombre: 'Ana',
  run: '123456785',
  correo: 'ana@duoc.cl',
  contrasena: 'clave123',
  rol: 'paciente',
}

const nuevo = {
  nombre: 'Sofía',
  rut: '11.111.111-1',
  correo: 'sofia@gmail.com',
  password: 'clave456',
}

function iniciarContexto() {
  return renderHook(() => useContext(AuthContext), {
    wrapper: AuthProvider,
  })
}

// ========================================
// 2. PREPARACIÓN Y LIMPIEZA
// ========================================

beforeEach(() => {
  localStorage.clear()

  // Los fallos simulados no necesitan imprimir errores en la terminal.
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// ========================================
// 3. REGISTRO Y CONSERVACIÓN DE DATOS
// ========================================

describe('Registro y sesión: AuthContext', () => {
  // Cada entrada se ejecuta como un caso independiente: 5 pruebas.
  test.each([
    '{JSON inválido',
    '{}',
    '[null]',
    '[[1]]',
    '',
  ])(
    'conserva los pacientes y rechaza el registro si el almacenamiento contiene %j',
    (contenido) => {
      localStorage.setItem(CLAVE, contenido)

      const { result } = iniciarContexto()
      const escribir = vi.spyOn(Storage.prototype, 'setItem')

      let respuesta

      act(() => {
        respuesta = result.current.registrarPaciente(nuevo)
      })

      expect(respuesta.exito).toBe(false)

      expect(respuesta.mensaje).toMatch(
        /datos originales se conservaron/i,
      )

      expect(localStorage.getItem(CLAVE)).toBe(contenido)
      expect(escribir).not.toHaveBeenCalled()
    },
  )

  test('no escribe pacientes si falla la lectura del navegador', () => {
    const { result } = iniciarContexto()
    const leer = Storage.prototype.getItem

    vi.spyOn(Storage.prototype, 'getItem')
      .mockImplementation(function (clave) {
        if (clave === CLAVE) {
          throw new Error('Lectura bloqueada')
        }

        return leer.call(this, clave)
      })

    const escribir = vi.spyOn(Storage.prototype, 'setItem')

    let respuesta

    act(() => {
      respuesta = result.current.registrarPaciente(nuevo)
    })

    expect(respuesta.exito).toBe(false)
    expect(escribir).not.toHaveBeenCalled()
  })

  test('registra al primer paciente y fuerza el rol paciente', () => {
    const { result } = iniciarContexto()

    let respuesta

    act(() => {
      respuesta = result.current.registrarPaciente({
        ...nuevo,
        rol: 'admin',
      })
    })

    expect(respuesta.exito).toBe(true)

    const guardados = JSON.parse(localStorage.getItem(CLAVE))

    expect(guardados).toHaveLength(1)

    expect(guardados[0]).toMatchObject({
      run: '111111111',
      correo: 'sofia@gmail.com',
      rol: 'paciente',
    })
  })

  test('agrega un paciente sin perder los registros anteriores', () => {
    localStorage.setItem(CLAVE, JSON.stringify([paciente]))

    const { result } = iniciarContexto()

    act(() => {
      result.current.registrarPaciente(nuevo)
    })

    const guardados = JSON.parse(localStorage.getItem(CLAVE))

    expect(guardados).toHaveLength(2)
    expect(guardados[0]).toMatchObject(paciente)
  })

  test('rechaza un RUN duplicado aunque tenga otro formato', () => {
    localStorage.setItem(CLAVE, JSON.stringify([paciente]))

    const { result } = iniciarContexto()

    let respuesta

    act(() => {
      respuesta = result.current.registrarPaciente({
        ...nuevo,
        rut: '12.345.678-5',
      })
    })

    expect(respuesta).toMatchObject({
      exito: false,
      campo: 'rut',
    })

    expect(
      JSON.parse(localStorage.getItem(CLAVE)),
    ).toHaveLength(1)
  })

  test('rechaza un correo duplicado con mayúsculas o espacios exteriores', () => {
    localStorage.setItem(CLAVE, JSON.stringify([paciente]))

    const { result } = iniciarContexto()

    let respuesta

    act(() => {
      respuesta = result.current.registrarPaciente({
        ...nuevo,
        correo: ' ANA@DUOC.CL ',
      })
    })

    expect(respuesta).toMatchObject({
      exito: false,
      campo: 'correo',
    })

    expect(
      JSON.parse(localStorage.getItem(CLAVE)),
    ).toHaveLength(1)
  })

  test('un fallo al guardar no borra los pacientes anteriores', () => {
    const original = JSON.stringify([paciente])

    localStorage.setItem(CLAVE, original)

    const { result } = iniciarContexto()

    vi.spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Sin espacio')
      })

    let respuesta

    act(() => {
      respuesta = result.current.registrarPaciente(nuevo)
    })

    expect(respuesta.exito).toBe(false)
    expect(localStorage.getItem(CLAVE)).toBe(original)
  })

  // ========================================
  // 4. INICIO Y CIERRE DE SESIÓN
  // ========================================

  test('inicia sesión como paciente y la persiste', () => {
    localStorage.setItem(CLAVE, JSON.stringify([paciente]))

    const { result } = iniciarContexto()

    let respuesta

    act(() => {
      respuesta = result.current.iniciarSesion(
        'ana@duoc.cl',
        'clave123',
      )
    })

    expect(respuesta.exito).toBe(true)

    expect(result.current.usuario).toMatchObject({
      id: paciente.id,
      rol: 'paciente',
    })

    expect(
      JSON.parse(localStorage.getItem('sesionNutriVida')),
    ).toEqual(result.current.usuario)
  })

  test('rechaza una contraseña incorrecta sin crear sesión', () => {
    localStorage.setItem(CLAVE, JSON.stringify([paciente]))

    const { result } = iniciarContexto()

    let respuesta

    act(() => {
      respuesta = result.current.iniciarSesion(
        'ana@duoc.cl',
        'incorrecta',
      )
    })

    expect(respuesta.exito).toBe(false)
    expect(result.current.usuario).toBeNull()
    expect(localStorage.getItem('sesionNutriVida')).toBeNull()
  })

  test('impide que un paciente cree sesión desde el acceso administrativo', () => {
    localStorage.setItem(CLAVE, JSON.stringify([paciente]))

    const { result } = iniciarContexto()

    let respuesta

    act(() => {
      respuesta = result.current.iniciarSesion(
        'ana@duoc.cl',
        'clave123',
        true,
      )
    })

    expect(respuesta.exito).toBe(false)
    expect(result.current.usuario).toBeNull()
    expect(localStorage.getItem('sesionNutriVida')).toBeNull()
  })

  test('inicia sesión administrativa y permite cerrarla', () => {
    const { result } = iniciarContexto()

    act(() => {
      result.current.iniciarSesion(
        'admin@nutrivida.cl',
        'admin123',
        true,
      )
    })

    expect(result.current.usuario?.rol).toBe('admin')

    act(() => {
      result.current.cerrarSesion()
    })

    expect(result.current.usuario).toBeNull()
    expect(localStorage.getItem('sesionNutriVida')).toBeNull()
  })

  test('rechaza el login y conserva los datos cuando los pacientes están dañados', () => {
    localStorage.setItem(CLAVE, '{datos dañados')

    const { result } = iniciarContexto()

    let respuesta

    act(() => {
      respuesta = result.current.iniciarSesion(
        'ana@duoc.cl',
        'clave123',
      )
    })

    expect(respuesta.exito).toBe(false)
    expect(respuesta.mensaje).toMatch(/leer los pacientes/i)

    expect(localStorage.getItem(CLAVE)).toBe('{datos dañados')
    expect(localStorage.getItem('sesionNutriVida')).toBeNull()
  })

  test('no crea una sesión en memoria si falla su persistencia', () => {
    const { result } = iniciarContexto()

    vi.spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Escritura bloqueada')
      })

    let respuesta

    act(() => {
      respuesta = result.current.iniciarSesion(
        'admin@nutrivida.cl',
        'admin123',
        true,
      )
    })

    expect(respuesta.exito).toBe(false)
    expect(result.current.usuario).toBeNull()
    expect(localStorage.getItem('sesionNutriVida')).toBeNull()
  })
})