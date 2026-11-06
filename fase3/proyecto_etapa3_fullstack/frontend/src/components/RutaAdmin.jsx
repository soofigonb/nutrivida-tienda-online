import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function RutaAdmin() {
  const { usuario, cargandoSesion } = useContext(AuthContext)
  // Espera la renovación antes de decidir si se permite el acceso.
  if (cargandoSesion) return <p className="container py-5" role="status">Comprobando sesión…</p>

  // Sin sesión: ir al inicio de sesión.
  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  // Los pacientes no pueden abrir el panel.
  if (usuario.rol !== 'ADMINISTRADOR') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default RutaAdmin
