// Cliente HTTP: el token de acceso solo vive en memoria; la renovación viaja en cookie HttpOnly.
export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message)
    this.status = status
    this.details = details
  }
}

// La fábrica permite probar el cliente con respuestas HTTP controladas.
export function crearClienteApi({ baseUrl = '/api/v1', fetchImpl = (...args) => fetch(...args) } = {}) {
  let sesion = null
  let renovando = null
  let generacion = 0
  const listeners = new Set()
  const publicar = (valor) => { sesion = valor; listeners.forEach((listener) => listener(valor?.usuario ?? null)) }

  async function enviar(ruta, { method = 'GET', body, token, signal } = {}) {
    let response
    try {
      response = await fetchImpl(`${baseUrl.replace(/\/$/, '')}/${ruta.replace(/^\//, '')}`, {
        method, credentials: 'include', signal,
        headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    } catch (error) {
      if (error.name === 'AbortError') throw error
      throw new ApiError('No se pudo conectar con el servidor. Inténtalo nuevamente.')
    }
    // Un 204 no tiene cuerpo; los errores pueden incluir un ProblemDetail.
    const text = response.status === 204 ? '' : await response.text()
    let data = null
    try { data = text ? JSON.parse(text) : null } catch { /* Un proxy puede responder HTML ante un error. */ }
    if (!response.ok) throw new ApiError(data?.detail || data?.message || `La solicitud falló (${response.status}).`, response.status, data)
    return data
  }

  function guardarSesion(data, version) {
    // Una respuesta tardía no puede recuperar una sesión cerrada mientras viajaba.
    if (version !== generacion) throw new ApiError('La sesión cambió. Vuelve a ingresar.', 401)
    if (!data?.accessToken || !data?.usuario?.id || !data?.usuario?.rol) throw new ApiError('La respuesta de sesión no es válida.')
    publicar({ ...data, venceEn: Date.now() + Number(data.expiresIn) * 1000 })
    return data.usuario
  }

  function renovar() {
    // Comparte la rotación entre llamadas paralelas y el montaje de StrictMode.
    if (!renovando) {
      const version = generacion
      renovando = enviar('autenticacion/web/renovar', { method: 'POST' })
        .then((data) => guardarSesion(data, version))
        .catch((error) => { if (version === generacion && error.status === 401) publicar(null); throw error })
        .finally(() => { renovando = null })
    }
    return renovando
  }

  async function solicitar(ruta, opciones = {}) {
    if (opciones.publica) return enviar(ruta, opciones)
    if (!sesion || sesion.venceEn <= Date.now() + 5000) await renovar()
    const tokenEnviado = sesion?.accessToken
    try { return await enviar(ruta, { ...opciones, token: tokenEnviado }) }
    catch (error) {
      if (error.status !== 401) throw error
      // Evita una segunda rotación si otro request ya renovó este token.
      if (sesion?.accessToken === tokenEnviado) await renovar()
      if (!sesion) throw error
      try { return await enviar(ruta, { ...opciones, token: sesion.accessToken }) }
      catch (reintento) { if (reintento.status === 401) publicar(null); throw reintento }
    }
  }

  return {
    solicitar, renovar,
    usuarioActual: () => sesion?.usuario ?? null,
    suscribir: (listener) => { listeners.add(listener); return () => listeners.delete(listener) },
    async login(correo, password) {
      // Una rotación anterior no debe reemplazar después la cookie del nuevo login.
      if (renovando) await renovando.catch(() => {})
      generacion += 1
      const version = generacion
      return guardarSesion(await enviar('autenticacion/web/login', { method: 'POST', body: { correo, password } }), version)
    },
    async logout() {
      // Espera cualquier rotación pendiente antes de revocar la cookie más reciente.
      const pendiente = renovando
      generacion += 1
      publicar(null)
      if (pendiente) await pendiente.catch(() => {})
      return enviar('autenticacion/web/logout', { method: 'POST' })
    },
    registrar: (correo, password) => enviar('autenticacion/registro', { method: 'POST', body: { correo, password } }),
  }
}

// En desarrollo Vite reenvía /api al gateway; en producción la URL es configurable.
export const api = crearClienteApi({ baseUrl: import.meta.env?.VITE_API_URL || '/api/v1' })
