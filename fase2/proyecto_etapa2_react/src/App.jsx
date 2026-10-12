import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Inicio from './pages/Inicio.jsx'
import BlogDetalle1 from './pages/BlogDetalle1.jsx'
import BlogDetalle2 from './pages/BlogDetalle2.jsx'
import Footer from './components/Footer.jsx'
import './App.css'

function PaginaPendiente({ titulo }) {
  return (
    <main className="container py-5">
      <h1>{titulo}</h1>
      <p>Esta página está en desarrollo.</p>

      <Link to="/" className="btn btn-outline-success">
        Volver al inicio
      </Link>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Inicio />} />

        <Route
          path="/agendar"
          element={<PaginaPendiente titulo="Agendar una cita" />}
        />

        <Route
          path="/blogs/alimentacion-antiinflamatoria"
          element={<BlogDetalle1 />}
        />

        <Route
          path="/blogs/hidratacion-deportiva"
          element={<BlogDetalle2 />}
        />

        <Route
          path="/login"
          element={<PaginaPendiente titulo="Iniciar sesión" />}
        />

        <Route
          path="/registro"
          element={<PaginaPendiente titulo="Registro" />}
        />

        <Route
          path="/carrito"
          element={<PaginaPendiente titulo="Carrito" />}
        />

        <Route
          path="*"
          element={<PaginaPendiente titulo="Página no encontrada" />}
        />

      </Routes>
      <Footer />

    </BrowserRouter>
  )
}

export default App