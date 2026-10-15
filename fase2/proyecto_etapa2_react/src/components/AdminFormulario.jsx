import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import {
  Alert,
  Button,
  Card,
  Form,
} from 'react-bootstrap'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { useDatos } from '../context/DatosContext'
import { regionesComunas } from '../data/regionesComunas'
import fotografias from '../data/nutricionistas'
import { obtenerFechaMinima } from '../utils/validaciones'

import {
  validarRun,
  correoPermitido,
  soloLetras,
  telefonoChileno,
  fechaNacimientoValida,
} from '../utils/validacionesAdmin'

function AdminFormulario({ tipo }) {
  // ========================================
  // 1. DATOS Y NAVEGACIÓN
  // ========================================

  const { id } = useParams()
  const navigate = useNavigate()

  const {
    pacientes,
    nutricionistas,
    guardarPaciente,
    guardarNutricionista,
  } = useDatos()

  const esPaciente = tipo === 'pacientes'

  const registros = esPaciente
    ? pacientes
    : nutricionistas

  const registro = registros.find(
    (item) => String(item.id) === String(id),
  )

  const [errorGeneral, setErrorGeneral] =
    useState('')

  // ========================================
  // 2. CONFIGURACIÓN DEL FORMULARIO
  // ========================================

  const {
    register,
    handleSubmit,
    control,
    setValue,
    clearErrors,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    mode: 'onTouched',
    defaultValues: esPaciente
      ? {
          nombre: registro?.nombre || '',
          apellidos: registro?.apellidos || '',
          run: registro?.run || registro?.rut || '',
          correo: registro?.correo || '',
          telefono: registro?.telefono || '',
          direccion: registro?.direccion || '',
          fechaNacimiento:
            registro?.fechaNacimiento || '',
          region: registro?.region || '',
          comuna: registro?.comuna || '',
          password: '',
        }
      : {
          nombre: registro?.nombre || '',
          especialidad:
            registro?.especialidad || '',
          experiencia:
            registro?.experiencia || '',
          modalidad: registro?.modalidad || '',
          foto: registro?.foto || '',
        },
  })

  const region = useWatch({
    control,
    name: 'region',
  })

  const foto = useWatch({
    control,
    name: 'foto',
  })

  const comunas =
    regionesComunas.find(
      (item) => item.region === region,
    )?.comunas || []

  if (id && !registro) {
    return (
      <Alert variant="warning">
        El registro solicitado no existe.{' '}
        <Link to={`/admin/${tipo}`}>
          Volver al listado
        </Link>
      </Alert>
    )
  }

  // ========================================
  // 3. CAMPOS Y VALIDACIONES DE PACIENTES
  // ========================================

  const camposPaciente = [
    {
      nombre: 'nombre',
      etiqueta: 'Nombre',
      mitad: true,
      max: 50,
      reglas: {
        required: 'Ingresa el nombre.',
        validate: (valor) =>
          (
            valor.trim().length >= 2 &&
            soloLetras.test(valor.trim())
          ) ||
          'Utiliza al menos 2 caracteres y solo letras y espacios.',
      },
    },
    {
      nombre: 'apellidos',
      etiqueta: 'Apellidos',
      mitad: true,
      max: 100,
      reglas: {
        required: 'Ingresa los apellidos.',
        validate: (valor) =>
          (
            valor.trim().length >= 2 &&
            soloLetras.test(valor.trim())
          ) ||
          'Utiliza letras y espacios.',
      },
    },
    {
      nombre: 'run',
      etiqueta: 'RUN',
      mitad: true,
      max: 12,
      reglas: {
        required: 'Ingresa el RUN.',
        validate: (valor) =>
          validarRun(valor) ||
          'RUN inválido. Revisa su dígito verificador.',
      },
    },
    {
      nombre: 'fechaNacimiento',
      etiqueta: 'Fecha de nacimiento (opcional)',
      tipo: 'date',
      mitad: true,
      opcional: true,
      reglas: {
        validate: (valor) =>
          fechaNacimientoValida(valor) ||
          'Ingresa una fecha válida entre 1900 y hoy.',
      },
    },
    {
      nombre: 'correo',
      etiqueta: 'Correo electrónico',
      tipo: 'email',
      max: 100,
      ayuda:
        'Dominios permitidos: @duoc.cl, @profesor.duoc.cl y @gmail.com.',
      reglas: {
        required: 'Ingresa el correo.',
        validate: (valor) =>
          correoPermitido.test(valor.trim()) ||
          'El dominio del correo no está permitido.',
      },
    },
    {
      nombre: 'telefono',
      etiqueta: 'Teléfono',
      tipo: 'tel',
      max: 12,
      reglas: {
        required: 'Ingresa el teléfono.',
        validate: (valor) =>
          telefonoChileno.test(valor.trim()) ||
          'Utiliza 912345678 o +56912345678.',
      },
    },
    {
      nombre: 'region',
      etiqueta: 'Región',
      mitad: true,
      opciones: regionesComunas.map((item) => ({
        valor: item.region,
        etiqueta: item.region,
      })),
      reglas: {
        required: 'Selecciona la región.',
        onChange: () => {
          setValue('comuna', '', {
            shouldDirty: true,
          })
          clearErrors('comuna')
        },
      },
    },
    {
      nombre: 'comuna',
      etiqueta: 'Comuna',
      mitad: true,
      deshabilitado: !region,
      opciones: comunas.map((comuna) => ({
        valor: comuna,
        etiqueta: comuna,
      })),
      reglas: {
        required: 'Selecciona la comuna.',
        validate: (valor) =>
          comunas.includes(valor) ||
          'Selecciona una comuna de la región.',
      },
    },
    {
      nombre: 'direccion',
      etiqueta: 'Dirección',
      max: 300,
      reglas: {
        required: 'Ingresa la dirección.',
        validate: (valor) =>
          valor.trim().length >= 5 ||
          'Ingresa al menos 5 caracteres.',
      },
    },
    {
      nombre: 'password',
      etiqueta: id
        ? 'Nueva contraseña (opcional)'
        : 'Contraseña',
      tipo: 'password',
      opcional: Boolean(id),
      ayuda: id
        ? 'Deja este campo vacío para conservar la contraseña actual.'
        : 'Mínimo 6 caracteres.',
      reglas: {
        required: id
          ? false
          : 'Ingresa la contraseña.',
        validate: (valor) =>
          (!valor && Boolean(id)) ||
          (
            valor.length >= 6 &&
            Boolean(valor.trim())
          ) ||
          'Utiliza al menos 6 caracteres; no solo espacios.',
      },
    },
  ]

  // ========================================
  // 4. CAMPOS DE NUTRICIONISTAS
  // ========================================

  const camposNutricionista = [
    {
      nombre: 'nombre',
      etiqueta: 'Nombre profesional',
      max: 100,
      reglas: {
        required: 'Ingresa el nombre.',
        validate: (valor) =>
          valor.trim().length >= 3 ||
          'Ingresa al menos 3 caracteres.',
      },
    },
    {
      nombre: 'especialidad',
      etiqueta: 'Especialidad',
      max: 150,
      reglas: {
        required: 'Ingresa la especialidad.',
        validate: (valor) =>
          valor.trim().length >= 3 ||
          'Ingresa al menos 3 caracteres.',
      },
    },
    {
      nombre: 'experiencia',
      etiqueta: 'Experiencia y descripción',
      tipo: 'textarea',
      max: 500,
      reglas: {
        required: 'Ingresa una descripción.',
        validate: (valor) =>
          valor.trim().length >= 10 ||
          'Ingresa al menos 10 caracteres.',
      },
    },
    {
      nombre: 'modalidad',
      etiqueta: 'Modalidad',
      opciones: [
        'Presencial',
        'Online',
        'Presencial y online',
      ].map((valor) => ({
        valor,
        etiqueta: valor,
      })),
      reglas: {
        required: 'Selecciona la modalidad.',
      },
    },
    {
      nombre: 'foto',
      etiqueta: 'Fotografía del catálogo',
      opciones: fotografias.map((item, index) => ({
        valor: item.foto,
        etiqueta: `Fotografía ${index + 1}`,
      })),
      reglas: {
        required: 'Selecciona una fotografía.',
      },
    },
  ]

  const campos = esPaciente
    ? camposPaciente
    : camposNutricionista

  // ========================================
  // 5. GUARDAR EL REGISTRO
  // ========================================

  function enviar(valores) {
    const resultado = esPaciente
      ? guardarPaciente(valores, id)
      : guardarNutricionista(valores, id)

    if (!resultado.exito) {
      setErrorGeneral(resultado.mensaje)
      return
    }

    navigate(`/admin/${tipo}`, {
      replace: true,
      state: {
        mensaje: `Registro ${
          id ? 'actualizado' : 'creado'
        } correctamente.`,
      },
    })
  }

  // ========================================
  // 6. INTERFAZ DEL FORMULARIO
  // ========================================

  return (
    <section
      aria-labelledby="titulo-formulario-admin"
      className="admin-formulario-contenedor"
    >
      <h2
        id="titulo-formulario-admin"
        className="gestion-subtitulo mb-4"
      >
        {id ? 'Editar' : 'Agregar'}{' '}
        {esPaciente ? 'paciente' : 'nutricionista'}
      </h2>

      <Card className="gestion-tarjeta">
        <Card.Body className="gestion-tarjeta-cuerpo">
          <p className="gestion-ayuda">
            Los campos con * son obligatorios.
          </p>

          <Form
            noValidate
            onSubmit={handleSubmit(enviar)}
            onChange={() => setErrorGeneral('')}
            className="admin-formulario"
          >
            {campos.map((campo) => {
              const error = errors[campo.nombre]

              const errorId =
                `error-admin-${campo.nombre}`

              const ayudaId =
                `ayuda-admin-${campo.nombre}`

              const reglas = {
                ...campo.reglas,
                ...(campo.max
                  ? {
                      maxLength: {
                        value: campo.max,
                        message:
                          `Máximo ${campo.max} caracteres.`,
                      },
                    }
                  : {}),
              }

              const propiedades = {
                ...register(campo.nombre, reglas),
                isInvalid: Boolean(error),
                'aria-invalid': Boolean(error),
                'aria-required': !campo.opcional,
                'aria-describedby':
                  `${errorId}${
                    campo.ayuda ? ` ${ayudaId}` : ''
                  }`,
              }

              return (
                <Form.Group
                  key={campo.nombre}
                  controlId={`admin-${campo.nombre}`}
                  className={`mb-3 ${
                    campo.mitad
                      ? 'admin-campo-mitad'
                      : ''
                  }`}
                >
                  <Form.Label>
                    {campo.etiqueta}
                    {campo.opcional ? '' : ' *'}
                  </Form.Label>

                  {campo.opciones ? (
                    <Form.Select
                      {...propiedades}
                      disabled={campo.deshabilitado}
                    >
                      <option value="">
                        Seleccione...
                      </option>

                      {campo.opciones.map(
                        (opcion) => (
                          <option
                            key={opcion.valor}
                            value={opcion.valor}
                          >
                            {opcion.etiqueta}
                          </option>
                        ),
                      )}
                    </Form.Select>
                  ) : (
                    <Form.Control
                      {...propiedades}
                      as={
                        campo.tipo === 'textarea'
                          ? 'textarea'
                          : 'input'
                      }
                      type={
                        campo.tipo === 'textarea'
                          ? undefined
                          : campo.tipo || 'text'
                      }
                      rows={
                        campo.tipo === 'textarea'
                          ? 4
                          : undefined
                      }
                      maxLength={campo.max}
                      min={
                        campo.tipo === 'date'
                          ? '1900-01-01'
                          : undefined
                      }
                      max={
                        campo.tipo === 'date'
                          ? obtenerFechaMinima()
                          : undefined
                      }
                      autoComplete={
                        campo.tipo === 'password'
                          ? 'new-password'
                          : undefined
                      }
                    />
                  )}

                  <Form.Control.Feedback
                    type="invalid"
                    id={errorId}
                  >
                    {error?.message}
                  </Form.Control.Feedback>

                  {campo.ayuda && (
                    <Form.Text id={ayudaId}>
                      {campo.ayuda}
                    </Form.Text>
                  )}
                </Form.Group>
              )
            })}

            {/* Vista previa de la fotografía */}
            {!esPaciente && foto && (
              <img
                src={foto}
                alt="Fotografía seleccionada"
                className="admin-foto-previa"
              />
            )}

            {/* Error de guardado */}
            <div aria-live="polite">
              {errorGeneral && (
                <Alert variant="danger">
                  {errorGeneral}
                </Alert>
              )}
            </div>

            {/* Acciones */}
            <div className="gestion-botones justify-content-start">
              <Button
                type="submit"
                variant="success"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Guardando...'
                  : 'Guardar cambios'}
              </Button>

              <Link
                to={`/admin/${tipo}`}
                className="btn btn-outline-success"
              >
                Cancelar
              </Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </section>
  )
}

export default AdminFormulario