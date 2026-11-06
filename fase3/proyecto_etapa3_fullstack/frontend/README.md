# NutriVida fase 3

Frontend React con Vite y React Bootstrap. Se integra con los servicios de autenticación y órdenes mediante el gateway, sin Eureka. Fase 2 se conserva por separado como referencia de la entrega anterior.

## Ejecutar

Requiere Node.js y las dependencias de `package-lock.json`. Desde esta carpeta:

```powershell
npm ci
npm run dev
```

Vite utiliza `http://localhost:5173` y reenvía `/api` al gateway de `http://localhost:8080`. El puerto es fijo para coincidir con el origen autorizado por autenticación. Las URL reales de producción pueden indicarse mediante `VITE_API_URL`; nunca incluir secretos ni claves privadas en variables del frontend.

## Sesión y permisos

Login, renovación y logout llaman al backend. El JWT de acceso se mantiene en memoria y la renovación utiliza una cookie HttpOnly. No existe una cuenta administrativa fija ni se aceptan identidades de `sesionNutriVida` como prueba de autenticación.

- Administrador: `/admin/cuentas`, catálogo y gestión de órdenes, además de las secciones de perfiles pendientes de integrar por el equipo.
- Vendedor: catálogo y órdenes con lectura de lista y detalle; las demás rutas lo redirigen a su panel.
- Cliente: tienda, carrito y `/mis-ordenes`.

El backend es responsable de validar los mismos permisos; ocultar controles no concede ni sustituye autorización.

## Carrito y registro

El carrito crea órdenes pendientes con el catálogo real, precios calculados en el servidor y una clave de reintento persistida para evitar duplicados. Conserva los borradores de consultas. No afirma haber confirmado una cita ni haber realizado un cobro.

El registro separa credenciales y perfil de paciente. Si pacientes-service no responde, indica que la cuenta ya se creó y que el perfil está pendiente. Los endpoints de pacientes y catálogo deben acordarse con sus responsables; la aplicación muestra sus errores y no finge persistencia.

Los datos estáticos de presentación y las pantallas antiguas de administración de perfiles siguen siendo demostraciones mientras se completa la integración de los servicios de Nitsi y Jonathan. Las credenciales de esos datos anteriores no se utilizan para iniciar sesión.

## Comprobaciones

```powershell
npm run test -- --run --maxWorkers=2
npm run lint
npm run build
```

Las pruebas de fase 3 se adaptaron a la autenticación real por API, los roles canónicos, la recuperación de sesión y las órdenes. No deben confundirse sus resultados con el informe histórico de EV2.
