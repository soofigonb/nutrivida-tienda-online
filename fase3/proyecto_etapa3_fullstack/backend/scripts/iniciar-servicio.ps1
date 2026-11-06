# Solicita credenciales de forma interactiva y las conserva solo durante la ejecución.
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('autenticacion-service', 'ordenes-service')]
    [string]$Servicio,
    [switch]$CrearAdministradorInicial,
    # Perfil opcional para una base con migraciones históricas ya aplicadas.
    [ValidateSet('supabase-existente')]
    [string]$Perfil,
    [string]$Issuer = 'http://localhost:8081',
    [string]$Jwks = 'http://localhost:8081/.well-known/jwks.json'
)

$ErrorActionPreference = 'Stop'
$prefijo = if ($Servicio -eq 'autenticacion-service') { 'AUTENTICACION' } else { 'ORDENES' }
$anteriores = @{}

function Set-VariableDeProceso([string]$Nombre, [string]$Valor) {
    # Recuerda el valor previo para restaurarlo al detener el servicio.
    if (-not $anteriores.ContainsKey($Nombre)) {
        $anteriores[$Nombre] = [Environment]::GetEnvironmentVariable($Nombre, 'Process')
    }
    [Environment]::SetEnvironmentVariable($Nombre, $Valor, 'Process')
}

try {
    # Órdenes ya tiene datos públicos confirmados; Enter conserva esos valores.
    $jdbc = if ($Servicio -eq 'ordenes-service') {
        $respuesta = Read-Host 'URL JDBC de órdenes (Enter para usar Supabase configurado)'
        if ([string]::IsNullOrWhiteSpace($respuesta)) {
            'jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require'
        } else { $respuesta }
    } else {
        Read-Host 'URL JDBC de este proyecto Supabase, sin usuario ni contraseña'
    }
    if ($jdbc -notmatch '^jdbc:postgresql://' -or $jdbc -match '(?i)(user|password)=|://[^/]*@') {
        throw 'Utiliza una URL JDBC sin credenciales; se solicitan por separado.'
    }
    if ($jdbc -notmatch '(?i)sslmode=(require|verify-ca|verify-full)') {
        throw 'La URL de Supabase debe incluir sslmode=require o una verificación SSL superior.'
    }
    Set-VariableDeProceso ($prefijo + '_DB_URL') $jdbc
    $usuarioDb = Read-Host 'Usuario PostgreSQL completo (en órdenes, Enter utiliza el configurado)'
    if ($Servicio -eq 'ordenes-service' -and [string]::IsNullOrWhiteSpace($usuarioDb)) {
        $usuarioDb = 'postgres.ngjummwpmhqdtabcieeg'
    }
    Set-VariableDeProceso ($prefijo + '_DB_USERNAME') $usuarioDb
    # SecureString evita que se vea la contraseña al escribirla.
    $clave = Read-Host 'Contraseña PostgreSQL' -AsSecureString
    Set-VariableDeProceso ($prefijo + '_DB_PASSWORD') ([Net.NetworkCredential]::new('', $clave).Password)
    Set-VariableDeProceso 'JWT_ISSUER' $Issuer

    if ($Servicio -eq 'autenticacion-service') {
        $carpeta = Read-Host 'Carpeta privada que contiene private.pem y public.pem'
        foreach ($tipo in @('private', 'public')) {
            $archivo = (Resolve-Path -LiteralPath (Join-Path $carpeta ($tipo + '.pem'))).Path
            $nombre = if ($tipo -eq 'private') { 'JWT_PRIVATE_KEY_LOCATION' } else { 'JWT_PUBLIC_KEY_LOCATION' }
            Set-VariableDeProceso $nombre ([Uri]::new($archivo).AbsoluteUri)
        }
        Set-VariableDeProceso 'BOOTSTRAP_ADMIN_ENABLED' 'false'
        if ($CrearAdministradorInicial) {
            Set-VariableDeProceso 'BOOTSTRAP_ADMIN_ENABLED' 'true'
            Set-VariableDeProceso 'BOOTSTRAP_ADMIN_EMAIL' (Read-Host 'Correo nuevo para el primer administrador')
            $claveAdmin = Read-Host 'Contraseña inicial del administrador' -AsSecureString
            Set-VariableDeProceso 'BOOTSTRAP_ADMIN_PASSWORD' ([Net.NetworkCredential]::new('', $claveAdmin).Password)
        }
    } else {
        Set-VariableDeProceso 'JWT_JWK_SET_URI' $Jwks
    }

    # Usa Java 17 si está instalado en la ubicación habitual de este equipo.
    if (Test-Path -LiteralPath 'C:\Program Files\Java\jdk-17') {
        Set-VariableDeProceso 'JAVA_HOME' 'C:\Program Files\Java\jdk-17'
    }
    $backend = Split-Path -Parent $PSScriptRoot
    # Maven recibe las variables; ninguna contraseña se escribe en un archivo.
    if ($Perfil -and $Servicio -ne 'autenticacion-service') {
        throw 'El perfil supabase-existente corresponde únicamente a autenticación.'
    }
    # La lista mantiene cada argumento separado, incluso si la ruta contiene espacios.
    $argumentosMaven = @('-f', (Join-Path $backend ($Servicio + '/pom.xml')), 'spring-boot:run')
    if ($Perfil) { $argumentosMaven += ('-Dspring-boot.run.profiles=' + $Perfil) }
    & mvn @argumentosMaven
    # Comunica los fallos de Maven al proceso que invocó este script.
    if ($LASTEXITCODE -ne 0) { throw 'El servicio no pudo iniciarse; revisa el registro anterior.' }
} finally {
    # Restaura el entorno al terminar y libera las referencias a los secretos.
    foreach ($nombre in $anteriores.Keys) {
        [Environment]::SetEnvironmentVariable($nombre, $anteriores[$nombre], 'Process')
    }
    $clave = $null
    $claveAdmin = $null
}
