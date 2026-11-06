// Punto de entrada del servicio de órdenes.

// Paquete de la clase.
package cl.nutrivida.ordenes;

// Importa SpringApplication.
import org.springframework.boot.SpringApplication;
// Importa SpringBootApplication.
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Activa la creación de implementaciones para las interfaces marcadas con @FeignClient.
@org.springframework.cloud.openfeign.EnableFeignClients
// Inicia Spring Boot.
@SpringBootApplication
// Define la clase.
public class OrdenesServiceApplication {

	// Punto de entrada que Java ejecuta al iniciar la aplicación.
	public static void main(String[] args) {
		// Arranca este servicio Spring Boot usando su clase principal y los argumentos recibidos.
		SpringApplication.run(OrdenesServiceApplication.class, args);
	}

}
