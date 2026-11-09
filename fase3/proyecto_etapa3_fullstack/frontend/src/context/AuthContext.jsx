// Identidad validada por el backend.
import { createContext, useEffect, useState } from 'react'
import { api } from '../services/api'

export const AuthContext = createContext(null)
const CLAVE_SALIDA = 'nutrivida:logout-pendiente'

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(api.usuarioActual())
  const [cargandoSesion, setCargandoSesion] = useState(true)
  const [errorSesion, setErrorSesion] = useState('')

  useEffect(() => {
    let activo = true
    const cancelar = api.suscribir((cuenta) => { if (activo) setUsuario(cuenta) })
    async function restaurar() {
      try {
        // Evita restaurar una sesión cerrada.
        if (localStorage.getItem(CLAVE_SALIDA)) {
          await api.logout()
          localStorage.removeItem(CLAVE_SALIDA)
        } else {
          await api.renovar()
          await api.solicitar('autenticacion/me')
        }
      } catch (error) {
        if (activo && error.status !== 401) setErrorSesion(error.message)
      } finally { if (activo) setCargandoSesion(false) }
    }
    restaurar()
    return () => { activo = false; cancelar() }
  }, [])

  async function iniciarSesion(correo, password, soloPersonal = false) {
    setErrorSesion('')
    try {
      const cuenta = await api.login(correo.trim().toLowerCase(), password)
      if (soloPersonal && !['ADMINISTRADOR', 'VENDEDOR'].includes(cuenta.rol)) {
        await api.logout()
        return { exito: false, mensaje: 'Tu cuenta no tiene acceso al panel de personal.' }
      }
      localStorage.removeItem(CLAVE_SALIDA)
      return { exito: true, usuario: cuenta }
    } catch (error) { return { exito: false, mensaje: error.message } }
  }

  async function cerrarSesion() {
    try { localStorage.setItem(CLAVE_SALIDA, '1') } catch { /* El servidor sigue siendo responsable de revocar la sesión. */ }
    try {
      await api.logout()
      localStorage.removeItem(CLAVE_SALIDA)
      setErrorSesion('')
      return { exito: true }
    } catch (error) {
      setErrorSesion('Se cerró la vista local. Falta confirmar el cierre en el servidor: ' + error.message)
      return { exito: false, mensaje: error.message }
    }
  }

  async function registrarCuenta(correo, password) {
    try { await api.registrar(correo.trim().toLowerCase(), password); return { exito: true } }
    catch (error) { return { exito: false, mensaje: error.message, campo: error.status === 409 ? 'correo' : undefined } }
  }

  async function registrarPaciente(datos) {
    // Separa la cuenta del perfil clínico.
    let cuenta = api.usuarioActual()
    if (!cuenta) {
      const registro = await registrarCuenta(datos.correo, datos.password)
      if (!registro.exito) return registro
      const ingreso = await iniciarSesion(datos.correo, datos.password)
      if (!ingreso.exito) return { exito: false, mensaje: 'La cuenta fue creada. Inicia sesión para completar el perfil.' }
      cuenta = ingreso.usuario
    }
    if (cuenta.correo !== datos.correo.trim().toLowerCase() || cuenta.rol !== 'CLIENTE') {
      return { exito: false, mensaje: 'Cierra tu sesión antes de registrar una cuenta diferente.' }
    }
    // Envía solo datos del perfil.
    const { nombre, apellidos, run, telefono, direccion, fechaNacimiento, region, comuna } = datos
    try {
      await api.solicitar('pacientes/me', { method: 'PUT', body: { nombre, apellidos, run, correo: cuenta.correo, telefono, direccion, fechaNacimiento: fechaNacimiento || null, region, comuna } })
      return { exito: true }
    } catch (error) {
      return { exito: false, mensaje: `Tu cuenta ya está creada. El perfil de paciente todavía no se pudo guardar: ${error.message}` }
    }
  }

  return <AuthContext.Provider value={{ usuario, cargandoSesion, errorSesion, iniciarSesion, cerrarSesion, registrarCuenta, registrarPaciente }}>{children}</AuthContext.Provider>
}
