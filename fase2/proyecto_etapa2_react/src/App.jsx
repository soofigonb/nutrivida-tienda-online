import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Inicio from './pages/Inicio.jsx'
import Agendar from './pages/Agendar.jsx'
import Carrito from './pages/Carrito.jsx'
import BlogDetalle1 from './pages/BlogDetalle1.jsx'
import BlogDetalle2 from './pages/BlogDetalle2.jsx'
import Footer from './components/Footer.jsx'
import './App.css'
import Registro from './pages/Registro'
import Login from './pages/Login'
import { CarritoProvider } from './context/CarritoContext.jsx'
import ScrollNavegacion from './components/ScrollNavegacion.jsx'

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
      <CarritoProvider>

        <ScrollNavegacion />
        <Navbar />

        <Routes>
          <Route path="/" element={<Inicio />} />

          <Route path="/agendar" element={<Agendar />} />

          <Route
            path="/blogs/alimentacion-antiinflamatoria"
            element={<BlogDetalle1 />}
          />

          <Route
            path="/blogs/hidratacion-deportiva"
            element={<BlogDetalle2 />}
          />

          <Route path="/login" element={<Login />} />

          <Route path="/registro" element={<Registro />} />

          <Route path="/carrito" element={<Carrito />} />

          <Route
            path="*"
            element={<PaginaPendiente titulo="Página no encontrada" />}
          />
        </Routes>

        <Footer />

      </CarritoProvider>
    </BrowserRouter>
  )
}

export default App