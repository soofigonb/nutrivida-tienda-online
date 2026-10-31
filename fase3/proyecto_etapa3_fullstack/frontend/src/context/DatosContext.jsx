import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import iniciales from '../data/nutricionistas'
import { regionesComunas } from '../data/regionesComunas'

import {
  limpiarRun,
  validarRun,
  correoPermitido,
  soloLetras,
  telefonoChileno,
  fechaNacimientoValida,
} from '../utils/validacionesAdmin'

// ========================================
// 1. CONTEXTO Y CLAVES DE ALMACENAMIENTO
// ========================================

const DatosContext = createContext(null)

const CLAVE_PACIENTES = 'pacientesNutriVida'
const CLAVE_NUTRICIONISTAS = 'nutricionistasNutriVida'

// ========================================
// 2. FUNCIONES AUXILIARES
// ========================================

// Si los datos están dañados, informar sin sobrescribirlos.
function leerLista(clave, alternativa = []) {
  const contenido = localStorage.getItem(clave)

  if (contenido === null) {
    return alternativa
  }

  const lista = JSON.parse(contenido)

  if (
    !Array.isArray(lista) ||
    lista.some(
      (item) =>
        !item ||
        typeof item !== 'object' ||
        Array.isArray(item),
    )
  ) {
    throw new Error(
      `El formato de ${clave} no es válido. Revisa los datos guardados antes de continuar.`,
    )
  }

  return lista
}

function texto(valor) {
  return String(valor ?? '')
    .trim()
    .replace(/\s+/g, ' ')
}

function crearId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `registro-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`
  )
}

// ========================================
// 3. VALIDACIONES DE PACIENTES
// ========================================

function validarPaciente(datos, lista, id) {
  if (!validarRun(datos.run)) {
    return 'Ingresa un RUN válido.'
  }

  if (
    !soloLetras.test(datos.nombre) ||
    datos.nombre.length < 2 ||
    datos.nombre.length > 50
  ) {
    return 'Revisa el nombre del paciente.'
  }

  if (
    !soloLetras.test(datos.apellidos) ||
    datos.apellidos.length < 2 ||
    datos.apellidos.length > 100
  ) {
    return 'Revisa los apellidos del paciente.'
  }

  if (
    !correoPermitido.test(datos.correo) ||
    datos.correo.length > 100
  ) {
    return 'Utiliza un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.'
  }

  if (!telefonoChileno.test(datos.telefono)) {
    return 'Ingresa un celular chileno válido.'
  }

  if (
    datos.direccion.length < 5 ||
    datos.direccion.length > 300
  ) {
    return 'La dirección debe tener entre 5 y 300 caracteres.'
  }

  if (
    !fechaNacimientoValida(datos.fechaNacimiento)
  ) {
    return 'La fecha de nacimiento no es válida.'
  }

  const region = regionesComunas.find(
    (item) => item.region === datos.region,
  )

  if (!region?.comunas.includes(datos.comuna)) {
    return 'Selecciona una región y comuna válidas.'
  }

  if (
    datos.password.length < 6 ||
    !datos.password.trim()
  ) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }

  const otros = lista.filter(
    (item) => String(item.id) !== String(id),
  )

  if (
    otros.some(
      (item) =>
        limpiarRun(item.run || item.rut) ===
        datos.run,
    )
  ) {
    return 'El RUN ya está registrado.'
  }

  if (
    otros.some(
      (item) =>
        String(item.correo || '')
          .trim()
          .toLowerCase() === datos.correo,
    )
  ) {
    return 'El correo ya está registrado.'
  }

  return null
}

// ========================================
// 4. PROVEEDOR DE DATOS
// ========================================

