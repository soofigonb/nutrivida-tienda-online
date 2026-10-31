import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function RutaAdmin() {
  const { usuario } = useContext(AuthContext)

  // Sin sesión: ir al inicio de sesión.
  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  // Los pacientes no pueden abrir el panel.
  if (usuario.rol !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default RutaAdmin