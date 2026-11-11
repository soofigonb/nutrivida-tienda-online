import { useContext } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { AuthContext, AuthProvider } from './AuthContext'
import { api } from '../services/api'

const estado = vi.hoisted(() => ({ usuario: null, listeners: new Set() }))
vi.mock('../services/api', () => ({ api: {
  usuarioActual: () => estado.usuario,
  suscribir: (listener) => { estado.listeners.add(listener); return () => estado.listeners.delete(listener) },
  renovar: vi.fn(), solicitar: vi.fn(), login: vi.fn(), logout: vi.fn(), registrar: vi.fn(),
} }))
const cliente = { id: 'cuenta-1', correo: 'ana@duoc.cl', rol: 'CLIENTE', estado: 'ACTIVO' }
function publicar(cuenta) { estado.usuario = cuenta; estado.listeners.forEach(l => l(cuenta)) }
const mostrar = () => renderHook(() => useContext(AuthContext), { wrapper: AuthProvider })
beforeEach(() => {
  localStorage.clear(); estado.usuario = null; estado.listeners.clear(); vi.resetAllMocks()
  api.renovar.mockRejectedValue(Object.assign(new Error('Sin sesión'), { status: 401 }))
  api.login.mockImplementation(async () => { publicar(cliente); return cliente })
  api.logout.mockImplementation(async () => publicar(null))
  api.registrar.mockResolvedValue(cliente)
  api.solicitar.mockResolvedValue(cliente)
})

it('ignora una identidad administrativa falsificada en localStorage', async () => {
  localStorage.setItem('sesionNutriVida', JSON.stringify({ rol: 'ADMINISTRADOR' }))
  const { result } = mostrar()
  await waitFor(() => expect(result.current.cargandoSesion).toBe(false))
  expect(result.current.usuario).toBeNull()
})
it('restaura la cuenta desde la renovación y consulta me', async () => {
  api.renovar.mockImplementation(async () => publicar(cliente))
  api.solicitar.mockImplementation(async ruta => ruta === 'pacientes/me' ? { nombre: 'Ana' } : cliente)
  const { result } = mostrar()
  await waitFor(() => expect(result.current.nombrePaciente).toBe('Ana'))
  expect(result.current.usuario.id).toBe(cliente.id)
  expect(api.solicitar).toHaveBeenCalledWith('autenticacion/me')
  await act(async () => { await result.current.cerrarSesion() })
  expect(result.current.nombrePaciente).toBeNull()
})
it('inicia sesión por API y normaliza el correo', async () => {
  const { result } = mostrar()
  await waitFor(() => expect(result.current.cargandoSesion).toBe(false))
  let respuesta
  await act(async () => { respuesta = await result.current.iniciarSesion(' ANA@DUOC.CL ', 'Clave123') })
  expect(respuesta.exito).toBe(true)
  expect(api.login).toHaveBeenCalledWith('ana@duoc.cl', 'Clave123')
  expect(localStorage.getItem('sesionNutriVida')).toBeNull()
})
it('un login rechazado no crea una cuenta de demostración', async () => {
  api.login.mockRejectedValue(new Error('Credenciales inválidas'))
  const { result } = mostrar()
  let respuesta
  await act(async () => { respuesta = await result.current.iniciarSesion('admin@nutrivida.cl', 'admin123') })
  expect(respuesta.exito).toBe(false)
  expect(result.current.usuario).toBeNull()
})
it('un cliente no puede entrar mediante el acceso de personal', async () => {
  const { result } = mostrar()
  let respuesta
  await act(async () => { respuesta = await result.current.iniciarSesion(cliente.correo, 'Clave123', true) })
  expect(respuesta.exito).toBe(false)
  expect(api.logout).toHaveBeenCalled()
})
it('separa credenciales y perfil clínico en sus respectivos servicios', async () => {
  const { result } = mostrar()
  let respuesta
  await act(async () => { respuesta = await result.current.registrarPaciente({ correo: cliente.correo, password: 'Clave123', nombre: 'Ana', apellidos: 'Torres', run: '123456785', rol: 'ADMINISTRADOR' }) })
  expect(respuesta.exito).toBe(true)
  expect(api.registrar).toHaveBeenCalledWith(cliente.correo, 'Clave123')
  const [ruta, opciones] = api.solicitar.mock.calls.find(([r, config]) => r === 'pacientes/me' && config.method === 'PUT')
  expect(ruta).toBe('pacientes/me')
  expect(opciones.body).not.toHaveProperty('password')
  expect(opciones.body).not.toHaveProperty('rol')
  expect(opciones.body.run).toBe('123456785')
})
it('informa un perfil pendiente y no vuelve a crear las credenciales al reintentar', async () => {
  api.solicitar.mockRejectedValue(new Error('Pacientes no disponible'))
  const { result } = mostrar()
  const datos = { correo: cliente.correo, password: 'Clave123', nombre: 'Ana' }
  let respuesta
  await act(async () => { respuesta = await result.current.registrarPaciente(datos) })
  expect(respuesta.mensaje).toMatch(/cuenta ya está creada/i)
  await act(async () => { await result.current.registrarPaciente(datos) })
  expect(api.registrar).toHaveBeenCalledTimes(1)
})
it('conserva una marca sin secretos si no puede confirmar logout', async () => {
  const { result } = mostrar()
  await waitFor(() => expect(result.current.cargandoSesion).toBe(false))
  api.logout.mockRejectedValue(new Error('Sin conexión'))
  await act(async () => { await result.current.cerrarSesion() })
  expect(localStorage.getItem('nutrivida:logout-pendiente')).toBe('1')
  expect(result.current.errorSesion).toMatch(/servidor/i)
})
it('un cierre pendiente no restaura la sesión al recargar', async () => {
  localStorage.setItem('nutrivida:logout-pendiente', '1')
  const { result } = mostrar()
  await waitFor(() => expect(result.current.cargandoSesion).toBe(false))
  expect(api.logout).toHaveBeenCalled()
  expect(api.renovar).not.toHaveBeenCalled()
})
