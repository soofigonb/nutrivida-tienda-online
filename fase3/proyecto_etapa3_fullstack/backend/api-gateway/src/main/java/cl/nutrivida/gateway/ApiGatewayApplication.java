// Punto de entrada del gateway que recibe las llamadas del frontend y las dirige a los servicios.

// Paquete de la clase.
package cl.nutrivida.gateway;

// Importa SpringApplication.
import org.springframework.boot.SpringApplication;
// Importa SpringBootApplication.
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Inicia Spring Boot.
@SpringBootApplication
// Define la clase.
public class ApiGatewayApplication {

	// Punto de entrada que Java ejecuta al iniciar la aplicación.
	public static void main(String[] args) {
		// Arranca este servicio Spring Boot usando su clase principal y los argumentos recibidos.
		SpringApplication.run(ApiGatewayApplication.class, args);
	}

}
