import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import iniciales from '../data/nutricionistas'
import { AuthContext } from './AuthContext'
import { darDeBajaPaciente, guardarPacienteRemoto, listarPacientes } from '../services/pacientes'
import { darDeBajaProfesional, guardarProfesional, listarProfesionales } from '../services/profesionales'
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
  const cuenta = useContext(AuthContext)?.usuario
  const adminId = cuenta?.rol === 'ADMINISTRADOR' ? cuenta.id : null
  const [pacientes, setPacientes] = useState([])
  const [nutricionistas, setNutricionistas] =
    useState([])
  const [errorDatos, setErrorDatos] = useState('')
  const [errorProfesionales, setErrorProfesionales] = useState('')

  useEffect(() => {
    let activo = true
    listarProfesionales().then(lista => {
      if (activo) setNutricionistas(lista)
    }).catch(error => {
      if (activo) setErrorProfesionales(error.message || 'No se pudieron consultar los profesionales.')
    })
    return () => { activo = false }
  }, [])

  useEffect(() => {
    // Retira la cache antigua de fichas.
    try { localStorage.removeItem(CLAVE_PACIENTES) } catch { /* Solo se usa la API. */ }
  }, [])

  useEffect(() => {
    setPacientes([])
    setErrorDatos('')
    if (!adminId) return
    let activo = true
    listarPacientes().then(lista => {
      if (activo) setPacientes(lista)
    }).catch(error => {
      if (activo) setErrorDatos(error.message)
    })
    return () => { activo = false }
  }, [adminId])

  async function guardarPaciente(valores, id = null) {
    try {
      if (id && !pacientes.some(item => String(item.id) === String(id))) {
        return { exito: false, mensaje: 'El paciente ya no existe.' }
      }

      const datos = {
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
      }

      const error = validarPaciente(
        datos,
        pacientes,
        id,
      )

      if (error) {
        return {
          exito: false,
          mensaje: error,
        }
      }

      const guardado = await guardarPacienteRemoto(datos, id)
      setPacientes(lista => id
        ? lista.map(item => String(item.id) === String(id) ? guardado : item)
        : [...lista, guardado])

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

  async function guardarNutricionista(
    valores,
    id = null,
  ) {
    try {
      const anterior = id
        ? nutricionistas.find(
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

      const guardado = await guardarProfesional(datos, id, anterior)
      setNutricionistas(lista => id
        ? lista.map(item => String(item.id) === String(id) ? guardado : item)
        : [...lista, guardado])
      setErrorProfesionales('')

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

  async function eliminarRegistro(tipo, id) {
    try {
      const esPaciente = tipo === 'pacientes'

      const lista = esPaciente
        ? pacientes
        : nutricionistas

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

      if (esPaciente) {
        await darDeBajaPaciente(id)
        setPacientes(actualizada)
      } else {
        await darDeBajaProfesional(id)
        setNutricionistas(lista => lista.filter(item => String(item.id) !== String(id)))
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
        errorProfesionales,
        guardarPaciente,
        guardarNutricionista,
        eliminarRegistro,
      }}
    >
      {children}
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
