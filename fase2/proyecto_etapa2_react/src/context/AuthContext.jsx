import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Lectura segura de la sesión inicial
  const [usuario, setUsuario] = useState(() => {
    try {
      const saved = localStorage.getItem('sesionNutriVida');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error al leer sesionNutriVida desde localStorage:', error);
      localStorage.removeItem('sesionNutriVida'); // Limpiamos el dato corrupto
      return null;
    }
  });

  // Función auxiliar para obtener pacientes de forma segura
  const obtenerPacientesGuardados = () => {
    try {
      const saved = localStorage.getItem('pacientesNutriVida');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error al leer pacientesNutriVida desde localStorage:', error);
      return [];
    }
  };

  // Funciones de limpieza
  const limpiarRut = (rut) => (rut || '').replace(/[^0-9kK]/g, '').toUpperCase();
  const limpiarCorreo = (correo) => (correo || '').replace(/\s+/g, '').toLowerCase();

  const registrarPaciente = (nuevoPaciente) => {
    // 2. Lectura protegida de la lista de pacientes
    const pacientes = obtenerPacientesGuardados();
    
    const rutNuevo = limpiarRut(nuevoPaciente.rut);
    const correoNuevo = limpiarCorreo(nuevoPaciente.correo);

    if (pacientes.some(p => limpiarRut(p.rut) === rutNuevo)) {
      return { exito: false, campo: 'rut', mensaje: 'El RUT ya está registrado' };
    }

    if (pacientes.some(p => limpiarCorreo(p.correo) === correoNuevo)) {
      return { exito: false, campo: 'correo', mensaje: 'El correo ya está registrado' };
    }

    const pacienteAInsertar = {
      ...nuevoPaciente,
      rut: rutNuevo,
      correo: correoNuevo,
      id: Date.now().toString()
    };

    pacientes.push(pacienteAInsertar);

    try {
      localStorage.setItem('pacientesNutriVida', JSON.stringify(pacientes));
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
      return { exito: false, mensaje: 'No se pudo guardar el registro en el navegador' };
    }

    return { exito: true };
  };

  const iniciarSesion = (correo, password) => {
    const correoLimpio = limpiarCorreo(correo);

    if (correoLimpio === 'admin@nutrivida.cl' && password === 'admin123') {
      const adminUser = { id: 'admin', nombre: 'Administrador', correo: correoLimpio, rol: 'admin' };
      setUsuario(adminUser);
      try {
        localStorage.setItem('sesionNutriVida', JSON.stringify(adminUser));
      } catch (error) {
        console.error('Error al guardar la sesión:', error);
      }
      return { exito: true, usuario: adminUser };
    }

    // 3. Lectura protegida al iniciar sesión
    const pacientes = obtenerPacientesGuardados();
    
    const paciente = pacientes.find(
      p => limpiarCorreo(p.correo) === correoLimpio && p.password === password
    );

    if (paciente) {
      const userSesion = { id: paciente.id, nombre: paciente.nombre, correo: paciente.correo, rol: paciente.rol };
      setUsuario(userSesion);
      try {
        localStorage.setItem('sesionNutriVida', JSON.stringify(userSesion));
      } catch (error) {
        console.error('Error al guardar la sesión:', error);
      }
      return { exito: true, usuario: userSesion };
    }

    return { exito: false, mensaje: 'Credenciales incorrectas' };
  };

  const cerrarSesion = () => {
    setUsuario(null);
    try {
      localStorage.removeItem('sesionNutriVida');
    } catch (error) {
      console.error('Error al eliminar la sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, registrarPaciente, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
};