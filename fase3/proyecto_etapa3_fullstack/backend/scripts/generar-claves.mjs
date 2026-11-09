// Importa { generateKeyPairSync } from 'node:crypto'.
import { generateKeyPairSync } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
// Importa { resolve, join } from 'node:path'.
import { resolve, join } from 'node:path'

const destino = process.argv[2]
if (!destino) throw new Error('Indique una carpeta privada fuera del repositorio.')
// Resuelve la ruta absoluta.
const carpeta = resolve(destino)
// Evita reemplazar claves existentes.
if (existsSync(join(carpeta, 'private.pem')) || existsSync(join(carpeta, 'public.pem'))) {
  throw new Error('La carpeta ya contiene claves. Seleccione una carpeta nueva para conservar el par existente.')
}
mkdirSync(carpeta, { recursive: true })
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  // Establece claves RSA de 2048 bits.
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  // Exporta la clave privada en formato PKCS8 PEM.
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
})
// Crea la clave privada sin sobrescribir.
writeFileSync(join(carpeta, 'private.pem'), privateKey, { flag: 'wx', mode: 0o600 })
writeFileSync(join(carpeta, 'public.pem'), publicKey, { flag: 'wx' })
console.log('Claves RSA creadas. Configure JWT_PRIVATE_KEY_LOCATION y JWT_PUBLIC_KEY_LOCATION con rutas file:.')
