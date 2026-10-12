import fotoCamila from '../assets/nutricionista1.png'
import fotoMateo from '../assets/nutricionista2.png'
import fotoValeria from '../assets/nutricionista3.png'
import fotoGabriel from '../assets/nutricionista4.png'

const nutricionistas = [
  {
    id: 1,
    nombre: 'Dra. Camila Torres',
    especialidad: 'Nutrición clínica y pérdida de peso',
    experiencia:
      '8 años de experiencia en tratamiento integral de sobrepeso y reeducación alimentaria.',
    foto: fotoCamila,
    modalidad: 'Presencial y online',
  },
  {
    id: 2,
    nombre: 'Lic. Mateo Silva',
    especialidad: 'Nutrición deportiva y alto rendimiento',
    experiencia:
      'Especialista en composición corporal y rendimiento físico para deportistas.',
    foto: fotoMateo,
    modalidad: 'Presencial',
  },
  {
    id: 3,
    nombre: 'Dra. Valeria Rojas',
    especialidad: 'Control de enfermedades metabólicas',
    experiencia:
      'Tratamiento personalizado para diabetes, hipertensión y dislipidemias.',
    foto: fotoValeria,
    modalidad: 'Presencial y online',
  },
  {
    id: 4,
    nombre: 'Lic. Gabriel Morales',
    especialidad: 'Alimentación vegetariana y vegana',
    experiencia:
      'Guía nutricional basada en plantas, suplementación B12 y balance de nutrientes.',
    foto: fotoGabriel,
    modalidad: 'Online',
  },
]

export default nutricionistas