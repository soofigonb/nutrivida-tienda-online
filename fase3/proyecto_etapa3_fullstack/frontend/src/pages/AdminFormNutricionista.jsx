import { useLocation } from 'react-router-dom'
import AdminFormulario from '../components/AdminFormulario'

function AdminFormNutricionista() {
  const { pathname } = useLocation()

  return (
    <AdminFormulario
      key={pathname}
      tipo="nutricionistas"
    />
  )
}

export default AdminFormNutricionista