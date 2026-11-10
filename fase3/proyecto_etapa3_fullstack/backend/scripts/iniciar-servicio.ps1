param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('autenticacion-service', 'ordenes-service', 'pacientes-service', 'agendamiento-service', 'catalogo-service', 'profesionales-service', 'api-gateway')]
    [string]$Servicio,
    [switch]$CrearAdministradorInicial,
    [string]$Issuer = 'http://localhost:8081',
    [string]$Jwks = 'http://localhost:8081/.well-known/jwks.json'
)

$ErrorActionPreference = 'Stop'
$prefijo = switch ($Servicio) {
    'autenticacion-service' { 'AUTENTICACION' }
    'ordenes-service'       { 'ORDENES' }
    'pacientes-service'     { 'PACIENTES' }
    'agendamiento-service'  { 'AGENDAMIENTO' }
    'catalogo-service'      { 'CATALOGO' }
    'profesionales-service' { 'PROFESIONALES' }
    'api-gateway'           { 'GATEWAY' }
}
$anteriores = @{}

function Set-VariableDeProceso([string]$Nombre, [string]$Valor) {
    if (-not $anteriores.ContainsKey($Nombre)) {
        $anteriores[$Nombre] = [Environment]::GetEnvironmentVariable($Nombre, 'Process')
    }
    [Environment]::SetEnvironmentVariable($Nombre, $Valor, 'Process')
}

try {
    if ($Servicio -ne 'api-gateway') {
        $jdbc = if ($Servicio -eq 'ordenes-service') {
            $respuesta = Read-Host 'URL JDBC de órdenes (Enter para usar Supabase configurado)'
            if ([string]::IsNullOrWhiteSpace($respuesta)) {
                'jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require'
            } else { $respuesta }
        } elseif ($Servicio -in @('pacientes-service', 'agendamiento-service')) {
            $respuesta = Read-Host "URL JDBC de $Servicio (Enter para usar Supabase configurado)"
            if ([string]::IsNullOrWhiteSpace($respuesta)) {
                'jdbc:postgresql://aws-1-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require'
            } else { $respuesta }
        } elseif ($Servicio -in @('catalogo-service', 'profesionales-service')) {
            $respuesta = Read-Host "URL JDBC de $Servicio (Enter para usar Supabase configurado)"
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
        $usuarioDb = Read-Host 'Usuario PostgreSQL completo (Enter utiliza el configurado por defecto)'
        if ($Servicio -eq 'ordenes-service' -and [string]::IsNullOrWhiteSpace($usuarioDb)) {
            $usuarioDb = 'postgres.ngjummwpmhqdtabcieeg'
        } elseif ($Servicio -in @('pacientes-service', 'agendamiento-service') -and [string]::IsNullOrWhiteSpace($usuarioDb)) {
            $usuarioDb = 'postgres.nyaxmfgatgsrspxdfxwf'
        } elseif ($Servicio -in @('catalogo-service', 'profesionales-service') -and [string]::IsNullOrWhiteSpace($usuarioDb)) {
            $usuarioDb = 'postgres.nodhgpcmnwipdefjcssj'
        }
        Set-VariableDeProceso ($prefijo + '_DB_USERNAME') $usuarioDb
        $claveVar = [Environment]::GetEnvironmentVariable($prefijo + '_DB_PASSWORD', 'Process')
        if ([string]::IsNullOrWhiteSpace($claveVar)) {
            $clave = Read-Host 'Contraseña PostgreSQL' -AsSecureString
            Set-VariableDeProceso ($prefijo + '_DB_PASSWORD') ([Net.NetworkCredential]::new('', $clave).Password)
        }
    }
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
    } elseif ($Servicio -eq 'ordenes-service') {
        Set-VariableDeProceso 'JWT_JWK_SET_URI' $Jwks
    }

    if (Test-Path -LiteralPath 'C:\Program Files\Java\jdk-17') {
        Set-VariableDeProceso 'JAVA_HOME' 'C:\Program Files\Java\jdk-17'
    }
    $backend = Split-Path -Parent $PSScriptRoot
    $argumentosMaven = @('-f', (Join-Path $backend ($Servicio + '/pom.xml')), 'spring-boot:run')
    $comandoMvn = if (Get-Command mvn -ErrorAction SilentlyContinue) {
        'mvn'
    } elseif (Test-Path -LiteralPath 'C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.2\plugins\maven-plugin\lib\maven3\bin\mvn.cmd') {
        'C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.2\plugins\maven-plugin\lib\maven3\bin\mvn.cmd'
    } else {
        'mvn'
    }
    & $comandoMvn @argumentosMaven
    if ($LASTEXITCODE -ne 0) { throw 'El servicio no pudo iniciarse; revisa el registro anterior.' }
} finally {
    foreach ($nombre in $anteriores.Keys) {
        [Environment]::SetEnvironmentVariable($nombre, $anteriores[$nombre], 'Process')
    }
    $clave = $null
    $claveAdmin = $null
}
