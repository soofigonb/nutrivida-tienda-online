import { useContext } from 'react'
import { useForm } from 'react-hook-form'
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
} from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { regionesComunas } from '../data/regionesComunas'
import { obtenerFechaMinima } from '../utils/validaciones'

// ========================================
// 1. VALIDACIONES Y FORMATO
// ========================================

const regexSoloLetras = /^\p{L}+(?:\s+\p{L}+)*$/u

const regexCorreo =
  /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i

const regexTelefono = /^(?:\+56)?9\d{8}$/

function limpiarRut(rut) {
  return rut.replace(/[.\s-]/g, '').toUpperCase()
}

function formatearRut(rut) {
  const limpio = limpiarRut(rut)

  if (!/^\d{7,8}[\dK]$/.test(limpio)) {
    return rut.trim()
  }

  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)

  const cuerpoFormateado = cuerpo.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    '.',
  )

  return `${cuerpoFormateado}-${dv}`
}

function validarRutChileno(rut) {
  const limpio = limpiarRut(rut)

  if (!/^[1-9]\d{6,7}[\dK]$/.test(limpio)) {
    return false
  }

  const cuerpo = limpio.slice(0, -1)
  const dvIngresado = limpio.slice(-1)

  let suma = 0
  let multiplicador = 2

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }

  const resultado = 11 - (suma % 11)

  const dvEsperado =
    resultado === 11
      ? '0'
      : resultado === 10
        ? 'K'
        : String(resultado)

  return dvIngresado === dvEsperado
}

function validarNombre(valor) {
  const texto = valor.trim()

  if (texto.length < 2) {
    return 'Ingresa al menos 2 caracteres.'
  }

  return (
    regexSoloLetras.test(texto) ||
    'Utiliza solo letras y espacios entre palabras.'
  )
}

function validarFechaNacimiento(valor) {
  if (!valor) return true

  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return 'Ingresa una fecha válida.'
  }

  const [anio, mes, dia] = valor.split('-').map(Number)
  const fecha = new Date(anio, mes - 1, dia)

  const fechaValida =
    anio >= 1900 &&
    fecha.getFullYear() === anio &&
    fecha.getMonth() === mes - 1 &&
    fecha.getDate() === dia

  if (!fechaValida) {
    return 'Ingresa una fecha válida desde el año 1900.'
  }

  return (
    valor <= obtenerFechaMinima() ||
    'La fecha de nacimiento no puede ser futura.'
  )
}

// ========================================
// 2. CONFIGURACIÓN DEL FORMULARIO
// ========================================

