// Describe título, versión y esquema Bearer de la documentación Swagger.

// Paquete de la clase.
package cl.nutrivida.autenticacion.config;

// Importa los tipos del paquete.
import io.swagger.v3.oas.annotations.*;
// Importa Info.
import io.swagger.v3.oas.annotations.info.Info;
// Importa los tipos del paquete.
import io.swagger.v3.oas.annotations.security.*;
// Importa SecuritySchemeType.
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
// Importa Configuration.
import org.springframework.context.annotation.Configuration;

// Configuración de Spring.
@Configuration
// Define el título visible y la versión v1 de la documentación OpenAPI.
@OpenAPIDefinition(info = @Info(title = "NutriVida - Autenticación", version = "v1"))
// Documenta un mecanismo HTTP Bearer llamado bearerAuth.
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT")
// Define la clase.
public class OpenApiConfig {}
