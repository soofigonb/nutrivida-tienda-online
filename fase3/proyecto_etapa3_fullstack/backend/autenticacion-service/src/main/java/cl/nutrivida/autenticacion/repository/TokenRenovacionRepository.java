// Repositorio Spring Data.

// Paquete de la clase.
package cl.nutrivida.autenticacion.repository;

// Importa Optional.
import java.util.Optional;
// Importa UUID.
import java.util.UUID;
// Importa LockModeType.
import jakarta.persistence.LockModeType;
// Importa los tipos del paquete.
import org.springframework.data.jpa.repository.*;
// Importa Param.
import org.springframework.data.repository.query.Param;
// Importa TokenRenovacion.
import cl.nutrivida.autenticacion.model.TokenRenovacion;

public interface TokenRenovacionRepository extends JpaRepository<TokenRenovacion, UUID> {
    // Bloquea el token durante su renovación.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from TokenRenovacion t join fetch t.usuario u join fetch u.rol join fetch u.estadoUsuario where t.tokenHash = :hash")
    // Devuelve el token cuyo hash coincide con :hash.
    Optional<TokenRenovacion> buscarParaRenovar(@Param("hash") String hash);

    // Indica que la consulta siguiente modifica filas.
    @Modifying
    @Query("update TokenRenovacion t set t.revocadoEn = CURRENT_TIMESTAMP where t.usuario.id = :usuario and t.revocadoEn is null")
    void revocarPorUsuario(@Param("usuario") UUID usuario);
}
