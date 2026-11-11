import { useContext, useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Form, Row } from 'react-bootstrap'
import { AuthContext } from '../context/AuthContext'
import { api } from '../services/api'

const ROLES = ['CLIENTE', 'VENDEDOR', 'ADMINISTRADOR']
const ESTADOS = ['PENDIENTE', 'ACTIVO', 'BLOQUEADO', 'INACTIVO']

function CuentaTarjeta({ cuenta, propia, guardar }) {
  const [rol, setRol] = useState(cuenta.rol)
  const [estado, setEstado] = useState(cuenta.estado)
  const [ocupada, setOcupada] = useState(false)
  async function enviar() { setOcupada(true); try { await guardar(cuenta.id, rol, estado) } finally { setOcupada(false) } }
  return <Card className="gestion-tarjeta">
    <Card.Body className="admin-panel-cuerpo">
      <div className="d-flex align-items-start gap-3 mb-3">
        <span className="admin-listado-icono"><i className="bi bi-person-circle" aria-hidden="true" /></span>
        <div className="text-break">
          <h3 className="gestion-subtitulo mb-1">{cuenta.correo}</h3>
          {propia && <Badge bg="success" pill>Tu cuenta</Badge>}
        </div>
      </div>
      <Row className="g-3 align-items-end">
        <Form.Group as={Col} xs={12} sm={6} xl={4} controlId={`rol-cuenta-${cuenta.id}`}>
          <Form.Label>Rol<span className="visually-hidden"> de {cuenta.correo}</span></Form.Label>
          <Form.Select value={rol} disabled={propia || ocupada} onChange={e => setRol(e.target.value)}>
            {ROLES.map(opcion => <option key={opcion}>{opcion}</option>)}
          </Form.Select>
        </Form.Group>
        <Form.Group as={Col} xs={12} sm={6} xl={4} controlId={`estado-cuenta-${cuenta.id}`}>
          <Form.Label>Estado<span className="visually-hidden"> de {cuenta.correo}</span></Form.Label>
          <Form.Select value={estado} disabled={propia || ocupada} onChange={e => setEstado(e.target.value)}>
            {ESTADOS.map(opcion => <option key={opcion}>{opcion}</option>)}
          </Form.Select>
        </Form.Group>
        <Col xs={12} xl={4}>
          <Button variant="outline-success" disabled={propia || ocupada} onClick={enviar}>Guardar permisos</Button>
        </Col>
      </Row>
    </Card.Body>
  </Card>
}

export default function AdminCuentas() {
  const { usuario } = useContext(AuthContext)
  const [cuentas, setCuentas] = useState(null)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [revision, setRevision] = useState(0)
  const [creando, setCreando] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    api.solicitar('autenticacion/usuarios', { signal: controller.signal }).then(setCuentas)
      .catch(e => { if (e.name !== 'AbortError') setError(e.message) })
    return () => controller.abort()
  }, [revision])

  async function guardar(id, rol, estado) {
    setError(''); setMensaje('')
    try {
      await api.solicitar(`autenticacion/usuarios/${id}`, { method: 'PUT', body: { rol, estado } })
      setMensaje('Permisos actualizados. La cuenta deberá iniciar sesión de nuevo para obtener los permisos nuevos.')
      setRevision(v => v + 1)
    } catch (e) { setError(e.message) }
  }
  async function crear(event) {
    event.preventDefault(); setCreando(true); setError(''); setMensaje('')
    const formulario = event.currentTarget
    const datos = new FormData(formulario)
    let cuenta
    try {
      // Conserva la sesión del administrador.
      cuenta = await api.registrar(String(datos.get('correo')).trim().toLowerCase(), String(datos.get('password')))
      if (datos.get('rol') !== cuenta.rol) {
        await api.solicitar(`autenticacion/usuarios/${cuenta.id}`, { method: 'PUT', body: { rol: datos.get('rol'), estado: 'ACTIVO' } })
      }
      formulario.reset(); setMensaje('Cuenta creada. Puede iniciar sesión con sus credenciales.')
    } catch (e) { setError((cuenta ? 'La cuenta fue creada con su rol inicial; falta asignarle los permisos seleccionados. ' : '') + e.message) }
    finally { setCreando(false); setRevision(v => v + 1) }
  }

  return <section className="pagina-gestion pagina-gestion-panel">
    <header className="admin-topbar">
      <div>
        <p className="admin-bienvenida">Administración de permisos</p>
        <h1 className="seccion-titulo">Cuentas de acceso</h1>
        <p className="admin-descripcion">Crea cuentas y administra sus roles y estados.</p>
      </div>
    </header>
    {error && <Alert variant="danger">{error}</Alert>}
    {mensaje && <Alert variant="success">{mensaje}</Alert>}
    <Card className="gestion-tarjeta mb-4">
      <Card.Body className="admin-panel-cuerpo">
        <div className="d-flex gap-3 align-items-start mb-4">
          <span className="admin-listado-icono"><i className="bi bi-person-plus" aria-hidden="true" /></span>
          <div>
            <h2 className="gestion-subtitulo mb-1">Nueva cuenta</h2>
            <p className="gestion-ayuda mb-0">Define las credenciales iniciales y el rol de acceso.</p>
          </div>
        </div>
        <Form onSubmit={crear}>
          <Row className="g-3">
            <Form.Group as={Col} xs={12} md={6} controlId="nueva-cuenta-correo">
              <Form.Label>Correo</Form.Label>
              <Form.Control type="email" name="correo" maxLength={100} required autoComplete="off" />
            </Form.Group>
            <Form.Group as={Col} xs={12} md={6} controlId="nueva-cuenta-password">
              <Form.Label>Contraseña inicial</Form.Label>
              <Form.Control type="password" name="password" minLength={6} maxLength={72} required autoComplete="new-password" />
            </Form.Group>
            <Form.Group as={Col} xs={12} md={6} controlId="nueva-cuenta-rol">
              <Form.Label>Rol</Form.Label>
              <Form.Select name="rol" defaultValue="CLIENTE">
                {ROLES.map(rol => <option key={rol}>{rol}</option>)}
              </Form.Select>
            </Form.Group>
          </Row>
          <div className="mt-4 pt-3 border-top">
            <Button variant="success" type="submit" disabled={creando}>{creando ? 'Creando…' : 'Crear cuenta'}</Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
    <h2 className="gestion-subtitulo mb-3">Cuentas registradas</h2>
    {!cuentas && !error && <p role="status">Cargando cuentas…</p>}
    {cuentas?.length === 0 && <p className="gestion-ayuda">No hay cuentas registradas.</p>}
    <div className="d-grid gap-3">
      {cuentas?.map(cuenta => (
        <CuentaTarjeta key={`${cuenta.id}-${cuenta.rol}-${cuenta.estado}`} cuenta={cuenta} propia={cuenta.id === usuario.id} guardar={guardar} />
      ))}
    </div>
  </section>
}