function Registro() {
  const { registrarPaciente } = useContext(AuthContext)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onTouched',
    defaultValues: {
      nombre: '',
      apellidos: '',
      rut: '',
      correo: '',
      telefono: '',
      direccion: '',
      fechaNacimiento: '',
      region: '',
      comuna: '',
      password: '',
      confirmPassword: '',
    },
  })

  const regionSeleccionada = watch('region')

  const regionEncontrada = regionesComunas.find(
    (region) => region.region === regionSeleccionada,
  )

  const comunasDisponibles = regionEncontrada?.comunas || []

  // ========================================
  // 3. PROCESAR EL REGISTRO
  // ========================================

  function procesarRegistro(data) {
    clearErrors('root')

    const run = limpiarRut(data.rut)

    const nuevoPaciente = {
      nombre: data.nombre.trim().replace(/\s+/g, ' '),
      apellidos: data.apellidos.trim().replace(/\s+/g, ' '),
      run,
      rut: run,
      correo: data.correo.trim().toLowerCase(),
      telefono: data.telefono.trim(),
      direccion: data.direccion.trim(),
      fechaNacimiento: data.fechaNacimiento,
      region: data.region,
      comuna: data.comuna,
      contrasena: data.password,
      password: data.password,
      rol: 'paciente',
    }

    try {
      const resultado = registrarPaciente(nuevoPaciente)

      if (!resultado?.exito) {
        let campo = 'root'

        if (
          resultado?.campo === 'run' ||
          resultado?.campo === 'rut'
        ) {
          campo = 'rut'
        } else if (resultado?.campo === 'correo') {
          campo = 'correo'
        }

        setError(
          campo,
          {
            type: 'manual',
            message:
              resultado?.mensaje ||
              'No fue posible completar el registro.',
          },
          { shouldFocus: campo !== 'root' },
        )

        return
      }

      navigate('/login')
    } catch {
      setError('root', {
        type: 'manual',
        message:
          'No fue posible guardar el registro. Inténtalo nuevamente.',
      })
    }
  }

  // ========================================
  // 4. INTERFAZ
  // ========================================

  return (
    <main className="registro-main pagina-gestion">
      <Container>
        <div className="seccion-encabezado">
          <p className="seccion-etiqueta">Únete a NutriVida</p>

          <h1 className="seccion-titulo">
            Registro de Paciente
          </h1>

          <p className="seccion-descripcion">
            Crea tu cuenta para comenzar a gestionar tus consultas
            nutricionales.
          </p>
        </div>

        <Row className="justify-content-center">
          <Col xs={12} lg={10} xl={8}>
            <Card className="gestion-tarjeta">
              <Card.Body className="gestion-tarjeta-cuerpo">
                <p className="gestion-ayuda mb-4">
                  Completa tus datos. Los campos con * son obligatorios.
                </p>

                <Form
                  className="registro-formulario"
                  noValidate
                  onSubmit={handleSubmit(procesarRegistro)}
                  onChange={() => clearErrors('root')}
                >
                  {/* Nombre */}
                  <Form.Group
                    className="mb-3 registro-campo-mitad"
                    controlId="controlIdNombre"
                  >
                    <Form.Label>Nombre *</Form.Label>

                    <Form.Control
                      type="text"
                      placeholder="Ej: Juan"
                      autoComplete="given-name"
                      maxLength={50}
                      aria-required="true"
                      aria-describedby="error-nombre"
                      isInvalid={Boolean(errors.nombre)}
                      {...register('nombre', {
                        required: 'El nombre es obligatorio.',
                        validate: validarNombre,
                        maxLength: {
                          value: 50,
                          message: 'Máximo 50 caracteres.',
                        },
                      })}
                    />

                    <Form.Control.Feedback
                      type="invalid"
                      id="error-nombre"
                    >
                      {errors.nombre?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Apellidos */}
                  <Form.Group
                    className="mb-3 registro-campo-mitad"
                    controlId="controlIdApellidos"
                  >
                    <Form.Label>Apellidos *</Form.Label>

                    <Form.Control
                      type="text"
                      placeholder="Ej: González Pérez"
                      autoComplete="family-name"
                      maxLength={100}
                      aria-required="true"
                      aria-describedby="error-apellidos"
                      isInvalid={Boolean(errors.apellidos)}
                      {...register('apellidos', {
                        required: 'Los apellidos son obligatorios.',
                        validate: validarNombre,
                        maxLength: {
                          value: 100,
                          message: 'Máximo 100 caracteres.',
                        },
                      })}
                    />

                    <Form.Control.Feedback
                      type="invalid"
                      id="error-apellidos"
                    >
                      {errors.apellidos?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* RUN */}
                  <Form.Group
                    className="mb-3 registro-campo-mitad"
                    controlId="controlIdRut"
                  >
                    <Form.Label>RUN *</Form.Label>

                    <Form.Control
                      type="text"
                      placeholder="Ej: 12.345.678-5"
                      autoComplete="off"
                      maxLength={12}
                      aria-required="true"
                      aria-describedby="error-rut"
                      isInvalid={Boolean(errors.rut)}
                      {...register('rut', {
                        required: 'El RUN es obligatorio.',
                        validate: (valor) =>
                          validarRutChileno(valor) ||
                          'RUN inválido. Revisa el formato y el dígito verificador.',
                        onBlur: (event) => {
                          setValue(
                            'rut',
                            formatearRut(event.target.value),
                            { shouldValidate: true },
                          )
                        },
                      })}
                    />

                    <Form.Control.Feedback
                      type="invalid"
                      id="error-rut"
                    >
                      {errors.rut?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Fecha de nacimiento */}
                  <Form.Group
                    className="mb-3 registro-campo-mitad"
                    controlId="controlIdFechaNacimiento"
                  >
                    <Form.Label>
                      Fecha de Nacimiento (Opcional)
                    </Form.Label>

                    <Form.Control
                      type="date"
                      min="1900-01-01"
                      max={obtenerFechaMinima()}
                      autoComplete="bday"
                      aria-describedby="error-fecha-nacimiento"
                      isInvalid={Boolean(errors.fechaNacimiento)}
                      {...register('fechaNacimiento', {
                        validate: validarFechaNacimiento,
                      })}
                    />

                    <Form.Control.Feedback
                      type="invalid"
                      id="error-fecha-nacimiento"
                    >
                      {errors.fechaNacimiento?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Correo */}
                  <Form.Group
                    className="mb-3"
                    controlId="controlIdCorreo"
                  >
                    <Form.Label>Correo Electrónico *</Form.Label>

                    <Form.Control
                      type="email"
                      placeholder="ejemplo@duoc.cl"
                      autoComplete="email"
                      maxLength={100}
                      aria-required="true"
                      aria-describedby="ayuda-correo error-correo"
                      isInvalid={Boolean(errors.correo)}
                      {...register('correo', {
                        required: 'El correo es obligatorio.',
                        validate: (valor) =>
                          regexCorreo.test(valor.trim()) ||
                          'Utiliza un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.',
                        maxLength: {
                          value: 100,
                          message: 'Máximo 100 caracteres.',
                        },
                      })}
                    />

                    <Form.Control.Feedback
                      type="invalid"
                      id="error-correo"
                    >
                      {errors.correo?.message}
                    </Form.Control.Feedback>

                    <Form.Text id="ayuda-correo">
                      Dominios permitidos: @duoc.cl,
                      @profesor.duoc.cl y @gmail.com.
                    </Form.Text>
                  </Form.Group>

                  {/* Teléfono */}
                  <Form.Group
                    className="mb-3"
                    controlId="controlIdTelefono"
                  >
                    <Form.Label>Teléfono *</Form.Label>

                    <Form.Control
                      type="tel"
                      placeholder="912345678 o +56912345678"
                      autoComplete="tel"
                      maxLength={12}
                      aria-required="true"
                      aria-describedby="error-telefono"
                      isInvalid={Boolean(errors.telefono)}
                      {...register('telefono', {
                        required: 'El teléfono es obligatorio.',
                        validate: (valor) =>
                          regexTelefono.test(valor.trim()) ||
                          'Ingresa un celular válido: 912345678 o +56912345678.',
                      })}
                    />

                    <Form.Control.Feedback
                      type="invalid"
                      id="error-telefono"
                    >
                      {errors.telefono?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Contraseña */}
                  <Form.Group
                    className="mb-3 registro-campo-mitad"
                    controlId="controlIdPassword"
                  >
                    <Form.Label>Contraseña *</Form.Label>

                    <Form.Control
                      type="password"
                      autoComplete="new-password"
                      aria-required="true"
                      aria-describedby="ayuda-password error-password"
                      isInvalid={Boolean(errors.password)}
                      {...register('password', {
                        required: 'La contraseña es obligatoria.',
                        minLength: {
                          value: 6,
                          message: 'Utiliza al menos 6 caracteres.',
                        },
                        validate: (valor) =>
                          valor.trim().length > 0 ||
                          'La contraseña no puede contener solo espacios.',
                        deps: ['confirmPassword'],
                      })}
                    />

                    <Form.Control.Feedback
                      type="invalid"
                      id="error-password"
                    >
                      {errors.password?.message}
                    </Form.Control.Feedback>

                    <Form.Text id="ayuda-password">
                      Mínimo 6 caracteres.
                    </Form.Text>
                  </Form.Group>

                  {/* Confirmación de contraseña */}
                  <Form.Group
                    className="mb-4 registro-campo-mitad"
                    controlId="controlIdConfirmPassword"
                  >
                    <Form.Label>Confirmar Contraseña *</Form.Label>

                    <Form.Control
                      type="password"
                      autoComplete="new-password"
                      aria-required="true"
                      aria-describedby="error-confirm-password"
                      isInvalid={Boolean(errors.confirmPassword)}
                      {...register('confirmPassword', {
                        required: 'Confirma tu contraseña.',
                        validate: (valor) =>
                          valor === getValues('password') ||
                          'Las contraseñas no coinciden.',
                      })}
                    />

                    <Form.Control.Feedback
                      type="invalid"
                      id="error-confirm-password"
                    >
                      {errors.confirmPassword?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Región y comuna */}
                  <Row>
                    <Col xs={12} md={6}>
                      <Form.Group
                        className="mb-3"
                        controlId="controlIdRegion"
                      >
                        <Form.Label>Región *</Form.Label>

                        <Form.Select
                          aria-required="true"
                          aria-describedby="error-region"
                          isInvalid={Boolean(errors.region)}
                          {...register('region', {
                            required: 'Selecciona una región.',
                            validate: (valor) =>
                              regionesComunas.some(
                                (region) => region.region === valor,
                              ) || 'Selecciona una región válida.',
                            onChange: () => {
                              setValue('comuna', '', {
                                shouldDirty: true,
                              })
                              clearErrors('comuna')
                            },
                          })}
                        >
                          <option value="">Seleccione...</option>

                          {regionesComunas.map((region) => (
                            <option
                              key={region.region}
                              value={region.region}
                            >
                              {region.region}
                            </option>
                          ))}
                        </Form.Select>

                        <Form.Control.Feedback
                          type="invalid"
                          id="error-region"
                        >
                          {errors.region?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                      <Form.Group
                        className="mb-3"
                        controlId="controlIdComuna"
                      >
                        <Form.Label>Comuna *</Form.Label>

                        <Form.Select
                          disabled={!regionSeleccionada}
                          aria-required="true"
                          aria-describedby="error-comuna"
                          isInvalid={Boolean(errors.comuna)}
                          {...register('comuna', {
                            required: 'Selecciona una comuna.',
                            validate: (valor) =>
                              comunasDisponibles.includes(valor) ||
                              'Selecciona una comuna de la región elegida.',
                          })}
                        >
                          <option value="">Seleccione...</option>

                          {comunasDisponibles.map((comuna) => (
                            <option key={comuna} value={comuna}>
                              {comuna}
                            </option>
                          ))}
                        </Form.Select>

                        <Form.Control.Feedback
                          type="invalid"
                          id="error-comuna"
                        >
                          {errors.comuna?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Dirección */}
                  <Form.Group
                    className="mb-3"
                    controlId="controlIdDireccion"
                  >
                    <Form.Label>Dirección *</Form.Label>

                    <Form.Control
                      type="text"
                      placeholder="Ej: Avenida Alemania 123"
                      autoComplete="street-address"
                      maxLength={300}
                      aria-required="true"
                      aria-describedby="error-direccion"
                      isInvalid={Boolean(errors.direccion)}
                      {...register('direccion', {
                        required: 'La dirección es obligatoria.',
                        validate: (valor) =>
                          valor.trim().length >= 5 ||
                          'La dirección debe tener al menos 5 caracteres.',
                        maxLength: {
                          value: 300,
                          message: 'Máximo 300 caracteres.',
                        },
                      })}
                    />

                    <Form.Control.Feedback
                      type="invalid"
                      id="error-direccion"
                    >
                      {errors.direccion?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Errores generales */}
                  <div aria-live="polite" aria-atomic="true">
                    {errors.root && (
                      <Alert variant="danger">
                        {errors.root.message}
                      </Alert>
                    )}
                  </div>

                  <Button
                    variant="success"
                    type="submit"
                    className="w-100"
                    disabled={isSubmitting}
                  >
                    <i
                      className="bi bi-person-plus me-2"
                      aria-hidden="true"
                    />

                    {isSubmitting
                      ? 'Registrando...'
                      : 'Registrar paciente'}
                  </Button>
                </Form>

                <p className="gestion-pie-formulario">
                  ¿Ya tienes una cuenta?{' '}
                  <Link to="/login">Inicia sesión aquí</Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  )
}

export default Registro