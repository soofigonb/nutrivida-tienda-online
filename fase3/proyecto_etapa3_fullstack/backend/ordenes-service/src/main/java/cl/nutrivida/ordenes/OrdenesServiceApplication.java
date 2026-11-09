// Punto de entrada del servicio de órdenes.

// Paquete de la clase.
package cl.nutrivida.ordenes;

// Importa SpringApplication.
import org.springframework.boot.SpringApplication;
// Importa SpringBootApplication.
import org.springframework.boot.autoconfigure.SpringBootApplication;

@org.springframework.cloud.openfeign.EnableFeignClients
// Inicia Spring Boot.
@SpringBootApplication
// Define la clase.
public class OrdenesServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(OrdenesServiceApplication.class, args);
	}

}
