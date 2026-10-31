import { useLocation } from 'react-router-dom'
import AdminFormulario from '../components/AdminFormulario'

function AdminFormPaciente() {
  const { pathname } = useLocation()

  return (
    <AdminFormulario
      key={pathname}
      tipo="pacientes"
    />
  )
}

export default AdminFormPaciente