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

	public static void main(String[] args) {
		SpringApplication.run(AutenticacionServiceApplication.class, args);
	}

}
