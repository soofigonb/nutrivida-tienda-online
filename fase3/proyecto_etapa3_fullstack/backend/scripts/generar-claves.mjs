// Importa { generateKeyPairSync } from 'node:crypto'.
import { generateKeyPairSync } from 'node:crypto'
// Importa { existsSync, mkdirSync, writeFileSync } from 'node:fs'.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
// Importa { resolve, join } from 'node:path'.
import { resolve, join } from 'node:path'

// Lee el tercer argumento del proceso: node ocupa la posición 0, el script la 1 y la carpeta elegida la 2.
const destino = process.argv[2]
// Interrumpe el script si falta la carpeta privada de destino.
if (!destino) throw new Error('Indique una carpeta privada fuera del repositorio.')
// Resuelve la ruta absoluta.
const carpeta = resolve(destino)
// Evita reemplazar claves existentes.
if (existsSync(join(carpeta, 'private.pem')) || existsSync(join(carpeta, 'public.pem'))) {
  // Informa que debe utilizarse una carpeta nueva para conservar las claves y las sesiones existentes.
  throw new Error('La carpeta ya contiene claves. Seleccione una carpeta nueva para conservar el par existente.')
}
// Crea la carpeta elegida y sus directorios padres si hacen falta.
mkdirSync(carpeta, { recursive: true })
// Genera un par RSA y extrae sus dos resultados mediante desestructuración.
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  // Establece claves RSA de 2048 bits.
  modulusLength: 2048,
  // Exporta la clave pública en formato SPKI, representada como texto PEM para que Java pueda cargarla.
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  // Exporta la clave privada en formato PKCS8 PEM.
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
})
// wx evita reemplazar accidentalmente una clave ya utilizada por sesiones vigentes.
// Crea la clave privada sin sobrescribir.
writeFileSync(join(carpeta, 'private.pem'), privateKey, { flag: 'wx', mode: 0o600 })
// Escribe la clave pública del mismo par y utiliza wx para no sobrescribir un archivo ya existente.
writeFileSync(join(carpeta, 'public.pem'), publicKey, { flag: 'wx' })
// Muestra una confirmación y los nombres de las variables a configurar.
console.log('Claves RSA creadas. Configure JWT_PRIVATE_KEY_LOCATION y JWT_PUBLIC_KEY_LOCATION con rutas file:.')
