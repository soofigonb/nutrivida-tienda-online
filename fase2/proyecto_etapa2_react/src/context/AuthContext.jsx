import { createContext, useState } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // ========================================
  // 1. RECUPERAR LA SESIÓN GUARDADA
  // ========================================

  const [usuario, setUsuario] = useState(() => {
    try {
      const sesionGuardada =
        localStorage.getItem('sesionNutriVida')

      return sesionGuardada
        ? JSON.parse(sesionGuardada)
        : null
    } catch (error) {
      console.error(
        'No se pudo recuperar la sesión:',
        error,
      )

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
  // 3. OBTENER LOS PACIENTES GUARDADOS
  // ========================================

  function obtenerPacientesGuardados() {
    try {
      const datosGuardados =
        localStorage.getItem('pacientesNutriVida')

      const pacientes = datosGuardados
        ? JSON.parse(datosGuardados)
        : []

      if (!Array.isArray(pacientes)) {
        return []
      }

      // Compatibilidad con los nombres usados en la primera etapa.
      return pacientes.map((paciente) => {
        const run = limpiarRut(
          paciente.run || paciente.rut,
        )

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
    } catch (error) {
      console.error(
        'No se pudieron recuperar los pacientes:',
        error,
      )

      return []
    }
  }

  // ========================================
  // 4. REGISTRAR UNA CUENTA DE PACIENTE
  // ========================================

  function registrarPaciente(nuevoPaciente) {
    const pacientes = obtenerPacientesGuardados()

    const runNuevo = limpiarRut(
      nuevoPaciente.run || nuevoPaciente.rut,
    )

    const correoNuevo = limpiarCorreo(
      nuevoPaciente.correo,
    )

    const passwordNueva =
      nuevoPaciente.contrasena ||
      nuevoPaciente.password ||
      ''

    const runRegistrado = pacientes.some(
      (paciente) =>
        limpiarRut(paciente.run || paciente.rut) ===
        runNuevo,
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
        limpiarCorreo(paciente.correo) ===
        correoNuevo,
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

      // El registro público solo crea cuentas de paciente.
      rol: 'paciente',
    }

    const pacientesActualizados = [
      ...pacientes,
      pacienteAInsertar,
    ]

    try {
      localStorage.setItem(
        'pacientesNutriVida',
        JSON.stringify(pacientesActualizados),
      )
    } catch (error) {
      console.error(
        'No se pudo guardar el paciente:',
        error,
      )

      return {
        exito: false,
        mensaje:
          'No se pudo guardar el registro en el navegador.',
      }
    }

    // Actualizar los listados que consumen DatosContext.
    window.dispatchEvent(
      new Event('nutrivida:datos'),
    )

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
      console.error(
        'No se pudo guardar la sesión:',
        error,
      )

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
    const correoBuscado =
      limpiarCorreo(identificador)

    const runBuscado =
      limpiarRut(identificador)

    // Cuenta administrativa del prototipo.
    if (
      correoBuscado === 'admin@nutrivida.cl' &&
      password === 'admin123'
    ) {
      const administrador = {
        id: 'admin',
        nombre: 'Administrador',
        correo: 'admin@nutrivida.cl',
        rol: 'admin',
      }

      return guardarSesion(administrador)
    }

    const pacientes = obtenerPacientesGuardados()

    const paciente = pacientes.find((registro) => {
      const coincideCorreo =
        limpiarCorreo(registro.correo) ===
        correoBuscado

      const coincideRun =
        limpiarRut(registro.run || registro.rut) ===
        runBuscado

      const coincidePassword =
        (registro.contrasena || registro.password) ===
        password

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

    // Validar el tipo de acceso antes de crear la sesión.
    if (soloAdministrador) {
      return {
        exito: false,
        mensaje:
          'Esta cuenta no tiene permisos de administrador. Ingresa desde el acceso para pacientes.',
      }
    }

    const usuarioPaciente = {
      id: paciente.id,
      nombre: paciente.nombre,
      correo: paciente.correo,
      run: paciente.run || paciente.rut,
      rut: paciente.rut || paciente.run,
      rol: 'paciente',
    }

    return guardarSesion(usuarioPaciente)
  }

  // ========================================
  // 7. CERRAR SESIÓN
  // ========================================

  function cerrarSesion() {
    setUsuario(null)

    try {
      localStorage.removeItem('sesionNutriVida')
    } catch (error) {
      console.error(
        'No se pudo eliminar la sesión guardada:',
        error,
      )
    }
  }

  // ========================================
  // 8. COMPARTIR EL CONTEXTO
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