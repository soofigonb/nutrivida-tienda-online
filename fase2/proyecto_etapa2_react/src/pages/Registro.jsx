import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import * as regionesData from '../data/regionesComunas';

export default function Registro() {
  const { registrarPaciente } = useContext(AuthContext);
  const navigate = useNavigate();

  // Muestra los datos importados en la consola del navegador para verificar la estructura
  console.log('Datos importados de regiones:', regionesData);

  // Busca el arreglo de regiones dentro del módulo importado
  const regionesComunas = 
    regionesData.regionesComunas || 
    regionesData.regiones || 
    regionesData.default || 
    (Array.isArray(regionesData) ? regionesData : []);

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

    const resultado = registrarPaciente({
      rut: data.rut,
      nombre: data.nombre,
      correo: data.correo,
      telefono: data.telefono,
      region: data.region,
      comuna: data.comuna,
      password: data.password,
      rol: 'paciente'
    });

    if (!resultado?.exito) {
      setError(resultado?.campo || 'correo', { type: 'manual', message: resultado?.mensaje || 'Error al registrar' });
      return;
    }

    navigate('/login');
  };

  const regionEncontrada = regionesComunas.find(r => r.region === regionSeleccionada || r.nombre === regionSeleccionada);
  const comunasDisponibles = regionEncontrada?.comunas || [];

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="text-center mb-4">Registro de Paciente</h2>
              <Form onSubmit={handleSubmit(onSubmit)}>
                
                <Form.Group className="mb-3">
                  <Form.Label>Nombre Completo</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('nombre', { required: 'El nombre es obligatorio' })}
                    isInvalid={!!errors.nombre}
                  />
                  <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>RUT</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="12345678-9"
                    {...register('rut', { required: 'El RUT es obligatorio' })}
                    isInvalid={!!errors.rut}
                  />
                  <Form.Control.Feedback type="invalid">{errors.rut?.message}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    {...register('correo', { 
                      required: 'El correo es obligatorio',
                      pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' }
                    })}
                    isInvalid={!!errors.correo}
                  />
                  <Form.Control.Feedback type="invalid">{errors.correo?.message}</Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Región</Form.Label>
                      <Form.Select 
                        {...register('region', { 
                          required: 'Seleccione región',
                          onChange: () => setValue('comuna', '') // Limpia la comuna al cambiar de región
                        })} 
                        isInvalid={!!errors.region}
                      >
                        <option value="">Seleccione...</option>
                        {regionesComunas.map((reg, idx) => {
                          const nombreRegion = reg.region || reg.nombre || reg;
                          return (
                            <option key={idx} value={nombreRegion}>
                              {nombreRegion}
                            </option>
                          );
                        })}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.region?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Comuna</Form.Label>
                      <Form.Select 
                        {...register('comuna', { required: 'Seleccione comuna' })} 
                        disabled={!regionSeleccionada} 
                        isInvalid={!!errors.comuna}
                      >
                        <option value="">Seleccione...</option>
                        {comunasDisponibles.map((com, idx) => (
                          <option key={idx} value={com}>{com}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.comuna?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    {...register('password', { required: 'La contraseña es obligatoria', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
                    isInvalid={!!errors.password}
                  />
                  <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirmar Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    {...register('confirmPassword', { required: 'Confirme la contraseña' })}
                    isInvalid={!!errors.confirmPassword}
                  />
                  <Form.Control.Feedback type="invalid">{errors.confirmPassword?.message}</Form.Control.Feedback>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
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