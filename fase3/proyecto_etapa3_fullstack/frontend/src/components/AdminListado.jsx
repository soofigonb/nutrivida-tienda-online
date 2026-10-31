import { useState } from 'react'
import {
  Alert,
  Button,
  Form,
  Modal,
  Table,
} from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'

import { useDatos } from '../context/DatosContext'

// ========================================
// 1. FORMATO VISUAL DEL RUN
// ========================================

function mostrarRun(valor) {
  const run = String(valor || '')
    .replace(/[.\s-]/g, '')
    .toUpperCase()

  if (run.length < 2) {
    return 'Sin informar'
  }

  const cuerpo = run
    .slice(0, -1)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `${cuerpo}-${run.slice(-1)}`
}

function AdminListado({ tipo }) {
  // ========================================
  // 2. DATOS Y ESTADOS
  // ========================================

  const {
    pacientes,
    nutricionistas,
    eliminarRegistro,
  } = useDatos()

  const location = useLocation()

  const esPaciente = tipo === 'pacientes'

  const registros = esPaciente
    ? pacientes
    : nutricionistas

  const [busqueda, setBusqueda] = useState('')
  const [seleccionado, setSeleccionado] =
    useState(null)

  const [mensaje, setMensaje] = useState(
    location.state?.mensaje
      ? {
          tipo: 'success',
          texto: location.state.mensaje,
        }
      : null,
  )

  // ========================================
  // 3. FILTRAR REGISTROS
  // ========================================

  const termino = busqueda
    .trim()
    .toLocaleLowerCase('es-CL')

  const filtrados = registros.filter((item) => {
    const valores = esPaciente
      ? [
          [item.nombre, item.apellidos]
            .filter(Boolean)
            .join(' '),
          item.run || item.rut,
          mostrarRun(item.run || item.rut),
          item.correo,
        ]
      : [
          item.nombre,
          item.especialidad,
          item.modalidad,
        ]

    return valores.some((valor) =>
      String(valor || '')
        .toLocaleLowerCase('es-CL')
        .includes(termino),
    )
  })

  // ========================================
  // 4. CONFIRMAR ELIMINACIÓN
  // ========================================

  function confirmarEliminacion() {
    if (!seleccionado) return

    const resultado = eliminarRegistro(
      tipo,
      seleccionado.id,
    )

    setMensaje({
      tipo: resultado.exito
        ? 'success'
        : 'danger',
      texto: resultado.exito
        ? 'Registro eliminado correctamente.'
        : resultado.mensaje,
    })

    setSeleccionado(null)
  }

  return (
    <section aria-labelledby={`titulo-${tipo}`}>
      {/* Mensajes de las operaciones */}
      <div aria-live="polite">
        {mensaje && (
          <Alert
            variant={mensaje.tipo}
            dismissible
            onClose={() => setMensaje(null)}
          >
            {mensaje.texto}
          </Alert>
        )}
      </div>

      {/* ========================================
          5. TARJETA DEL LISTADO
          ======================================== */}

      <div className="admin-listado-card">
        <div className="admin-listado-encabezado">
          <div>
            <h2 id={`titulo-${tipo}`}>
              {esPaciente
                ? 'Pacientes registrados'
                : 'Equipo de nutricionistas'}
            </h2>

            <p>
              {esPaciente
                ? 'Información de los pacientes almacenados en el sistema.'
                : 'Profesionales disponibles para realizar atenciones nutricionales.'}
            </p>
          </div>

          <div className="admin-listado-icono">
            <i
              className={
                esPaciente
                  ? 'bi bi-people'
                  : 'bi bi-person-badge'
              }
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Buscador */}
        <div className="admin-buscador">
          <Form.Group controlId={`buscar-${tipo}`}>
            <Form.Label>
              {esPaciente
                ? 'Buscar por nombre, RUN o correo'
                : 'Buscar por nombre, especialidad o modalidad'}
            </Form.Label>

            <Form.Control
              type="search"
              value={busqueda}
              onChange={(event) =>
                setBusqueda(event.target.value)
              }
              placeholder="Escribe para filtrar..."
            />
          </Form.Group>

          <p className="mb-0 mt-2 text-secondary">
            Mostrando {filtrados.length} de{' '}
            {registros.length} registros.
          </p>
        </div>

        {/* ========================================
            6. TABLA DE REGISTROS
            ======================================== */}

        <div className="table-responsive">
          <Table className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">
                  {esPaciente
                    ? 'Nombre completo'
                    : 'Nombre'}
                </th>

                <th scope="col">
                  {esPaciente
                    ? 'RUN'
                    : 'Especialidad'}
                </th>

                <th scope="col">
                  {esPaciente
                    ? 'Correo'
                    : 'Modalidad'}
                </th>

                {esPaciente && (
                  <>
                    <th scope="col">
                      Fecha de nacimiento
                    </th>
                    <th scope="col">Región</th>
                    <th scope="col">Comuna</th>
                    <th scope="col">Dirección</th>
                  </>
                )}

                <th
                  scope="col"
                  className="text-end"
                >
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.nombre}{' '}
                    {esPaciente ? item.apellidos : ''}
                  </td>

                  <td
                    className={
                      esPaciente
                        ? 'text-nowrap'
                        : undefined
                    }
                  >
                    {esPaciente
                      ? mostrarRun(item.run || item.rut)
                      : item.especialidad}
                  </td>

                  <td>
                    {esPaciente ? (
                      item.correo
                    ) : (
                      <span className="admin-badge-tipo">
                        {item.modalidad}
                      </span>
                    )}
                  </td>

                  {esPaciente && (
                    <>
                      <td className="text-nowrap">
                        {item.fechaNacimiento ||
                          'Sin informar'}
                      </td>

                      <td>
                        {item.region || 'Sin informar'}
                      </td>

                      <td>
                        <span className="admin-badge-tipo">
                          {item.comuna ||
                            'Sin informar'}
                        </span>
                      </td>

                      <td>
                        {item.direccion ||
                          'Sin informar'}
                      </td>
                    </>
                  )}

                  {/* Editar y eliminar */}
                  <td>
                    <div className="d-flex justify-content-end gap-2">
                      <Link
                        to={`/admin/${tipo}/${item.id}/editar`}
                        className="btn btn-outline-secondary btn-sm"
                        aria-label={`Editar ${item.nombre}`}
                        title="Editar"
                      >
                        <i
                          className="bi bi-pencil"
                          aria-hidden="true"
                        />
                      </Link>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() =>
                          setSeleccionado(item)
                        }
                        aria-label={`Eliminar ${item.nombre}`}
                        title="Eliminar"
                      >
                        <i
                          className="bi bi-trash"
                          aria-hidden="true"
                        />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtrados.length === 0 && (
                <tr>
                  <td
                    colSpan={esPaciente ? 8 : 4}
                    className="p-4 text-center"
                  >
                    No se encontraron registros.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* ========================================
          7. CONFIRMACIÓN DE ELIMINACIÓN
          ======================================== */}

      <Modal
        show={Boolean(seleccionado)}
        onHide={() => setSeleccionado(null)}
        centered
        aria-labelledby="titulo-eliminar"
      >
        <Modal.Header closeButton>
          <Modal.Title id="titulo-eliminar">
            Eliminar registro
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          ¿Deseas eliminar a {seleccionado?.nombre}?
          Esta acción no se puede deshacer. Los registros
          con citas o reservas asociadas se conservarán.
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setSeleccionado(null)}
          >
            Cancelar
          </Button>

          <Button
            variant="danger"
            onClick={confirmarEliminacion}
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  )
}

export default AdminListado