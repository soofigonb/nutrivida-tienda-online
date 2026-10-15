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

  // Función auxiliar para obtener pacientes de forma segura y unificar claves (run/rut, contrasena/password)
  const obtenerPacientesGuardados = () => {
    try {
      const saved = localStorage.getItem('pacientesNutriVida');
      const parsed = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(parsed)) return [];

      // Mapeamos para garantizar que datos antiguos tengan tanto run/rut como contrasena/password
      return parsed.map((p) => {
        const valRun = (p.run || p.rut || '').replace(/[^0-9kK]/g, '').toUpperCase();
        const valPass = p.contrasena || p.password || p.clave || '';
        return {
          ...p,
          run: valRun,
          rut: valRun,
          contrasena: valPass,
          password: valPass
        };
      });
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
    
    const rutNuevo = limpiarRut(nuevoPaciente.run || nuevoPaciente.rut);
    const correoNuevo = limpiarCorreo(nuevoPaciente.correo);
    const passNueva = nuevoPaciente.contrasena || nuevoPaciente.password || '';

    if (pacientes.some(p => limpiarRut(p.run || p.rut) === rutNuevo)) {
      return { exito: false, campo: 'rut', mensaje: 'El RUN/RUT ya está registrado' };
    }

    if (pacientes.some(p => limpiarCorreo(p.correo) === correoNuevo)) {
      return { exito: false, campo: 'correo', mensaje: 'El correo ya está registrado' };
    }

    // Guardamos el registro con ambas nomenclaturas (run/rut y contrasena/password) para unificar con el CRUD
    const pacienteAInsertar = {
      ...nuevoPaciente,
      run: rutNuevo,
      rut: rutNuevo,
      correo: correoNuevo,
      contrasena: passNueva,
      password: passNueva,
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

  const iniciarSesion = (identificador, password) => {
    const busquedaLimpia = limpiarCorreo(identificador);
    const rutBuscado = limpiarRut(identificador);

    // Administrador por defecto
    if (
      (busquedaLimpia === 'admin@nutrivida.cl' || rutBuscado === 'ADMIN') &&
      password === 'admin123'
    ) {
      const adminUser = { id: 'admin', nombre: 'Administrador', correo: 'admin@nutrivida.cl', rol: 'admin' };
      setUsuario(adminUser);
      try {
        localStorage.setItem('sesionNutriVida', JSON.stringify(adminUser));
      } catch (error) {
        console.error('Error al guardar la sesión:', error);
      }
      return { exito: true, usuario: adminUser };
    }

    // 3. Lectura protegida al iniciar sesión (permite ingresar por Correo o RUN/RUT)
    const pacientes = obtenerPacientesGuardados();
    
    const paciente = pacientes.find((p) => {
      const coincideCorreo = limpiarCorreo(p.correo) === busquedaLimpia;
      const coincideRun = limpiarRut(p.run || p.rut) === rutBuscado;
      const coincidePass = (p.contrasena || p.password) === password;

      return (coincideCorreo || coincideRun) && coincidePass;
    });

    if (paciente) {
      const userSesion = {
        id: paciente.id,
        nombre: paciente.nombre,
        correo: paciente.correo,
        run: paciente.run || paciente.rut,
        rut: paciente.rut || paciente.run,
        rol: paciente.rol
      };
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