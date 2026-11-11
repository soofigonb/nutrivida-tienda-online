import { useState } from 'react'
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
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

  return <Card body className="gestion-tarjeta mb-3">
    <h2 className="gestion-subtitulo">{cita.servicio}</h2>
    <p>{cita.nutricionistaNombre} · {cita.fecha} · {cita.hora} · {cita.estado}</p>
    {error && <Alert variant="danger">{error}</Alert>}
    {editando ? <Form className="border-top pt-3" onSubmit={guardar}>
      <h3 className="gestion-subtitulo mb-3">Reprogramar cita</h3>
      <Row className="g-3">
        <Form.Group as={Col} xs={12} sm={6} controlId={`fecha-cita-${cita.reservaId}`}>
          <Form.Label>Fecha</Form.Label>
          <Form.Control name="fecha" type="date" defaultValue={cita.fecha} required />
        </Form.Group>
        <Form.Group as={Col} xs={12} sm={6} controlId={`hora-cita-${cita.reservaId}`}>
          <Form.Label>Horario</Form.Label>
          <Form.Select name="hora" defaultValue={cita.hora}>
            {['09:00', '11:00', '15:00', '17:00'].map(hora => <option key={hora}>{hora}</option>)}
          </Form.Select>
        </Form.Group>
      </Row>
      <div className="d-flex flex-wrap gap-2 mt-3">
        <Button type="submit" variant="success" disabled={ocupado}>Guardar horario</Button>
        <Button type="button" variant="outline-success" disabled={ocupado} onClick={() => setEditando(false)}>Volver</Button>
      </div>
    </Form> : <div className="d-flex flex-wrap gap-2">
      <Button variant="outline-success" disabled={ocupado} onClick={() => setEditando(true)}>Reprogramar</Button>
      <Button variant="outline-success" disabled={ocupado} onClick={() => {
        if (window.confirm('¿Cancelar esta cita?')) ejecutar(() => cancelarCita(cita.reservaId))
      }}>Cancelar cita</Button>
    </div>}
  </Card>
}

export default function MisCitas() {
  const [revision, setRevision] = useState(0)
  const { datos, error } = useRecursoApi('agendamiento', revision, 'lista')
  const recargar = () => setRevision(valor => valor + 1)
  return <main className="pagina-gestion py-5"><Container>
    <h1 className="seccion-titulo">Mis citas</h1>
    {error && <Alert variant="danger">{error} <Button variant="outline-success" onClick={recargar}>Reintentar</Button></Alert>}
    {!error && !datos && <p role="status">Cargando citas…</p>}
    {datos?.length === 0 && <p>No hay citas activas.</p>}
    {datos?.map(cita => <Cita key={cita.reservaId} cita={cita} recargar={recargar} />)}
  </Container></main>
}
