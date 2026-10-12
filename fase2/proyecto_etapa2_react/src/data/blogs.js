import imagenAntiinflamatoria from '../assets/blog1.png'
import imagenHidratacion from '../assets/blog2.png'

// Contenido original de los artículos de la EV1.
const blogs = [
  {
    id: 1,
    ruta: '/blogs/alimentacion-antiinflamatoria',
    etiqueta: 'Tips de nutrición',
    tituloTarjeta: 'Guía de alimentación antiinflamatoria',
    descripcion:
      'Conoce alimentos que ayudan a reducir la inflamación, mejorar la digestión y aumentar tus niveles de energía.',
    titulo: 'Guía de alimentación antiinflamatoria para el día a día',
    autor: 'Dra. Camila Torres',
    fecha: 'Septiembre de 2026',
    tiempoLectura: '4 minutos de lectura',
    imagen: imagenAntiinflamatoria,
    textoAlternativo: 'Plato con alimentos saludables y antiinflamatorios',
    pieImagen:
      'Una alimentación variada puede contribuir al bienestar general.',
    introduccion:
      'La inflamación de bajo grado puede ser causada por el estrés, la falta de sueño y las dietas ricas en alimentos ultraprocesados. Adoptar un patrón alimenticio rico en antioxidantes puede ayudar a prevenir problemas de salud a largo plazo.',
    secciones: [
      {
        titulo: '1. ¿En qué consiste un patrón antiinflamatorio?',
        texto:
          'No se trata de una dieta restrictiva, sino de elegir alimentos ricos en antioxidantes, grasas saludables como Omega-3 y fibra soluble para proteger las células del daño oxidativo.',
      },
      {
        titulo: '2. Alimentos claves para incluir',
        lista: [
          {
            titulo: 'Vegetales de hoja verde:',
            texto: 'espinaca, acelga y kale.',
          },
          {
            titulo: 'Frutas ricas en antioxidantes:',
            texto: 'arándanos, frutillas y cítricos.',
          },
          {
            titulo: 'Grasas saludables:',
            texto: 'aceite de oliva extra virgen, palta y frutos secos.',
          },
          {
            titulo: 'Especias naturales:',
            texto: 'cúrcuma y jengibre fresco.',
          },
        ],
      },
      {
        titulo: '3. Alimentos que se recomienda reducir',
        texto:
          'Se aconseja reducir el consumo de azúcares refinados, harinas ultraprocesadas y bebidas azucaradas.',
      },
    ],
    iconoConsejo: 'bi-lightbulb',
    consejo:
      'Incorpora los cambios de manera gradual. Comienza agregando más vegetales y frutas a tus comidas antes de eliminar completamente otros alimentos.',
    preguntaFinal: '¿Necesitas una orientación personalizada?',
  },
  {
    id: 2,
    ruta: '/blogs/hidratacion-deportiva',
    etiqueta: 'Nutrición deportiva',
    tituloTarjeta: 'Hidratación y rendimiento deportivo',
    descripcion:
      'Aprende estrategias de hidratación para antes, durante y después del ejercicio.',
    titulo: 'Estrategias de hidratación y rendimiento en el deporte',
    autor: 'Lic. Mateo Silva',
    fecha: 'Septiembre de 2026',
    tiempoLectura: '4 minutos de lectura',
    imagen: imagenHidratacion,
    textoAlternativo: 'Botella de agua y elementos para hidratación deportiva',
    pieImagen:
      'Una hidratación adecuada ayuda a mantener el rendimiento durante la actividad física.',
    introduccion:
      'Una deshidratación ligera durante la actividad física puede reducir el rendimiento deportivo y aumentar la fatiga cardiovascular. Por eso es importante hidratarse antes, durante y después del ejercicio.',
    secciones: [
      {
        titulo: '1. Antes del ejercicio: preparar el cuerpo',
        texto:
          'Se recomienda ingerir entre 400 ml y 600 ml de agua aproximadamente dos horas antes de comenzar el entrenamiento. Esto contribuye a regular la temperatura corporal y mantener una hidratación adecuada.',
      },
      {
        titulo: '2. Durante el ejercicio: reponer líquidos',
        texto:
          'Durante el ejercicio es importante consumir líquidos en cantidades pequeñas y frecuentes, sin esperar a sentir demasiada sed.',
        lista: [
          {
            titulo: 'Ejercicios de menos de 60 minutos:',
            texto: 'generalmente el agua puede ser suficiente.',
          },
          {
            titulo: 'Ejercicios de más de 60 minutos:',
            texto: 'puede ser necesario incorporar electrolitos.',
          },
          {
            titulo: 'Entrenamientos intensos:',
            texto: 'se deben reponer minerales como sodio y potasio.',
          },
          {
            titulo: 'Ambientes calurosos:',
            texto: 'es importante aumentar la atención a la hidratación.',
          },
        ],
      },
      {
        titulo: '3. Después del ejercicio: recuperar líquidos',
        texto:
          'Consumir líquidos después del ejercicio ayuda a recuperar el agua y los minerales perdidos mediante la transpiración. También puede acompañarse con alimentos que aporten carbohidratos y proteínas.',
      },
    ],
    iconoConsejo: 'bi-droplet',
    consejo:
      'Lleva siempre una botella de agua durante tus entrenamientos y bebe líquidos de manera frecuente. La cantidad necesaria dependerá de la intensidad, duración y temperatura del ambiente.',
    preguntaFinal:
      '¿Necesitas un plan de hidratación adaptado a tu actividad?',
  },
]

export default blogs