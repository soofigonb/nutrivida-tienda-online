import { useState } from 'react'
import { Alert, Button, Card, Container, Form } from 'react-bootstrap'
import { useRecursoApi } from '../hooks/useRecursoApi'
import { cancelarCita, reprogramarCita } from '../services/agendamiento'

function Cita({ cita, recargar }) {
  const [editando, setEditando] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState('')

  async function guardar(evento) {
    evento.preventDefault()
    const { fecha, hora } = Object.fromEntries(new FormData(evento.currentTarget))
    await ejecutar(() => reprogramarCita(cita.reservaId, { ...cita, fecha, hora }))
  }

  async function ejecutar(operacion) {
    setError('')
    setOcupado(true)
    try {
      await operacion()
      recargar()
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setOcupado(false)
    }
  }

  return <Card body className="mb-3">
    <h2 className="h5">{cita.servicio}</h2>
    <p>{cita.nutricionistaNombre} · {cita.fecha} · {cita.hora} · {cita.estado}</p>
    {error && <Alert variant="danger">{error}</Alert>}
    {editando ? <Form onSubmit={guardar}>
      <Form.Group controlId={`fecha-cita-${cita.reservaId}`}>
        <Form.Label>Fecha</Form.Label>
        <Form.Control name="fecha" type="date" defaultValue={cita.fecha} required />
      </Form.Group>
      <Form.Group controlId={`hora-cita-${cita.reservaId}`}>
        <Form.Label>Horario</Form.Label>
        <Form.Select name="hora" defaultValue={cita.hora}>
          {['09:00', '11:00', '15:00', '17:00'].map(hora => <option key={hora}>{hora}</option>)}
        </Form.Select>
      </Form.Group>
      <Button type="submit" className="mt-2" disabled={ocupado}>Guardar horario</Button>
      <Button variant="link" disabled={ocupado} onClick={() => setEditando(false)}>Volver</Button>
    </Form> : <>
      <Button variant="outline-primary" disabled={ocupado} onClick={() => setEditando(true)}>Reprogramar</Button>
      <Button variant="outline-danger" className="ms-2" disabled={ocupado} onClick={() => {
        if (window.confirm('¿Cancelar esta cita?')) ejecutar(() => cancelarCita(cita.reservaId))
      }}>Cancelar cita</Button>
    </>}
  </Card>
}

export default function MisCitas() {
  const [revision, setRevision] = useState(0)
  const { datos, error } = useRecursoApi('agendamiento', revision, 'lista')
  const recargar = () => setRevision(valor => valor + 1)
  return <main className="py-5"><Container>
    <h1>Citas registradas</h1>
    {error && <Alert variant="danger">{error} <Button variant="outline-danger" onClick={recargar}>Reintentar</Button></Alert>}
    {!error && !datos && <p role="status">Cargando citas…</p>}
    {datos?.length === 0 && <p>No hay citas activas.</p>}
    {datos?.map(cita => <Cita key={cita.reservaId} cita={cita} recargar={recargar} />)}
  </Container></main>
}
