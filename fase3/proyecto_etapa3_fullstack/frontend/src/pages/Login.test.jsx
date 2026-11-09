import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import { AuthContext } from '../context/AuthContext'
import Login from './Login'

function mostrar(resultado, ruta = '/login') {
  const iniciarSesion = vi.fn().mockResolvedValue(resultado)
  render(<MemoryRouter initialEntries={[ruta]}><AuthContext.Provider value={{ iniciarSesion }}><Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<h1>Tienda</h1>} />
    <Route path="/admin" element={<h1>Administración</h1>} />
    <Route path="/gestion/ordenes" element={<h1>Gestión de órdenes</h1>} />
  </Routes></AuthContext.Provider></MemoryRouter>)
  return { iniciarSesion, user: userEvent.setup() }
}
async function ingresar(user) {
  await user.type(screen.getByLabelText(/^Correo electrónico$/), 'ana@duoc.cl')
  await user.type(screen.getByLabelText(/^Contraseña$/), 'Clave123')
  await user.click(screen.getByRole('button', { name: /^Ingresar$/ }))
}
it.each([['CLIENTE', 'Tienda'], ['ADMINISTRADOR', 'Administración'], ['VENDEDOR', 'Gestión de órdenes']])('dirige el rol %s a su destino', async (rol, titulo) => {
  const { user, iniciarSesion } = mostrar({ exito: true, usuario: { rol } })
  await ingresar(user)
  expect(await screen.findByRole('heading', { name: titulo })).toBeInTheDocument()
  expect(iniciarSesion).toHaveBeenCalledWith('ana@duoc.cl', 'Clave123', false)
})
it('muestra un rechazo del servidor y conserva el formulario', async () => {
  const { user } = mostrar({ exito: false, mensaje: 'Credenciales inválidas.' })
  await ingresar(user)
  expect(await screen.findByText('Credenciales inválidas.')).toBeInTheDocument()
  expect(screen.getByLabelText(/^Correo electrónico$/)).toHaveValue('ana@duoc.cl')
})
