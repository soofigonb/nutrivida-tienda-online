// Punto de entrada del servicio de autenticación.

// Paquete de la clase.
package cl.nutrivida.autenticacion;

// Importa SpringApplication.
import org.springframework.boot.SpringApplication;
// Importa SpringBootApplication.
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Inicia Spring Boot.
@SpringBootApplication
// Define la clase.
public class AutenticacionServiceApplication {

	// Punto de entrada que Java ejecuta al iniciar la aplicación.
	public static void main(String[] args) {
		// Arranca este servicio Spring Boot usando su clase principal y los argumentos recibidos.
		SpringApplication.run(AutenticacionServiceApplication.class, args);
	}

}
