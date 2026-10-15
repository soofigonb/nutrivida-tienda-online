import {
  BrowserRouter,
  Link,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'

import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ScrollNavegacion from './components/ScrollNavegacion.jsx'

import Inicio from './pages/Inicio.jsx'
import Agendar from './pages/Agendar.jsx'
import Carrito from './pages/Carrito.jsx'
import Registro from './pages/Registro.jsx'
import Login from './pages/Login.jsx'
import BlogDetalle1 from './pages/BlogDetalle1.jsx'
import BlogDetalle2 from './pages/BlogDetalle2.jsx'

import RutaAdmin from './components/RutaAdmin.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import AdminHome from './pages/AdminHome.jsx'
import AdminPacientes from './pages/AdminPacientes.jsx'
import AdminNutricionistas from './pages/AdminNutricionistas.jsx'
import AdminFormPaciente from './pages/AdminFormPaciente.jsx'
import AdminFormNutricionista from './pages/AdminFormNutricionista.jsx'

import { CarritoProvider } from './context/CarritoContext.jsx'
import { DatosProvider } from './context/DatosContext.jsx'

import './App.css'
import './styles/Admin.css'

// ========================================
// 1. DISTRIBUCIÓN DEL SITIO PÚBLICO
// ========================================

function SitioPublico() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

// ========================================
// 2. PÁGINA NO ENCONTRADA
// ========================================

function PaginaNoEncontrada() {
  return (
    <main className="container py-5">
      <h1>Página no encontrada</h1>

      <p>La página que buscas no está disponible.</p>

      <Link to="/" className="btn btn-outline-success">
        Volver al inicio
      </Link>
    </main>
  )
}

// ========================================
// 3. RUTAS Y CONTEXTOS
// ========================================

function App() {
  return (
    <BrowserRouter>
      <DatosProvider>
        <CarritoProvider>
          <ScrollNavegacion />

          <Routes>
            {/* Páginas con navbar y footer públicos */}
            <Route element={<SitioPublico />}>
              <Route path="/" element={<Inicio />} />

              <Route path="/agendar" element={<Agendar />} />

              <Route path="/carrito" element={<Carrito />} />

              <Route path="/login" element={<Login />} />

              <Route path="/registro" element={<Registro />} />

              <Route
                path="/blogs/alimentacion-antiinflamatoria"
                element={<BlogDetalle1 />}
              />

              <Route
                path="/blogs/hidratacion-deportiva"
                element={<BlogDetalle2 />}
              />

              <Route
                path="*"
                element={<PaginaNoEncontrada />}
              />
            </Route>

            {/* Panel protegido con menú propio */}
            <Route element={<RutaAdmin />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminHome />} />

                <Route
                  path="pacientes"
                  element={<AdminPacientes />}
                />

                <Route
                  path="pacientes/nuevo"
                  element={<AdminFormPaciente />}
                />

                <Route
                  path="pacientes/:id/editar"
                  element={<AdminFormPaciente />}
                />

                <Route
                  path="nutricionistas"
                  element={<AdminNutricionistas />}
                />

                <Route
                  path="nutricionistas/nuevo"
                  element={<AdminFormNutricionista />}
                />

                <Route
                  path="nutricionistas/:id/editar"
                  element={<AdminFormNutricionista />}
                />
              </Route>
            </Route>
          </Routes>
        </CarritoProvider>
      </DatosProvider>
    </BrowserRouter>
  )
}

export default App