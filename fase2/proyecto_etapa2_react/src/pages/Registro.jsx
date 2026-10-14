import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { regionesComunas } from '../data/regionesComunas';

// Permite solo letras (con tildes, eñes) y espacios entre palabras
const regexSoloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*\$/;

// RegEx para correo electrónico
const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\$/;

// Formatea el RUT automáticamente a XX.XXX.XXX-X
const formatearRut = (rut) => {
  const limpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (limpio.length === 0) return '';
  if (limpio.length === 1) return limpio;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);

  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${cuerpoFormateado}-${dv}`;
};

// Función para validar RUN chileno (Módulo 11)
const validarRutChileno = (rut) => {
  if (!rut) return false;
  const limpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (limpio.length < 2) return false;

  const cuerpo = limpio.slice(0, -1);
  const dvIngresado = limpio.slice(-1);

  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  let dvEsperado = 11 - resto;

  if (dvEsperado === 11) dvEsperado = '0';
  else if (dvEsperado === 10) dvEsperado = 'K';
  else dvEsperado = dvEsperado.toString();

  return dvIngresado === dvEsperado;
};

export default function Registro() {
  const { registrarPaciente } = useContext(AuthContext);
  const navigate = useNavigate();

  const listaRegiones = Array.isArray(regionesComunas)
    ? regionesComunas
    : Object.keys(regionesComunas || {}).map((reg) => ({
        nombre: reg,
        comunas: regionesComunas[reg]
      }));

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors }
  } = useForm();

  const regionSeleccionada = watch('region');

  const onSubmit = (data) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', { type: 'manual', message: 'Las contraseñas no coinciden' });
      return;
    }

    const rutLimpio = data.rut.replace(/[\.\-\s]/g, '').toUpperCase();
    const correoLimpio = data.correo.replace(/\s+/g, '').toLowerCase();

    const resultado = registrarPaciente({
      rut: rutLimpio,
      nombre: data.nombre.trim(),
      apellidos: data.apellidos.trim(),
      correo: correoLimpio,
      telefono: data.telefono?.trim() || '',
      direccion: data.direccion?.trim() || '',
      fechaNacimiento: data.fechaNacimiento || '',
      region: data.region,
      comuna: data.comuna,
      password: data.password,
      rol: 'paciente'
    });

    if (!resultado?.exito) {
      setError(resultado?.campo || 'correo', {
        type: 'manual',
        message: resultado?.mensaje || 'Error al registrar'
      });
      return;
    }

    navigate('/login');
  };

  const regionEncontrada = listaRegiones.find(
    (r) => (r.region || r.nombre) === regionSeleccionada
  );
  const comunasDisponibles = regionEncontrada?.comunas || [];

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="text-center mb-4">Registro de Paciente</h2>
              <Form onSubmit={handleSubmit(onSubmit)}>
                
                {/* Campo Nombre */}
                <Form.Group className="mb-3" controlId="controlIdNombre">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: Juan"
                    {...register('nombre', {
                      required: 'El nombre es obligatorio',
                      validate: (val) =>
                        regexSoloLetras.test(val.trim()) ||
                        'El nombre solo debe contener letras (sin símbolos, números ni guiones)'
                    })}
                    isInvalid={!!errors.nombre}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nombre?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Campo Apellidos */}
                <Form.Group className="mb-3" controlId="controlIdApellidos">
                  <Form.Label>Apellidos *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: González Pérez"
                    {...register('apellidos', {
                      required: 'Los apellidos son obligatorios',
                      validate: {
                        soloLetras: (val) =>
                          regexSoloLetras.test(val.trim()) ||
                          'Los apellidos solo deben contener letras (sin símbolos ni números)',
                        dosApellidos: (val) => {
                          const palabras = val.trim().split(/\s+/);
                          return (
                            (palabras.length >= 2 && palabras.every((p) => p.length >= 2)) ||
                            'Debe ingresar ambos apellidos (ej. González Pérez)'
                          );
                        }
                      }
                    })}
                    isInvalid={!!errors.apellidos}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.apellidos?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* RUT */}
                <Form.Group className="mb-3" controlId="controlIdRut">
                  <Form.Label>RUT *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="12.345.678-K"
                    maxLength={12}
                    {...register('rut', {
                      required: 'El RUT es obligatorio',
                      validate: (val) =>
                        validarRutChileno(val) || 'RUT inválido (el dígito verificador no coincide)'
                    })}
                    onChange={(e) => {
                      const rutFormateado = formatearRut(e.target.value);
                      setValue('rut', rutFormateado, { shouldValidate: true });
                    }}
                    isInvalid={!!errors.rut}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.rut?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Correo Electrónico */}
                <Form.Group className="mb-3" controlId="controlIdCorreo">
                  <Form.Label>Correo Electrónico *</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="ejemplo@correo.com"
                    {...register('correo', {
                      required: 'El correo es obligatorio',
                      validate: (val) =>
                        regexCorreo.test(val.trim()) || 'Correo inválido (debe incluir @ y un dominio como .com o .cl)'
                    })}
                    isInvalid={!!errors.correo}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.correo?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Teléfono (Opcional) */}
                <Form.Group className="mb-3" controlId="controlIdTelefono">
                  <Form.Label>Teléfono (Opcional)</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="+56912345678"
                    {...register('telefono')}
                  />
                </Form.Group>

                {/* Dirección (Opcional) */}
                <Form.Group className="mb-3" controlId="controlIdDireccion">
                  <Form.Label>Dirección (Opcional)</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('direccion')}
                  />
                </Form.Group>

                {/* Fecha de Nacimiento (Opcional) */}
                <Form.Group className="mb-3" controlId="controlIdFechaNacimiento">
                  <Form.Label>Fecha de Nacimiento (Opcional)</Form.Label>
                  <Form.Control
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    {...register('fechaNacimiento')}
                  />
                </Form.Group>

                {/* Región y Comuna */}
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="controlIdRegion">
                      <Form.Label>Región *</Form.Label>
                      <Form.Select
                        {...register('region', {
                          required: 'Seleccione región',
                          onChange: () => setValue('comuna', '')
                        })}
                        isInvalid={!!errors.region}
                      >
                        <option value="">Seleccione...</option>
                        {listaRegiones.map((reg, idx) => {
                          const nombreRegion = reg.region || reg.nombre || reg;
                          return (
                            <option key={idx} value={nombreRegion}>
                              {nombreRegion}
                            </option>
                          );
                        })}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.region?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group controlId="controlIdComuna">
                      <Form.Label>Comuna *</Form.Label>
                      <Form.Select
                        {...register('comuna', { required: 'Seleccione comuna' })}
                        disabled={!regionSeleccionada}
                        isInvalid={!!errors.comuna}
                      >
                        <option value="">Seleccione...</option>
                        {comunasDisponibles.map((com, idx) => (
                          <option key={idx} value={com}>
                            {com}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.comuna?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Contraseñas */}
                <Form.Group className="mb-3" controlId="controlIdPassword">
                  <Form.Label>Contraseña *</Form.Label>
                  <Form.Control
                    type="password"
                    {...register('password', {
                      required: 'La contraseña es obligatoria',
                      minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                    })}
                    isInvalid={!!errors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="controlIdConfirmPassword">
                  <Form.Label>Confirmar Contraseña *</Form.Label>
                  <Form.Control
                    type="password"
                    {...register('confirmPassword', {
                      required: 'Confirme la contraseña'
                    })}
                    isInvalid={!!errors.confirmPassword}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mt-2">
                  Registrarse
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}