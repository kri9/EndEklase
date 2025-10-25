package lv.app.backend.model.repository;

import lv.app.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    @Query(value="""
            SELECT u.* FROM users u
            join invoice i on i.user_id = u.id
            where i.id=?1
            """,
            nativeQuery = true)
    User findDeletedByInvoice(Long invoiceId);
}
