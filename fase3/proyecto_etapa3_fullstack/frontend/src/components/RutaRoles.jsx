import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function RutaRoles({ roles }) {
  const { usuario, cargandoSesion } = useContext(AuthContext)
  if (cargandoSesion) return <p className="container py-5" role="status">Comprobando sesión…</p>
  if (!usuario) return <Navigate to="/login" replace />
  if (!roles.includes(usuario.rol)) return <Navigate to={usuario.rol === 'VENDEDOR' ? '/gestion/ordenes' : '/'} replace />
  return <Outlet />
}
