import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem('sesionNutriVida');
    return saved ? JSON.parse(saved) : null;
  });

  const registrarPaciente = (nuevoPaciente) => {
    const pacientes = JSON.parse(localStorage.getItem('pacientesNutriVida') || '[]');
    
    // Validar duplicados de RUT o Correo
    if (pacientes.some(p => p.rut === nuevoPaciente.rut)) {
      return { exito: false, campo: 'rut', mensaje: 'El RUT ya está registrado' };
    }
    if (pacientes.some(p => p.correo === nuevoPaciente.correo)) {
      return { exito: false, campo: 'correo', mensaje: 'El correo ya está registrado' };
    }

    const pacienteConId = { ...nuevoPaciente, id: Date.now().toString() };
    pacientes.push(pacienteConId);
    localStorage.setItem('pacientesNutriVida', JSON.stringify(pacientes));
    return { exito: true };
  };

  const iniciarSesion = (correo, password) => {
    // Cuenta de Administrador de prueba
    if (correo === 'admin@nutrivida.cl' && password === 'admin123') {
      const adminUser = { id: 'admin', nombre: 'Administrador', correo, rol: 'admin' };
      setUsuario(adminUser);
      localStorage.setItem('sesionNutriVida', JSON.stringify(adminUser));
      return { exito: true, usuario: adminUser };
    }

    const pacientes = JSON.parse(localStorage.getItem('pacientesNutriVida') || '[]');
    const paciente = pacientes.find(p => p.correo === correo && p.password === password);

    if (paciente) {
      const userSesion = { id: paciente.id, nombre: paciente.nombre, correo: paciente.correo, rol: paciente.rol };
      setUsuario(userSesion);
      localStorage.setItem('sesionNutriVida', JSON.stringify(userSesion));
      return { exito: true, usuario: userSesion };
    }

    return { exito: false, mensaje: 'Credenciales incorrectas' };
  };

  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem('sesionNutriVida');
  };

  return (
    <AuthContext.Provider value={{ usuario, registrarPaciente, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
};