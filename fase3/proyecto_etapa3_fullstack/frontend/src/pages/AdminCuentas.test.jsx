// Comprueba administración de cuentas sin cambiar la sesión del administrador.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import { AuthContext } from '../context/AuthContext'
import { api } from '../services/api'
import AdminCuentas from './AdminCuentas'

vi.mock('../services/api', () => ({ api: { solicitar: vi.fn(), registrar: vi.fn() } }))
const admin = { id: 'admin-1', correo: 'admin@duoc.cl', rol: 'ADMINISTRADOR', estado: 'ACTIVO' }
const cliente = { id: 'cliente-1', correo: 'cliente@duoc.cl', rol: 'CLIENTE', estado: 'ACTIVO' }
beforeEach(() => {
  vi.resetAllMocks()
  api.solicitar.mockImplementation(async (ruta) => ruta === 'autenticacion/usuarios' ? [admin, cliente] : cliente)
  api.registrar.mockResolvedValue({ id: 'nueva-1', correo: 'nueva@duoc.cl', rol: 'CLIENTE', estado: 'ACTIVO' })
})
function mostrar() {
  render(<AuthContext.Provider value={{ usuario: admin }}><AdminCuentas /></AuthContext.Provider>)
  return userEvent.setup()
}
it('muestra las cuentas e impide cambiar accidentalmente la propia', async () => {
  mostrar()
  expect(await screen.findByLabelText(`Rol de ${admin.correo}`)).toBeDisabled()
  expect(screen.getByLabelText(`Rol de ${cliente.correo}`)).toBeEnabled()
})
it('envía cambios de permisos de otra cuenta al endpoint administrativo', async () => {
  const user = mostrar()
  await user.selectOptions(await screen.findByLabelText(`Rol de ${cliente.correo}`), 'VENDEDOR')
  await user.click(screen.getAllByRole('button', { name: 'Guardar permisos' }).find(b => !b.disabled))
  expect(await screen.findByText(/Permisos actualizados/)).toBeInTheDocument()
  expect(api.solicitar).toHaveBeenCalledWith('autenticacion/usuarios/cliente-1', { method: 'PUT', body: { rol: 'VENDEDOR', estado: 'ACTIVO' } })
})
it('crea una cuenta y asigna vendedor sin iniciar sesión como ella', async () => {
  const user = mostrar()
  await user.type(screen.getByLabelText('Correo'), 'nueva@duoc.cl')
  await user.type(screen.getByLabelText('Contraseña inicial'), 'Clave123')
  await user.selectOptions(screen.getByLabelText('Rol'), 'VENDEDOR')
  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
  expect(await screen.findByText('Cuenta creada. Puede iniciar sesión con sus credenciales.')).toBeInTheDocument()
  expect(api.registrar).toHaveBeenCalledWith('nueva@duoc.cl', 'Clave123')
  expect(api.solicitar).toHaveBeenCalledWith('autenticacion/usuarios/nueva-1', { method: 'PUT', body: { rol: 'VENDEDOR', estado: 'ACTIVO' } })
})
it('informa un alta parcial si no consigue asignar los permisos', async () => {
  api.solicitar.mockImplementation(async ruta => {
    if (ruta === 'autenticacion/usuarios') return [admin]
    throw new Error('Sin permiso')
  })
  const user = mostrar()
  await user.type(screen.getByLabelText('Correo'), 'nueva@duoc.cl')
  await user.type(screen.getByLabelText('Contraseña inicial'), 'Clave123')
  await user.selectOptions(screen.getByLabelText('Rol'), 'VENDEDOR')
  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
  expect(await screen.findByText(/La cuenta fue creada con su rol inicial/)).toBeInTheDocument()
  expect(screen.queryByText('Cuenta creada. Puede iniciar sesión con sus credenciales.')).not.toBeInTheDocument()
})