export function DatosProvider({ children }) {
  const [cargando, setCargando] = useState(true)
  const [pacientes, setPacientes] = useState([])
  const [nutricionistas, setNutricionistas] =
    useState(iniciales)
  const [errorDatos, setErrorDatos] = useState('')

  // ========================================
  // 5. CARGAR Y SINCRONIZAR LOS DATOS
  // ========================================

  const recargarDatos = useCallback(() => {
    try {
      const pacientesGuardados =
        leerLista(CLAVE_PACIENTES)

      const profesionales = leerLista(
        CLAVE_NUTRICIONISTAS,
        iniciales,
      )

      setPacientes(pacientesGuardados)
      setNutricionistas(profesionales)
      setErrorDatos('')
    } catch (error) {
      setErrorDatos(
        error.message ||
          'No fue posible leer los datos del navegador.',
      )
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    recargarDatos()

    window.addEventListener(
      'storage',
      recargarDatos,
    )

    window.addEventListener(
      'nutrivida:datos',
      recargarDatos,
    )

    return () => {
      window.removeEventListener(
        'storage',
        recargarDatos,
      )

      window.removeEventListener(
        'nutrivida:datos',
        recargarDatos,
      )
    }
  }, [recargarDatos])

  // ========================================
  // 6. CREAR O ACTUALIZAR PACIENTES
  // ========================================

  function guardarPaciente(valores, id = null) {
    try {
      const lista = leerLista(CLAVE_PACIENTES)

      const anterior = id
        ? lista.find(
            (item) =>
              String(item.id) === String(id),
          )
        : null

      if (id && !anterior) {
        return {
          exito: false,
          mensaje: 'El paciente ya no existe.',
        }
      }

      // Una contraseña vacía al editar conserva la anterior.
      const password =
        valores.password ||
        anterior?.contrasena ||
        anterior?.password ||
        anterior?.clave ||
        ''

      const datos = {
        ...anterior,
        id: anterior?.id || crearId(),
        nombre: texto(valores.nombre),
        apellidos: texto(valores.apellidos),
        run: limpiarRun(valores.run),
        rut: limpiarRun(valores.run),
        correo: String(valores.correo || '')
          .trim()
          .toLowerCase(),
        telefono: texto(valores.telefono),
        direccion: texto(valores.direccion),
        fechaNacimiento:
          valores.fechaNacimiento || '',
        region: valores.region,
        comuna: valores.comuna,
        password,
        contrasena: password,
        rol: 'paciente',
      }

      const error = validarPaciente(
        datos,
        lista,
        id,
      )

      if (error) {
        return {
          exito: false,
          mensaje: error,
        }
      }

      const actualizada = id
        ? lista.map((item) =>
            String(item.id) === String(id)
              ? datos
              : item,
          )
        : [...lista, datos]

      localStorage.setItem(
        CLAVE_PACIENTES,
        JSON.stringify(actualizada),
      )

      setPacientes(actualizada)

      return { exito: true }
    } catch (error) {
      return {
        exito: false,
        mensaje:
          `No se pudo guardar el paciente. ${error.message}`,
      }
    }
  }

  // ========================================
  // 7. CREAR O ACTUALIZAR NUTRICIONISTAS
  // ========================================

  function guardarNutricionista(
    valores,
    id = null,
  ) {
    try {
      const lista = leerLista(
        CLAVE_NUTRICIONISTAS,
        iniciales,
      )

      const anterior = id
        ? lista.find(
            (item) =>
              String(item.id) === String(id),
          )
        : null

      if (id && !anterior) {
        return {
          exito: false,
          mensaje: 'El nutricionista ya no existe.',
        }
      }

      // El precio pertenece al plan o servicio.
      // No se guarda una tarifa adicional por profesional.
      const datos = {
        id: anterior?.id || crearId(),
        nombre: texto(valores.nombre),
        especialidad: texto(valores.especialidad),
        experiencia: texto(valores.experiencia),
        modalidad: valores.modalidad,
        foto: valores.foto,
      }

      if (
        datos.nombre.length < 3 ||
        datos.nombre.length > 100
      ) {
        return {
          exito: false,
          mensaje:
            'El nombre debe tener entre 3 y 100 caracteres.',
        }
      }

      if (
        datos.especialidad.length < 3 ||
        datos.especialidad.length > 150
      ) {
        return {
          exito: false,
          mensaje: 'Revisa la especialidad.',
        }
      }

      if (
        datos.experiencia.length < 10 ||
        datos.experiencia.length > 500
      ) {
        return {
          exito: false,
          mensaje:
            'La descripción debe tener entre 10 y 500 caracteres.',
        }
      }

      const modalidadesPermitidas = [
        'Presencial',
        'Online',
        'Presencial y online',
      ]

      if (
        !modalidadesPermitidas.includes(
          datos.modalidad,
        )
      ) {
        return {
          exito: false,
          mensaje: 'Selecciona una modalidad válida.',
        }
      }

      const fotografiaValida = iniciales.some(
        (item) => item.foto === datos.foto,
      )

      if (!fotografiaValida) {
        return {
          exito: false,
          mensaje:
            'Selecciona una fotografía del catálogo.',
        }
      }

      const actualizada = id
        ? lista.map((item) =>
            String(item.id) === String(id)
              ? datos
              : item,
          )
        : [...lista, datos]

      localStorage.setItem(
        CLAVE_NUTRICIONISTAS,
        JSON.stringify(actualizada),
      )

      setNutricionistas(actualizada)

      return { exito: true }
    } catch (error) {
      return {
        exito: false,
        mensaje:
          `No se pudo guardar el nutricionista. ${error.message}`,
      }
    }
  }

  // ========================================
  // 8. ELIMINAR REGISTROS
  // ========================================

  function eliminarRegistro(tipo, id) {
    try {
      const esPaciente = tipo === 'pacientes'

      const clave = esPaciente
        ? CLAVE_PACIENTES
        : CLAVE_NUTRICIONISTAS

      const lista = leerLista(
        clave,
        esPaciente ? [] : iniciales,
      )

      const registro = lista.find(
        (item) => String(item.id) === String(id),
      )

      if (!registro) {
        return {
          exito: false,
          mensaje: 'El registro ya no existe.',
        }
      }

      const citas = leerLista('citasNutriVida')
      const carrito = leerLista('carritoNutriVida')

      const campo = esPaciente
        ? 'pacienteId'
        : 'nutricionistaId'

      const tieneReferencias = [
        ...citas,
        ...carrito,
      ].some(
        (item) =>
          String(item[campo]) === String(id),
      )

      if (tieneReferencias) {
        return {
          exito: false,
          mensaje:
            'No se puede eliminar: tiene citas o reservas asociadas.',
        }
      }

      const actualizada = lista.filter(
        (item) => String(item.id) !== String(id),
      )

      localStorage.setItem(
        clave,
        JSON.stringify(actualizada),
      )

      if (esPaciente) {
        setPacientes(actualizada)
      } else {
        setNutricionistas(actualizada)
      }

      return { exito: true }
    } catch (error) {
      return {
        exito: false,
        mensaje:
          `No se pudo eliminar el registro. ${error.message}`,
      }
    }
  }

  // ========================================
  // 9. COMPARTIR LOS DATOS
  // ========================================

  return (
    <DatosContext.Provider
      value={{
        pacientes,
        nutricionistas,
        errorDatos,
        recargarDatos,
        guardarPaciente,
        guardarNutricionista,
        eliminarRegistro,
      }}
    >
      {cargando ? (
        <p role="status">Cargando datos...</p>
      ) : (
        children
      )}
    </DatosContext.Provider>
  )
}

// ========================================
// 10. ACCESO AL CONTEXTO
// ========================================

export function useDatos() {
  const contexto = useContext(DatosContext)

  if (!contexto) {
    throw new Error(
      'useDatos debe utilizarse dentro de DatosProvider.',
    )
  }

  return contexto
}