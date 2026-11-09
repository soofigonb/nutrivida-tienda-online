import { useContext, useEffect, useState } from 'react'
import { Alert, Button, Container, Form, Table } from 'react-bootstrap'
import { AuthContext } from '../context/AuthContext'
import { api } from '../services/api'

function CuentaFila({ cuenta, propia, guardar }) {
  const [rol, setRol] = useState(cuenta.rol)
  const [estado, setEstado] = useState(cuenta.estado)
  const [ocupada, setOcupada] = useState(false)
  async function enviar() { setOcupada(true); try { await guardar(cuenta.id, rol, estado) } finally { setOcupada(false) } }
  return <tr><td>{cuenta.correo}{propia ? ' (tu cuenta)' : ''}</td><td>
    <Form.Select aria-label={`Rol de ${cuenta.correo}`} value={rol} disabled={propia || ocupada} onChange={e => setRol(e.target.value)}>
      {['ADMINISTRADOR', 'VENDEDOR', 'CLIENTE'].map(r => <option key={r}>{r}</option>)}
    </Form.Select></td><td><Form.Select aria-label={`Estado de ${cuenta.correo}`} value={estado} disabled={propia || ocupada} onChange={e => setEstado(e.target.value)}>
      {['PENDIENTE', 'ACTIVO', 'BLOQUEADO', 'INACTIVO'].map(e => <option key={e}>{e}</option>)}
    </Form.Select></td><td><Button disabled={propia || ocupada} onClick={enviar}>Guardar permisos</Button></td></tr>
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

  return <Container className="py-4"><h1>Cuentas de acceso</h1>
    <p>Administra roles y estados. Los datos personales de los pacientes se gestionan por separado.</p>
    {error && <Alert variant="danger">{error}</Alert>}{mensaje && <Alert variant="success">{mensaje}</Alert>}
    <Form onSubmit={crear} className="border rounded p-3 mb-4">
      <h2 className="h5">Crear cuenta</h2>
      <Form.Label htmlFor="nueva-cuenta-correo">Correo</Form.Label><Form.Control id="nueva-cuenta-correo" type="email" name="correo" maxLength={100} required autoComplete="off" />
      <Form.Label htmlFor="nueva-cuenta-password" className="mt-2">Contraseña inicial</Form.Label><Form.Control id="nueva-cuenta-password" type="password" name="password" minLength={6} maxLength={72} required autoComplete="new-password" />
      <Form.Label htmlFor="nueva-cuenta-rol" className="mt-2">Rol</Form.Label><Form.Select id="nueva-cuenta-rol" name="rol" defaultValue="CLIENTE">{['CLIENTE', 'VENDEDOR', 'ADMINISTRADOR'].map(r => <option key={r}>{r}</option>)}</Form.Select>
      <Button className="mt-3" type="submit" disabled={creando}>{creando ? 'Creando…' : 'Crear cuenta'}</Button>
    </Form>
    {!cuentas && !error && <p role="status">Cargando cuentas…</p>}
    {cuentas && <Table responsive><thead><tr><th>Correo</th><th>Rol</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{cuentas.map(c => <CuentaFila key={`${c.id}-${c.rol}-${c.estado}`} cuenta={c} propia={c.id === usuario.id} guardar={guardar} />)}</tbody></Table>}
  </Container>
}
