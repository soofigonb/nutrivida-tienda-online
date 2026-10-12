import { useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'

function FormularioContacto() {
  const [resultado, setResultado] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
    defaultValues: {
      nombre: '',
      correo: '',
      mensaje: '',
    },
  })

  // Se ejecuta únicamente cuando todos los campos son válidos.
  function procesarContacto() {
    setResultado({
      tipo: 'success',
      texto:
        'Formulario validado correctamente. Este envío es una simulación; no se ha enviado un correo.',
    })

    reset()
  }

  // Se ejecuta cuando se intenta enviar con datos inválidos.
  function mostrarErrores() {
    setResultado({
      tipo: 'danger',
      texto: 'Revisa los campos marcados antes de continuar.',
    })
  }

  return (
    <section id="contacto" className="contacto-seccion">
      <div className="container">
        <div className="row align-items-center g-4">
          {/* Información de la clínica */}
          <div className="col-12 col-lg-5">
            <div className="contacto-informacion">
              <p className="seccion-etiqueta">
                Estamos para ayudarte
              </p>

              <h2 className="seccion-titulo">Contáctanos</h2>

              <p className="contacto-descripcion">
                Escríbenos si tienes preguntas sobre nuestros
                profesionales, planes o tipos de atención.
              </p>

              <ul className="contacto-lista">
                <li>
                  <i className="bi bi-geo-alt" aria-hidden="true" />
                  <span>Calle Manuel Montt 850, Temuco</span>
                </li>

                <li>
                  <i className="bi bi-telephone" aria-hidden="true" />
                  <a href="tel:+56912345678">
                    +56 9 1234 5678
                  </a>
                </li>

                <li>
                  <i className="bi bi-envelope" aria-hidden="true" />
                  <a href="mailto:contacto@nutrividaclinica.cl">
                    contacto@nutrividaclinica.cl
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Formulario con validaciones */}
          <div className="col-12 col-lg-7">
            <Form
              noValidate
              className="contacto-formulario"
              onSubmit={handleSubmit(
                procesarContacto,
                mostrarErrores,
              )}
              onChange={() => setResultado(null)}
            >
              {/* Nombre */}
              <Form.Group
                controlId="nombre-contacto"
                className="mb-4"
              >
                <Form.Label>Nombre</Form.Label>

                <Form.Control
                  type="text"
                  autoComplete="name"
                  maxLength={100}
                  required
                  isInvalid={Boolean(errors.nombre)}
                  aria-invalid={Boolean(errors.nombre)}
                  aria-describedby="error-nombre-contacto"
                  {...register('nombre', {
                    required: 'Ingresa tu nombre.',
                    validate: (valor) =>
                      valor.trim().length >= 2 ||
                      'El nombre debe tener al menos 2 caracteres.',
                    maxLength: {
                      value: 100,
                      message:
                        'El nombre no puede superar los 100 caracteres.',
                    },
                  })}
                />

                <Form.Control.Feedback
                  type="invalid"
                  id="error-nombre-contacto"
                >
                  {errors.nombre?.message}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Correo electrónico */}
              <Form.Group
                controlId="correo-contacto"
                className="mb-4"
              >
                <Form.Label>Correo electrónico</Form.Label>

                <Form.Control
                  type="email"
                  autoComplete="email"
                  maxLength={100}
                  required
                  isInvalid={Boolean(errors.correo)}
                  aria-invalid={Boolean(errors.correo)}
                  aria-describedby="error-correo-contacto"
                  {...register('correo', {
                    required: 'Ingresa tu correo electrónico.',
                    setValueAs: (valor) => valor.trim(),
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message:
                        'Ingresa un correo válido, por ejemplo: nombre@correo.cl.',
                    },
                    maxLength: {
                      value: 100,
                      message:
                        'El correo no puede superar los 100 caracteres.',
                    },
                  })}
                />

                <Form.Control.Feedback
                  type="invalid"
                  id="error-correo-contacto"
                >
                  {errors.correo?.message}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Mensaje */}
              <Form.Group
                controlId="mensaje-contacto"
                className="mb-4"
              >
                <Form.Label>Mensaje</Form.Label>

                <Form.Control
                  as="textarea"
                  rows={5}
                  maxLength={500}
                  required
                  isInvalid={Boolean(errors.mensaje)}
                  aria-invalid={Boolean(errors.mensaje)}
                  aria-describedby="ayuda-mensaje-contacto error-mensaje-contacto"
                  {...register('mensaje', {
                    required: 'Escribe tu mensaje.',
                    validate: (valor) =>
                      valor.trim().length >= 2 ||
                      'El mensaje debe tener al menos 2 caracteres.',
                    maxLength: {
                      value: 500,
                      message:
                        'El mensaje no puede superar los 500 caracteres.',
                    },
                  })}
                />

                <Form.Control.Feedback
                  type="invalid"
                  id="error-mensaje-contacto"
                >
                  {errors.mensaje?.message}
                </Form.Control.Feedback>

                <Form.Text id="ayuda-mensaje-contacto">
                  Máximo 500 caracteres.
                </Form.Text>
              </Form.Group>

              <Button
                type="submit"
                variant="success"
                className="contacto-boton"
              >
                Enviar mensaje
              </Button>

              {/* Resultado de la validación */}
              <div aria-live="polite" aria-atomic="true">
                {resultado && (
                  <Alert
                    variant={resultado.tipo}
                    className="mt-3 mb-0"
                  >
                    {resultado.texto}
                  </Alert>
                )}
              </div>
            </Form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FormularioContacto