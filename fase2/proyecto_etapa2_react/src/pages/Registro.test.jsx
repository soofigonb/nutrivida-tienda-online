import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Registro from './Registro';

describe('Pruebas en el componente Registro', () => {
  it('Debe renderizar el título "Registro de Paciente"', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Registro />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Registro de Paciente/i)).toBeInTheDocument();
  });
});