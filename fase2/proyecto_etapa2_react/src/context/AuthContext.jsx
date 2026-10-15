import { createContext, useState } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // ========================================
  // 1. RECUPERAR LA SESIÓN
  // ========================================

  const [usuario, setUsuario] = useState(() => {
    try {
      const sesion = localStorage.getItem('sesionNutriVida')

      return sesion ? JSON.parse(sesion) : null
    } catch (error) {
      console.error('No se pudo recuperar la sesión:', error)
      return null
    }
  })

  // ========================================
  // 2. NORMALIZAR LOS DATOS
  // ========================================

  function limpiarRut(rut) {
    return (rut || '')
      .replace(/[^0-9kK]/g, '')
      .toUpperCase()
  }

  function limpiarCorreo(correo) {
    return (correo || '')
      .replace(/\s+/g, '')
      .toLowerCase()
  }

  // ========================================
  // 3. LEER LOS PACIENTES SIN PERDER DATOS
  // ========================================

  function obtenerPacientesGuardados() {
    try {
      const contenido = localStorage.getItem('pacientesNutriVida')

      // Solo una clave inexistente representa una lista inicial vacía.
      const pacientes = contenido === null
        ? []
        : JSON.parse(contenido)

      const camposTexto = [
        'run',
        'rut',
        'correo',
        'contrasena',
        'password',
        'clave',
      ]

      const formatoInvalido =
        !Array.isArray(pacientes) ||
        pacientes.some(
          (paciente) =>
            !paciente ||
            typeof paciente !== 'object' ||
            Array.isArray(paciente) ||
            camposTexto.some(
              (campo) =>
                paciente[campo] != null &&
                typeof paciente[campo] !== 'string',
            ),
        )

      if (formatoInvalido) {
        throw new Error('Formato de pacientes inválido.')
      }

      // Compatibilidad con los nombres utilizados en la primera etapa.
      const normalizados = pacientes.map((paciente) => {
        const run = limpiarRut(paciente.run || paciente.rut)

        const password =
          paciente.contrasena ||
          paciente.password ||
          paciente.clave ||
          ''

        return {
          ...paciente,
          run,
          rut: run,
          contrasena: password,
          password,
        }
      })

      return {
        exito: true,
        pacientes: normalizados,
      }
    } catch (error) {
      console.error('No se pudieron recuperar los pacientes:', error)

      // No devolver []: permitiría sobrescribir los datos originales.
      return {
        exito: false,
        mensaje:
          'No se pudieron leer los pacientes guardados. Los datos originales se conservaron. No se realizó la operación.',
      }
    }
  }

  // ========================================
  // 4. REGISTRAR PACIENTES
  // ========================================

  function registrarPaciente(nuevoPaciente) {
    const lectura = obtenerPacientesGuardados()

    if (!lectura.exito) return lectura

    const { pacientes } = lectura

    const runNuevo = limpiarRut(
      nuevoPaciente.run || nuevoPaciente.rut,
    )

    const correoNuevo = limpiarCorreo(nuevoPaciente.correo)

    const passwordNueva =
      nuevoPaciente.contrasena ||
      nuevoPaciente.password ||
      ''

    const runRegistrado = pacientes.some(
      (paciente) =>
        limpiarRut(paciente.run || paciente.rut) === runNuevo,
    )

    if (runRegistrado) {
      return {
        exito: false,
        campo: 'rut',
        mensaje: 'El RUN/RUT ya está registrado',
      }
    }

    const correoRegistrado = pacientes.some(
      (paciente) =>
        limpiarCorreo(paciente.correo) === correoNuevo,
    )

    if (correoRegistrado) {
      return {
        exito: false,
        campo: 'correo',
        mensaje: 'El correo ya está registrado',
      }
    }

    const pacienteAInsertar = {
      ...nuevoPaciente,
      id: Date.now().toString(),
      run: runNuevo,
      rut: runNuevo,
      correo: correoNuevo,
      contrasena: passwordNueva,
      password: passwordNueva,
      rol: 'paciente',
    }

    try {
      localStorage.setItem(
        'pacientesNutriVida',
        JSON.stringify([...pacientes, pacienteAInsertar]),
      )
    } catch (error) {
      console.error('No se pudo guardar el paciente:', error)

      return {
        exito: false,
        mensaje: 'No se pudo guardar el registro en el navegador.',
      }
    }

    window.dispatchEvent(new Event('nutrivida:datos'))

    return { exito: true }
  }

  // ========================================
  // 5. GUARDAR LA SESIÓN
  // ========================================

  function guardarSesion(datosUsuario) {
    try {
      localStorage.setItem(
        'sesionNutriVida',
        JSON.stringify(datosUsuario),
      )
    } catch (error) {
      console.error('No se pudo guardar la sesión:', error)

      return {
        exito: false,
        mensaje:
          'No se pudo guardar la sesión en el navegador. Intenta nuevamente.',
      }
    }

    setUsuario(datosUsuario)

    return {
      exito: true,
      usuario: datosUsuario,
    }
  }

  // ========================================
  // 6. INICIAR SESIÓN
  // ========================================

  function iniciarSesion(
    identificador,
    password,
    soloAdministrador = false,
  ) {
    const correoBuscado = limpiarCorreo(identificador)
    const runBuscado = limpiarRut(identificador)

    // Cuenta administrativa de demostración.
    if (
      correoBuscado === 'admin@nutrivida.cl' &&
      password === 'admin123'
    ) {
      return guardarSesion({
        id: 'admin',
        nombre: 'Administrador',
        correo: 'admin@nutrivida.cl',
        rol: 'admin',
      })
    }

    const lectura = obtenerPacientesGuardados()

    if (!lectura.exito) return lectura

    const { pacientes } = lectura

    const paciente = pacientes.find((registro) => {
      const coincideCorreo =
        limpiarCorreo(registro.correo) === correoBuscado

      const coincideRun =
        limpiarRut(registro.run || registro.rut) === runBuscado

      const coincidePassword =
        (registro.contrasena || registro.password) === password

      return (
        (coincideCorreo || coincideRun) &&
        coincidePassword
      )
    })

    if (!paciente) {
      return {
        exito: false,
        mensaje: 'Credenciales incorrectas.',
      }
    }

    if (soloAdministrador) {
      return {
        exito: false,
        mensaje:
          'Esta cuenta no tiene permisos de administrador. Ingresa desde el acceso para pacientes.',
      }
    }

    return guardarSesion({
      id: paciente.id,
      nombre: paciente.nombre,
      correo: paciente.correo,
      run: paciente.run || paciente.rut,
      rut: paciente.rut || paciente.run,
      rol: 'paciente',
    })
  }

  // ========================================
  // 7. CERRAR SESIÓN
  // ========================================

  function cerrarSesion() {
    setUsuario(null)

    try {
      localStorage.removeItem('sesionNutriVida')
    } catch (error) {
      console.error('No se pudo eliminar la sesión guardada:', error)
    }
  }

  // ========================================
  // 8. COMPARTIR LAS OPERACIONES
  // ========================================

  return (
    <AuthContext.Provider
      value={{
        usuario,
        registrarPaciente,
        iniciarSesion,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}